import React, { useEffect, useState, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	StatusBar,
	TouchableWithoutFeedback,
	BackHandler,
	Linking
} from 'react-native';
import { observer } from 'mobx-react';
import { useUpdate } from "react-native-update";
import Toast from 'react-native-root-toast';
import { useStores } from '@/store';
import { IsDev } from '@/config';
import api from '@/api';
import ModalDefault from '@/components/ModalDefault';
import TabBar from '@/components/TabBar';
import HomeContent from './HomeContent';
import OtherTabContent from './OtherTabContent';


const Home = observer(({ route, navigation }: any) => {
	const {
		publicStore: { token, setIsLogin, updatePublicData },
	} = useStores();
	const { updateInfo, downloadUpdate, switchVersion } = useUpdate();
	const modalRef = useRef<any>(null);
	const canExit = useRef<boolean>(false)

	// 去开发设置页面
	const goDevConfigPage = () => {
		navigation.push('DevConfig');
	};

	// 用户信息
	const getUserInfo = async () => {
		try {
			const { code, data }: any = await api.getUserInfo({ channel: 'xin_long_mao_pro' });
			if (code === 200) {
				// 用户数据
				updatePublicData({ userInfo: { user: data.user, userExtension: data.userExtension } });
				setIsLogin(true);
			}
		} catch (error) {
			console.log(error);
		}
	};

	// 检查更新
	const checkUpdate = async () => {
		let metaInfo: any = {};

		if (updateInfo?.expired) {
			// ... 原生包版本过期，下载或跳转下载页面
			modalRef.current?.handleShow({
				title: '更新提示',
				content: updateInfo?.description || '应用需要更新，点击下载安装最新版本',
				confirmText: '立即更新',
				bgClose: false,
				onConfirm: () => {
					Linking.openURL(updateInfo?.downloadUrl || '')
				},
			});
		} else if (updateInfo?.upToDate) {
			// ... 没有更新，弹提示或忽略
		} else if (updateInfo?.update) {
			// 有更新
			try {
				metaInfo = JSON.parse(updateInfo?.metaInfo || "{}");
				await downloadUpdate()
			} catch (e) {
				// 异常处理
			}
			if (metaInfo.silent) {
				// 如果热更包携带有 silent 字段，不询问用户，直接执行更新
				switchVersion();
			} else {
				// 走询问流程
				modalRef.current?.handleShow({
					title: '更新提示',
					content: `${metaInfo.description || '有新版本可用，是否更新？'}`,
					cancelText: '下次再说',
					confirmText: '立即更新',
					bgClose: false,
					onConfirm: () => {
						switchVersion();
					},
				});
			}
		}
	}

	useEffect(() => {
		checkUpdate()
	}, [updateInfo])

	useEffect(() => {
		if (token) {
			getUserInfo();
		}
	}, [token]);

	useEffect(() => {
		const onBackPress = () => {
			console.log(navigation.canGoBack())
			if (!canExit.current && !navigation.canGoBack()) {
				Toast.show('再按一次退出程序', {
					containerStyle: { borderRadius: 50, paddingHorizontal: 20 },
					duration: Toast.durations.SHORT,
					position: Toast.positions.TOP + 20,
					onShown: () => {
						canExit.current = true
					},
					onHidden: () => {
						canExit.current = false
					}
				});
				return true
			} else {
				return false
			}
		}
		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			onBackPress
		);
		return () => backHandler.remove();
	}, [])

	return (
		<View style={{ flex: 1, backgroundColor: '#fff' }}>
			{/* 状态栏 */}
			<StatusBar backgroundColor="rgba(255,255,255,0)" barStyle="dark-content" translucent={true} />
			{/* 首页 */}
			<HomeContent route={{ ...route }} navigation={navigation} />
			{/* 其它tab页内容 */}
			<OtherTabContent route={{ ...route }} navigation={navigation} />
			<TabBar />
			{IsDev && (
				<View style={{ position: 'absolute', right: 10, bottom: 130, zIndex: 3, padding: 5, backgroundColor: '#ddd' }}>
					<TouchableWithoutFeedback onPress={goDevConfigPage}>
						<Text>DEV</Text>
					</TouchableWithoutFeedback>
				</View>
			)}
			<ModalDefault ref={modalRef} />
		</View>
	);
});
const styles = StyleSheet.create({});

export default Home;
