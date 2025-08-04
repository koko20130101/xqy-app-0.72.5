import {PermissionsAndroid, Platform} from 'react-native';
import {
	BleError,
	BleErrorCode,
	BleManager,
	Device,
	ScanMode,
	State as BluetoothState,
	type DeviceId,
	type Subscription,
	type UUID,
	type Characteristic,
	type TransactionId,
} from 'react-native-ble-plx';
import Toast from 'react-native-toast-message';

const deviceNotConnectedErrorText = '设备还未连接';

class BLEServiceInstance {
	manager: BleManager;
	device: Device | null; // 当前连接的设备
	serviceUUID: UUID; // 当前连接设备的服务ID
	characteristicUUID: UUID; // 当前连接设备的特征ID
	status: BluetoothState | null; // 状态
	subscription: Subscription | null; // 状态监听
	characteristicMonitor: Subscription | null; // 特征监听
	isCharacteristicMonitorDisconnectExpected = false; // 监听状态
	constructor() {
		this.device = null;
		this.serviceUUID = '';
		this.characteristicUUID = '';
		this.subscription = null;
		this.status = null;
		this.characteristicMonitor = null;
		this.manager = new BleManager();
	}

	initializeBLE = (callback: (status: number) => void) => {
		return new Promise<void>(resolve => {
			this.subscription?.remove();
			// 订阅蓝牙状态
			this.subscription = this.manager.onStateChange(state => {
				this.status = state;
				switch (state) {
					case BluetoothState.Unsupported:
						// 不支持
						this.showErrorToast('您的手机不支持蓝牙');
						break;
					case BluetoothState.Unauthorized:
						// 未授权使用蓝牙,弹出授权
						this.requestBluetoothPermission();
						break;
					case BluetoothState.PoweredOff:
						// 蓝牙关闭
						this.showErrorToast('请打开蓝牙');
						callback(0);
						break;
					case BluetoothState.PoweredOn:
						// 蓝牙打开
						callback(1);
						resolve();
						break;
				}
			}, true);
		});
	};

	// 授权
	requestBluetoothPermission = async () => {
		if (Platform.OS === 'ios') {
			return true;
		}
		if (Platform.OS === 'android') {
			const apiLevel = parseInt(Platform.Version.toString(), 10);

			if (apiLevel < 31 && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
				const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
				return granted === PermissionsAndroid.RESULTS.GRANTED;
			}
			if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN && PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
				const result = await PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
					PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
				]);

				return (
					result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
					result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
				);
			}
		}
		this.showErrorToast('未授权');

		return false;
	};

	// 扫描设备
	scanDevices = async (callback: Function) => {
		// 扫描模式scanMode,默认是ScanMode.LowPower 搜索不灵敏
		this.manager.startDeviceScan(null, {scanMode: ScanMode.Balanced}, (error, device) => {
			if (error) {
				this.onError(error);
				this.stopScan();
				return;
			}
			if (device) {
				callback(device);
			}
		});
	};

	// 停止扫描
	stopScan = () => {
		this.manager.stopDeviceScan();
		this.status = null;
	};

	// 连接设备
	connectToDevice = (deviceId: DeviceId) => {
		return new Promise<Device>((resolve, reject) => {
			this.manager.stopDeviceScan();
			this.manager
				.connectToDevice(deviceId)
				.then(device => {
					this.device = device;
					resolve(device);
				})
				.catch(error => {
					if (error.errorCode === BleErrorCode.DeviceAlreadyConnected && this.device) {
						resolve(this.device);
					} else {
						reject(error);
					}
				});
		});
	};

	// 断开连接
	disConnectDevice = async () => {
		if (!this.device) return;
		return this.manager.cancelDeviceConnection(this.device.id);
	};

	// 发现服务和特征
	discoverAllServicesAndCharacteristicsForDevice = () => {
		return new Promise<Device>((resolve, reject) => {
			if (!this.device) {
				this.showErrorToast(deviceNotConnectedErrorText);
				reject(new Error(deviceNotConnectedErrorText));
				return;
			}
			this.manager
				.discoverAllServicesAndCharacteristicsForDevice(this.device.id)
				.then(device => {
					this.device = device;
					resolve(device);
				})
				.catch(error => {
					this.onError(error);
					reject(error);
				});
		});
	};

	/**
	 * 设置特征监听
	 * @param serviceUUID 服务ID
	 * @param characteristicUUID 特征ID
	 * @param onCharacteristicReceived 特征变化回调
	 * @param transactionId 事务标识符
	 * @param hideErrorDisplay 隐藏错误提示
	 */
	setupMonitor = (
		serviceUUID: UUID,
		characteristicUUID: UUID,
		onCharacteristicReceived: (characteristic: Characteristic) => void,
		onError?: (error: Error) => void,
		transactionId?: TransactionId,
		hideErrorDisplay?: Boolean,
	) => {
		if (!this.device) {
			this.showErrorToast(deviceNotConnectedErrorText);
			if (onError) {
				onError(new Error(deviceNotConnectedErrorText));
			}
			throw new Error(deviceNotConnectedErrorText);
		}
		this.characteristicMonitor?.remove();
		this.characteristicMonitor = this.manager.monitorCharacteristicForDevice(
			this.device.id,
			serviceUUID,
			characteristicUUID,
			(error, characteristic) => {
				if (error) {
					if (error.errorCode === 2 && this.isCharacteristicMonitorDisconnectExpected) {
						this.isCharacteristicMonitorDisconnectExpected = false;
						return;
					}
					if (onError) {
						onError(error);
					}
					if (!hideErrorDisplay) {
						this.onError(error);
						this.characteristicMonitor?.remove();
					}
					return;
				}
				if (characteristic) {
					onCharacteristicReceived(characteristic);
				}
			},
			transactionId,
		);
	};

	// 自定义特征监听
	setupCustomMonitor: BleManager['monitorCharacteristicForDevice'] = (...args) =>
		this.manager.monitorCharacteristicForDevice(...args);

	// 删除特征监听
	finishMonitor = () => {
		// 断开
		this.isCharacteristicMonitorDisconnectExpected = true;
		this.characteristicMonitor?.remove();
	};

	getDescriptorsForDevice = async (serviceUUID: UUID, characteristicUUID: UUID) => {
		if (!this.device) {
			this.showErrorToast(deviceNotConnectedErrorText);
			throw new Error(deviceNotConnectedErrorText);
		}
		return this.manager.descriptorsForDevice(this.device.id, serviceUUID, characteristicUUID).then(res => {
			console.log(res);
		});
	};

	onError = (error: BleError) => {
		switch (error.errorCode) {
			case BleErrorCode.BluetoothUnauthorized:
				// 未授权
				this.requestBluetoothPermission();
				break;
			case BleErrorCode.LocationServicesDisabled:
				// 位置服务停用
				this.showErrorToast('位置服务（定位）已停用');
				break;
			default:
				this.showErrorToast(JSON.stringify(error, null, 4));
		}
	};

	showErrorToast = (error: string) => {
		Toast.show({
			type: 'error',
			text1: '提示',
			text2: error,
		});
	};
}

export const BLEService = new BLEServiceInstance();
