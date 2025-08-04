/* eslint-disable no-undef */
import {makeAutoObservable, toJS} from 'mobx';
import {Characteristic} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import storage from '@/common/utils/storage';
import publicStore from './publicStore';
import {BLEService} from '@/common/services/BLEService';
import wlBLE from '@/common/wlBLE/wlBLE';
import {getDeivceSN, getDeivceVersion, getDeivceElectricity} from '@/common/wlBLE/tools';
import {DeviceModel, ECGModel} from '@/models';

class DeviceStore {
	constructor() {
		makeAutoObservable(this);
	}
	BLEService = BLEService; // 蓝牙连接实例
	WLBLE = new wlBLE(); // 唯理心电蓝牙检测仪实例
	myInterval: any; // 向web端发送数据

	/**
	 * 连接蓝牙设备
	 * @method connectDevice
	 */
	connectDevice = async (data?: any, callback?: (result: any) => void) => {
		let deviceId = data?.deviceId || (await storage.get('deviceId'));
		let serviceId = data?.serviceId || (await storage.get('serviceId'));
		let characteristicId = data?.characteristicId || (await storage.get('characteristicId'));
		let currentDevice: DeviceModel = {deviceId: '', deviceName: ''};

		if (!deviceId) return;

		try {
			if (deviceId && serviceId && characteristicId) {
				for (let i = 0; i < 5; i++) {
					// 连接蓝牙
					await this.BLEService.connectToDevice(deviceId);
					// 发现服务
					const device = await this.BLEService.discoverAllServicesAndCharacteristicsForDevice();
					currentDevice['deviceId'] = deviceId;
					currentDevice['deviceName'] = device.name;
					// 监听服务
					this.BLEService.setupMonitor(serviceId, characteristicId, (characteristic: Characteristic) => {
						const value = characteristic?.value!;
						const buffer = Buffer.from(value, 'base64');

						if (buffer[0] === 192) {
							// 设备信息包
							let SN = getDeivceSN(buffer);
							let deviceVersion = getDeivceVersion(buffer);
							let deviceElectricity = getDeivceElectricity(buffer);
							currentDevice['isConnected'] = true;
							currentDevice['deviceSN'] = SN;
							currentDevice['deviceVersion'] = deviceVersion;
							currentDevice['deviceElectricity'] = deviceElectricity;
							// 更新到公共数据，与web共享
							publicStore.updatePublicData({currentDevice});
							// 停止监听
							this.BLEService.finishMonitor();
							if (callback) callback({status: 1, msg: '连接成功'});
						}
					});

					storage.set('deviceId', deviceId);
					storage.set('serviceId', serviceId);
					storage.set('characteristicId', characteristicId);
					return;
				}
			}
		} catch (error) {
			console.error('连接错误：', error);
			if (callback) callback({status: 2, msg: JSON.stringify(error)});
		}
	};

	/**
	 * 断开连接
	 * @method disConnectDevice
	 */

	disConnectDevice = () => {
		if (publicStore.publicData.currentDevice?.isConnected) {
			this.BLEService.disConnectDevice();
			this.BLEService.finishMonitor();
			clearInterval(this.myInterval);
			publicStore.updatePublicData({currentDevice: {isConnected: false}});
		}
	};

	/**
	 * 断开并删除已连接的设备
	 * @method disConnectDevice
	 */
	removeDevice = () => {
		this.disConnectDevice();
		storage.remove('deviceId');
		storage.remove('serviceId');
		storage.remove('characteristicId');
	};

	/**
	 * 初始化心电检测数据
	 * @method initDeviceData
	 */
	initDeviceData = () => {
		this.WLBLE.initData();
	};

	/**
	 * 重置丢包总数
	 * @method clearlostPackageTotal
	 */
	clearlostPackageTotal = () => {
		this.WLBLE.clearlostPackageTotal();
	};

	/**
	 * 监听并获取设备数据
	 * @method getDeviceData
	 */
	getDeviceData = async (data: any, callback: (result: ECGModel) => void) => {
		let serviceId = await storage.get('serviceId');
		let characteristicId = await storage.get('characteristicId');

		this.stopMonitor();

		this.WLBLE.initData(); // 初始化数据
		this.BLEService.setupMonitor(
			serviceId,
			characteristicId,
			(characteristic: Characteristic) => {
				// 监听到的设备数据传给wlBLE实例
				this.WLBLE.receiveData(characteristic?.value!);
			},
			() => {
				// 出错
				this.stopMonitor();
			},
		);

		// 定时向webview发送数据，默认每秒发送一个数据包，可根据传值设置
		this.myInterval = setInterval(() => {
			this.WLBLE.oneminutecallback();
			// 数据包
			const resultObj: any = this.WLBLE.getCurrentSportHRAndDrawdata();
			callback(resultObj);
		}, data.ms || 1000);
	};

	/**
	 * 停止监听并返回检测数据
	 * @method stopMonitor
	 */
	stopMonitor = () => {
		this.BLEService.finishMonitor();
		clearInterval(this.myInterval);
		return this.WLBLE.g_wlBLE_OrigenDataAry16;
	};
}

export default new DeviceStore();
