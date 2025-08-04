import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Platform } from 'react-native';
// import Lottie from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PERMISSIONS } from 'react-native-permissions';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { isEmptyObject, debounce } from '@/common/utils';
import { ECGModel, MusicModel, RecordResultModel } from '@/models';
import { useStores } from '@/store';

const MyWebView = observer(({ route, navigation }: any) => {
	const {
		publicStore: {
			token,
			publicData,
			updatePublicData,
			setHashRoute,
			handleRequestPermission,
		},
		deviceStore: { BLEService, connectDevice, removeDevice, initDeviceData, getDeviceData, stopMonitor },
		mediaStore: {
			audioRecorderPlayer,
			updateAppkey,
			updateWSURL,
			startRecorder,
			stopRecorder,
			setMusicInfo,
			startPlay,
			pausePlay,
			restorePlay,
			stopPlay,
		},
	} = useStores();
	const scanningRef = useRef<Boolean>(false); // 正在扫描
	const webviewRef = useRef<any>(null);
	const firstLoad = useRef<boolean>(true); // 第一次加载
	const funObj = useRef<any>({}); // 存储要延迟调用的方法和数据
	const routeParams = route.params || {};
	// 安全区域
	const insets = useSafeAreaInsets();
	let pageTitle = '';

	const actions: any = {
		// 打开新WebView
		openWebView: (data: object) => {
			navigation.push('NewWebView', data);
		},
		// 更新公共数据
		setPublicData: (data: any) => {
			// web传过来的数据：不能包括设备信息
			if (data && !data.currentDevice) {
				updatePublicData(data);
			}
		},
		// 拉起登录页
		login: () => {
			navigation.push('Login');
		},
		// 返回首页
		goHome: () => {
			setHashRoute('首页', '');
			navigation.navigate('Home');
		},
		// 返回上一级
		goBack: () => {
			navigation.goBack();
		},
		// 跳转到tab
		switchTab: (data: any) => {
			setHashRoute(data.tabName, data.hash);
			navigation.navigate('Home');
		},
		// 扫描蓝牙设备
		startScan: (data: any, funcName: string) => {
			scanDevices(data, funcName);
		},
		// 停止扫描
		stopScan: () => {
			BLEService.stopScan();
		},
		// 连接设备
		connectDevice: async (data: any, funcName: string) => {
			connectDevice(data, (resultObj: any) => {
				webviewRef.current.injectJavaScript(`(function(){
					window.ReactNativeWebView["${funcName}"](${JSON.stringify(resultObj)})
				})()`);
			});
		},
		// 断开连接
		disConnectDevice: () => {
			removeDevice();
		},
		// 监听设备
		monitorDevice: (data: any, funcName: string) => {
			getDeviceData(data, (resultObj: ECGModel) => {
				if (webviewRef.current) {
					webviewRef.current.injectJavaScript(`(function(){
						window.ReactNativeWebView["${funcName}"](${JSON.stringify(resultObj)})
					})()`);
				}
			});
		},
		// 停止监听并得到总数据
		stopMonitor: (data: any, funcName: string) => {
			const g_wlBLE_OrigenDataAry16 = stopMonitor();
			webviewRef.current.injectJavaScript(`(function(){
				window.ReactNativeWebView["${funcName}"](${JSON.stringify(g_wlBLE_OrigenDataAry16)})
			})()`);
		},
		// 重置心电检测数据
		clearAll: () => {
			initDeviceData();
		},
		// 检查可否录音
		checkRecord: async (data: any, funcName: string) => {
			const permission = Platform.OS === 'android' ? PERMISSIONS.ANDROID.RECORD_AUDIO : PERMISSIONS.IOS.SPEECH_RECOGNITION;
			const canRecord = await handleRequestPermission(permission, '麦克风');
			// 是否可以录音
			webviewRef.current.injectJavaScript(
				`(function(){window.ReactNativeWebView["${funcName}"](${JSON.stringify({ code: canRecord ? 0 : 1 })})})()`,
			);
		},
		// 开始录音
		startRecord: async (data: any, funcName: string) => {
			if (!!data.appKey) {
				// 更新appKey
				updateAppkey(data.appKey);
			}
			if (!!data.wsUrl) {
				// 更新wsUrl
				updateWSURL(data.wsUrl);
			}
			const permission = Platform.OS === 'android' ? PERMISSIONS.ANDROID.RECORD_AUDIO : PERMISSIONS.IOS.SPEECH_RECOGNITION;
			const canRecord = await handleRequestPermission(permission, '麦克风');
			if (canRecord) {
				startRecorder((result: RecordResultModel) => {
					// 回调录音结果
					if (webviewRef.current) {
						webviewRef.current.injectJavaScript(`(function(){
							window.ReactNativeWebView["${funcName}"](${JSON.stringify(result)})
						})()`);
					}
				});
			}
		},
		// 结束录音
		stopRecord: async () => {
			stopRecorder();
		},
		// 播放音乐
		startPlay: async (data: any, funcName: string) => {
			const musicList = data.musicList?.map((item: MusicModel, index: number) => {
				return { ...item, index };
			});
			setMusicInfo(data.coverImgUrl, data.title, musicList);
			startPlay(musicList[0], (result: any) => {
				if (funcName && webviewRef.current) {
					webviewRef.current.injectJavaScript(`(function(){
						window.ReactNativeWebView["${funcName}"](${JSON.stringify(result)})
					})()`);
				}
			});
		},
		// 暂停播放
		pausePlay: () => {
			pausePlay();
			webviewRef.current.injectJavaScript(`(function(){
				window.ReactNativeWebView["startPlay"](${JSON.stringify({ code: 1 })})
			})()`);
		},
		// 恢复播放
		restorePlay: () => {
			restorePlay();
			webviewRef.current.injectJavaScript(`(function(){
				window.ReactNativeWebView["restorePlay"](${JSON.stringify({ code: 0 })})
			})()`);
		},
		// 停止播放
		stopPlay: () => {
			stopPlay();
			webviewRef.current.injectJavaScript(`(function(){
				window.ReactNativeWebView["startPlay"](${JSON.stringify({ code: 2 })})
			})()`);
		},
		// 回退
		onGoBack: (data: any, funcName: string) => {
			if (funcName) {
				// 将方法数据存储起来
				funObj.current[funcName] = data
			}
		},
	};

	// 搜索蓝牙
	const scanDevices = async (data: any, funcName: string) => {
		if (!scanningRef.current) {
			scanningRef.current = true;
			// 初始化
			await BLEService.initializeBLE(status => {
				if (status === 0) {
					debounce(() => {
						// 监听到蓝牙关闭，删除蓝牙，需要重新搜索连接
						removeDevice();
					}, 500)();
				}
			});
			BLEService.scanDevices((scannedDevice: any) => {
				if (scannedDevice.isConnectable && !!scannedDevice.localName) {
					console.log(scannedDevice.localName);
					if (webviewRef.current) {
						webviewRef.current.injectJavaScript(`(function(){
							window.ReactNativeWebView["${funcName}"](${JSON.stringify(scannedDevice)})
						})()`);
					}
				}
			});
			setTimeout(() => {
				console.log('结束扫描');
				BLEService.stopScan();
				scanningRef.current = false;
			}, data.count || 20000);
		}
	};

	// 接收web发来的信息
	const receiveMessage: any = (msg: WebViewMessageEvent) => {
		const data = JSON.parse(msg.nativeEvent.data);
		const params = JSON.parse(data.params);
		if (actions[data.funcName]) {
			// 在actions中有调用方法
			actions[data.funcName](params, data.funcName);
		}
	};

	// 注入方法到webview：getToken、getSystemInfo
	const injectFunction = () => {
		webviewRef.current.injectJavaScript(`(function(){
			window.ReactNativeWebView.getToken=()=>{
				return '${token}'
			}
			window.ReactNativeWebView.getSystemInfo=()=>{
				return ${JSON.stringify({ ...insets })}
			}
		})()`);
	};

	// 向WebView注入公共数据，getPublicData方法是web中绑在window.ReactNativeWebView对像上
	// 这里是运行此方法
	const injectPublicData = () => {
		firstLoad.current = false;
		if (!isEmptyObject(publicData)) {
			webviewRef.current.injectJavaScript(`(function(){
				window.ReactNativeWebView.getPublicData(${JSON.stringify(publicData)})
			})()`);
		}
	};

	// 监听公共数据变化
	useEffect(() => {
		// 非第一次加载时不注入数据
		if (!firstLoad.current) {
			injectPublicData();
		}
	}, [publicData]);

	useEffect(() => {
		injectFunction();
		// 刷新webview
		webviewRef.current.injectJavaScript(`
			location.reload()
		`);
	}, [token]);

	useEffect(() => {
		navigation.setOptions({
			title: route.params.title || '',
			headerTitleAlign: 'center',
			headerTintColor: routeParams.barStyle === 'light' ? '#fff' : '#000',
			headerBackImageSource: require('@images/icons/icon-back.png'),
			headerTransparent: route.params.fullScreen || false,
			backgroundColor: routeParams.fullScreen ? 'rgba(255,255,255,0)' : '#fff',
			headerShadowVisible: false,
		});

		// 监听页面返回
		const unsubscribe = navigation.addListener('beforeRemove', () => {
			if (funObj.current['onGoBack']) {
				// 更新数据
				updatePublicData(funObj.current['onGoBack'])
			}
		});

		return () => {
			// 停止监听设备数据
			stopMonitor();
			// 停止录音
			audioRecorderPlayer.stopRecorder();
			if (scanningRef.current) {
				// 停止扫描
				BLEService.stopScan();
				scanningRef.current = false;
			}
			// 清理监听器
			unsubscribe()
		};
	}, []);

	return (
		<>
			<WebView
				ref={webviewRef}
				source={{ uri: routeParams.url }}
				style={{ flex: 1 }}
				cacheEnabled={true}
				javaScriptEnabled={true}
				startInLoadingState
				// renderLoading={() => (
				// 	<View style={styles.loadingContainer}>
				// 		<Lottie
				// 			source={require('@images/loading.json')}
				// 			autoPlay
				// 			loop
				// 			style={{width: 150, height: 150}}
				// 		/>
				// 	</View>
				// )}
				onLoadStart={() => {
					// 页面开始加载时，注入方法
					injectFunction();
				}}
				onLoadEnd={() => {
					// 页面加载完毕，注入公共数据
					injectPublicData();
				}}
				onNavigationStateChange={(e: WebViewNavigation) => {
					// 设置导航栏标题为页面标题
					if (!e.loading && !!e.title && pageTitle !== e.title && e.title.indexOf('/') === -1) {
						pageTitle = e.title;
						navigation.setOptions({ title: e.title });
					}
				}}
				onMessage={receiveMessage}
				mediaPlaybackRequiresUserAction={false}
			/>
		</>
	);
});

export default MyWebView;
