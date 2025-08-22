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
import CourseItem from './components/CourseItem';

const windowWidth = Dimensions.get('window').width;
const HomeContent = observer(({ route, navigation }: any) => {
	const {
		publicStore: { hash, isLogin, projectUrl, publicData, setNvigatioin, setIsLogin },
		homeStore: {
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
						<View style={styles.logo}>

						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.headerTitle}>脑波知己 生机蓬勃</Text>
							<Text style={styles.headerSubTitle}>脑波数据波动驾驶舱</Text>
						</View>
						<TouchableHighlight>
							<Text>
								连接设备
							</Text>
						</TouchableHighlight>
					</View>
					<View style={styles.main}>
						{/* 商城入口 */}
						<View style={{ ...styles.card, marginHorizontal: 15 }}>
							<View style={{ borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' }}>
								<Image
									source={{ uri: 'https://aiwintao.oss-cn-guangzhou.aliyuncs.com/front-end/xlm-weapp/check/sleep-area-bg.jpg' }}
									style={{ width: '100%', height: 260 }}
									resizeMode="stretch"
								/>
							</View>
							<View style={styles.cardMidTitle}>
								<Text style={styles.cardMidTitleText}>彭凯平积极心理学介绍多功能学习与预防</Text>
								<View style={styles.more}>
									<Image source={require('@images/home/icon-arrow-right.png')} style={styles.arrowRight} resizeMode="center" />
								</View>
							</View>
						</View>

						{/* 成长课程推荐 */}
						<View style={styles.card}>
							<View style={{ ...styles.moreContentBox2, marginHorizontal: 15 }}>
								<Text style={styles.cardBigTitle}>名师讲座</Text>
								<TouchableHighlight>
									<Text style={styles.more2}>
										查看更多
									</Text>
								</TouchableHighlight>
							</View>
							<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
								{courseList.map((item, index) => (
									<CourseItem itemData={item} style={{ marginLeft: 15, marginRight: index === courseList.length - 1 ? 15 : 0 }} key={'course-' + index} />
								))}
							</ScrollView>
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
		bottom: 100,
		backgroundColor: '#F1F5F9'
	},
	container: {
		flex: 1,
		position: 'relative',
	},
	header: {
		paddingLeft: 25,
		paddingRight: 15,
		paddingTop: 10,
		flexDirection: 'row',
		alignItems: 'center'
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#000',
	},
	headerSubTitle: {
		color: '#000',
		fontSize: 12
	},
	logo: {
		width: 48,
		height: 48
	},
	main: {
		flex: 1,
		marginBottom: 15
	},
	// 内容卡片
	card: {
		borderRadius: 30,
		marginTop: 10,
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
	cardMidTitle: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: 72,
		backgroundColor: '#fff',
		borderRadius: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: "space-between",
		paddingLeft: 24,
		paddingRight: 14
	},
	cardMidTitleText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#000',
		maxWidth: 200
	},
	moreContentBox2: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 10,
		paddingLeft: 10,
	},
	more: {
		width: 48,
		height: 48,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#EFF6FF',
	},
	more2: {
		color: '#1E64FA',
	},
	arrowRight: {
		width: 10,
		height: 10,
	},
});

export default HomeContent;
