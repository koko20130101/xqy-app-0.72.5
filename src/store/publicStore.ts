/* eslint-disable no-undef */
import {makeAutoObservable, toJS} from 'mobx';
import {Alert} from 'react-native';
import {check, request, RESULTS, openSettings} from 'react-native-permissions';
import storage from '@/common/utils/storage';
import {PROJECT_URL} from '@/config';
import {BLEService} from '@/common/services/BLEService';
import {DeviceModel} from '@/models';

class PublicStore {
	constructor() {
		makeAutoObservable(this);
		storage.get('token').then(val => {
			this.token = val;
		});
		storage.get('projectUrl').then(val => {
			if (val) this.projectUrl = val;
		});
	}
	token: string = '';
	isLogin: boolean = false;
	hash: string = ''; // WebView加载地址的hash路由
	tabName: string = '检测'; // 当前tab名称
	projectUrl: string = PROJECT_URL; // web地址
	tabsFiexd: boolean = true; // tabs绝对定位
	BLEService = BLEService; // 蓝牙设备实例
	navigation: any = null; // 路由
	// 公共数据
	_publicData: any = {
		currentDevice: {} as DeviceModel, // 当前设备
		userInfo: {}, // 用户信息
	};

	get publicData() {
		return toJS(this._publicData);
	}

	setNvigatioin = (navigation: any) => {
		this.navigation = navigation;
	};

	setProjectUrl = (url: string) => {
		this.projectUrl = url;
		storage.set('projectUrl', url);
	};

	setToken = (token: string) => {
		this.token = token;
		storage.set('token', token);
	};
	setIsLogin = (val: boolean) => {
		this.isLogin = val;
	};

	setTabsFiexd = (val: boolean) => {
		this.tabsFiexd = val;
	};

	updatePublicData = (val: object) => {
		this._publicData = {...toJS(this._publicData), ...val};
	};

	setHashRoute = (tabName: string, hash: string) => {
		this.tabName = tabName;
		this.hash = hash;
	};

	// 检查授权
	handleRequestPermission = async (permission: any, deviceName: string) => {
		const result = await check(permission);
		if (result === RESULTS.GRANTED) {
			// 权限已被授予，可以执行相机相关操作
			return true;
		} else if (result === RESULTS.DENIED) {
			const requestResult = await request(permission);
			if (requestResult === RESULTS.GRANTED) {
				return true;
			} else {
				return false;
			}
		} else if (result === RESULTS.BLOCKED) {
			// 权限被永久拒绝，引导用户前往设置页面
			Alert.alert(
				`${deviceName}权限被拒绝`,
				`${deviceName}权限被永久拒绝，请在设置中手动开启${deviceName}权限`,
				[
					{text: '取消', style: 'cancel'},
					{text: '设置', onPress: () => openSettings()},
				],
				{cancelable: false},
			);
			return false;
		}
	};
}

export default new PublicStore();
