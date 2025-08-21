import React, { useEffect, useRef } from 'react';
import {
	ScrollView,
	View,
	Text,
	StyleSheet,
	Dimensions,
	Image,
	TouchableHighlight,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react';
import dayjs from 'dayjs';
import { useStores } from '@/store';
import ModalDefault from '@/components/ModalDefault';
import MusicItem from './components/MusicItem';
import CourseItem from './components/CourseItem';

const windowWidth = Dimensions.get('window').width;
const HomeContent = observer(({ route, navigation }: any) => {
	const {
		publicStore: { hash, isLogin, projectUrl, publicData, setNvigatioin, setIsLogin },
		homeStore: {
			personalArchivesFileData,
			musicList,
			courseList,
			getUserHealthRecord,
			getMusicList,
			getCourseList,
		},
	} = useStores();
	const modalRef = useRef<any>(null);
	// 安全区域
	const insets = useSafeAreaInsets();

	// 去搜索蓝牙设备页面
	const goDevicesPage = async () => {
		// Vibration.vibrate([0, 50, 0]);
		if (!isLogin) return goLoginPage();
		navigation.push('NewWebView', { url: `${projectUrl}/#/devices` });
	};

	// 去检测页面  1:我 2:亲友
	const goCheckPage = (type: number) => {
		// Vibration.vibrate([0, 50, 0]);
		if (!isLogin) return goLoginPage();

		if (type === 1 && !publicData.userInfo?.user?.birthday) {
			return modalRef.current?.handleShow({
				title: '提示',
				content: '需要完善年龄信息才能进行检测',
				confirmText: '去完善',
				onConfirm: () => {
					navigation.push('NewWebView', { url: `${projectUrl}/#/mine/update-userinfo` });
				},
			});
		}

		if (!publicData.currentDevice?.deviceName) {
			return modalRef.current?.handleShow({
				title: '提示',
				content: '请先连接设备',
				confirmText: '确定',
				onConfirm: () => {
					navigation.push('NewWebView', { url: `${projectUrl}/#/devices` });
				},
			});
		}
		navigation.push('NewWebView', { url: `${projectUrl}/#/check-ready` });
	};

	// 登录页面
	const goLoginPage = () => {
		navigation.push('Login');
	};

	useEffect(() => {
		if (isLogin) {
			// 用户的推荐音乐列表
			getMusicList({ userId: publicData.userInfo?.user?.userId });
			// 心力能量档案
			getUserHealthRecord();
			setIsLogin(true);
		}
	}, [isLogin]);

	useEffect(() => {
		// 课程列表
		getCourseList();
		setNvigatioin(navigation);
	}, []);

	return (
		<View style={{ ...styles.wrap, zIndex: hash ? 1 : 2 }}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
			>
				<View style={{ ...styles.container, paddingTop: insets.top }}>
					<View style={styles.header}>
						<Text style={styles.headerTitle}>脑波知己 生机蓬勃</Text>
						<Text style={styles.headerSubTitle}>脑波数据波动驾驶舱</Text>
					</View>
					<View style={styles.main}>

						<View style={{ ...styles.card, backgroundColor: '#E9F6F7' }}>
							<View style={{ marginLeft: 10, marginBottom: 2, marginTop: 5 }}>
								<Text style={styles.cardBigTitle}>我的心力能量档案</Text>
								<Text style={styles.cardSubTitle}>检测-预警-疗愈-干预</Text>
							</View>
						</View>
						{/* 舌诊和亲友检测入口 */}
						<View style={styles.card}>
							<View style={{ flexDirection: 'row' }}>
								<TouchableHighlight underlayColor="none" style={{ flex: 1 }}>
									<View style={{ ...styles.cardInner, ...styles.smallBlock }}>
										<View style={styles.moreContentBox}>
											<View style={{ ...styles.circleIcon, marginTop: 5, backgroundColor: '#FDCCCC' }}>
												<Image
													source={require('@images/home/icon-tongue.png')}
													style={styles.circleIconImg}
													resizeMode="stretch"
												/>
											</View>
											<View style={styles.more}>
												<Image
													source={require('@images/home/icon-arrow-right.png')}
													style={styles.arrowRight}
													resizeMode="center"
												/>
											</View>
										</View>
										<TouchableHighlight underlayColor="none" style={{ flex: 1 }}>
											<View>
												<Text style={styles.cardTitle}>舌诊</Text>
												<Text style={styles.cardSubTitle}>体质评估，调理建议</Text>
											</View>
										</TouchableHighlight>
									</View>
								</TouchableHighlight>
								<TouchableHighlight underlayColor="none" style={{ flex: 1 }} onPress={() => goCheckPage(2)}>
									<View style={{ ...styles.cardInner, ...styles.smallBlock, marginRight: 0 }}>
										<View style={styles.moreContentBox}>
											<View style={{ ...styles.circleIcon, marginTop: 5, backgroundColor: '#88D8C5' }}>
												<Image
													source={require('@images/home/icon-heart.png')}
													style={styles.circleIconImg}
													resizeMode="stretch"
												/>
											</View>
											<View style={styles.more}>
												<Image
													source={require('@images/home/icon-arrow-right.png')}
													style={styles.arrowRight}
													resizeMode="center"
												/>
											</View>
										</View>
										<View>
											<Text style={styles.cardTitle}>亲友心力检测</Text>
											<Text style={styles.cardSubTitle} numberOfLines={1}>
												该数据不会进入个人统计中
											</Text>
										</View>
									</View>
								</TouchableHighlight>
							</View>
						</View>
						{/* 商城入口 */}
						<View style={styles.card}>
							<View style={{ borderRadius: 20, backgroundColor: '#fff', overflow: 'hidden' }}>
								<Image
									source={{ uri: 'https://aiwintao.oss-cn-guangzhou.aliyuncs.com/front-end/xlm-weapp/check/sleep-area-bg.jpg' }}
									style={{ width: '100%', height: 145 }}
									resizeMode="stretch"
								/>
							</View>
						</View>
						{/* AI聊愈 */}
						<View style={styles.card}>
							<View style={{ ...styles.cardInner, padding: 20, flexDirection: 'row', alignItems: 'center' }}>
								<View style={{ flex: 1, marginRight: 20 }}>
									<Text style={{ ...styles.cardTitle, marginBottom: 10 }}>AI聊愈</Text>
									<Text style={styles.cardSubTitle}>现在心情如何？有什么问题或困扰，来保密空间跟我聊聊吧~</Text>
								</View>
								<Image source={require('@images/home/xlm.webp')} style={styles.xlmImage} resizeMode="stretch" />
							</View>
						</View>
						{/* 音乐聊愈 */}
						{!!musicList.length && (
							<View style={styles.card}>
								<View style={styles.moreContentBox2}>
									<Text style={styles.cardBigTitle}>音乐聊愈</Text>
									<View style={{ ...styles.more, backgroundColor: '#fff' }}>
										<Image source={require('@images/home/icon-arrow-right.png')} style={styles.arrowRight} resizeMode="center" />
									</View>
								</View>
								<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
									{musicList.map((item, index) => (
										<MusicItem itemData={item} style={{ marginRight: 10 }} key={'music-tag-' + index} />
									))}
								</ScrollView>
							</View>
						)}
						{/* 成长课程推荐 */}
						<View style={styles.card}>
							<View style={styles.moreContentBox2}>
								<Text style={styles.cardBigTitle}>成长课程推荐</Text>
								<View style={{ ...styles.more, backgroundColor: '#fff' }}>
									<Image source={require('@images/home/icon-arrow-right.png')} style={styles.arrowRight} resizeMode="center" />
								</View>
							</View>
							{courseList.map((item, index) => (
								<CourseItem itemData={item} style={{ marginBottom: 10 }} key={'course-' + index} />
							))}
						</View>
					</View>
				</View>
			</ScrollView>
			<ModalDefault ref={modalRef} />
		</View>
	);
});
const styles = StyleSheet.create({
	wrap: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		backgroundColor: '#F1F5F9'
	},
	container: {
		flex: 1,
		position: 'relative',
	},
	header: { paddingLeft: 25, paddingTop: 10, color: '#000' },
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#000',
	},
	headerSubTitle: {
		color: '#000',
		fontSize: 12
	},
	main: {
		flex: 1,
		paddingTop: 25,
		paddingBottom: 105,
		paddingHorizontal: 15,
	},

	circleIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
	},
	circleIconImg: {
		width: 22,
		height: 22,
	},
	// 内容卡片
	card: {
		backgroundColor: '#F7F6F9',
		borderRadius: 30,
		marginTop: 10,
		padding: 10,
	},
	cardInner: {
		backgroundColor: '#fff',
		borderRadius: 20,
		padding: 15,
	},
	cardBigTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 2,
		color: '#000',
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 2,
		color: '#000',
	},
	cardSubTitle: {
		fontSize: 12,
		color: '#7D7C81',
		lineHeight: 16,
	},

	moreContentBox: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	moreContentBox2: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 10,
		paddingLeft: 10,
	},
	more: {
		width: 30,
		height: 30,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F7F6F9',
	},
	arrowRight: {
		width: 10,
		height: 10,
	},
	// AI舌诊
	smallBlock: {
		backgroundColor: '#fff',
		height: 140,
		borderRadius: 20,
		flex: 1,
		marginRight: 10,
		paddingBottom: 20,
		justifyContent: 'space-between',
	},
	xlmImage: {
		width: 100,
		height: 121,
	},
});

export default HomeContent;
