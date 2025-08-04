import React from 'react';
import { Text, View, Image, StyleSheet, TouchableWithoutFeedback, Vibration } from 'react-native';
import { observer } from 'mobx-react';
import { useStores } from '@/store';

interface TabModel {
	name: string;
	hash: string;
	iconPath: any;
	selectedIconPath: any;
}

const tabList: TabModel[] = [
	{
		name: '首页',
		hash: '',
		iconPath: require('@images/home-off.png'),
		selectedIconPath: require('@images/home-on.png'),
	},

	{
		name: '检测',
		hash: 'check/0',
		iconPath: require('@images/AI-off.png'),
		selectedIconPath: require('@images/AI-on.png'),
	},
	{
		name: '咨询',
		hash: 'art-healing',
		iconPath: require('@images/art-off.png'),
		selectedIconPath: require('@images/art-on.png'),
	},
	{
		name: '训练',
		hash: 'art-healing',
		iconPath: require('@images/art-off.png'),
		selectedIconPath: require('@images/art-on.png'),
	},
	{
		name: '发现',
		hash: 'find/0',
		iconPath: require('@images/art-off.png'),
		selectedIconPath: require('@images/art-on.png'),
	},
	// {
	// 	name: '我的',
	// 	hash: 'mine',
	// 	iconPath: require('@images/user-off.png'),
	// 	selectedIconPath: require('@images/user-on.png'),
	// },
];

const TabBar = observer(() => {
	const {
		publicStore: { tabName, tabsFiexd, setHashRoute },
	} = useStores();

	const handleTabClick = (item: TabModel) => {
		// 调用振动
		Vibration.vibrate([0, 80, 0]);
		setHashRoute(item.name, item.hash);
	};

	return (
		<View style={tabsFiexd ? [styles.tabsContainer, styles.tabsFixed] : styles.tabsContainer}>
			{tabList.map((item, index) => (
				<TouchableWithoutFeedback key={'tab-' + index} onPress={() => handleTabClick(item)}>
					<View style={styles.tab}>
						<Image style={styles.tabIcon} source={item.name === tabName ? item.selectedIconPath : item.iconPath} />
						<Text style={[styles.tabName, item.name === tabName ? styles.tabNameSelected : null]}>{item.name}</Text>
					</View>
				</TouchableWithoutFeedback>
			))}
		</View>
	);
});

const styles = StyleSheet.create({
	tabsContainer: {
		height: 90,
		borderTopLeftRadius: 18,
		borderTopRightRadius: 18,
		backgroundColor: '#fff',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		shadowOffset: { width: 0, height: 0 },
		elevation: 10, // Android 投影
		shadowColor: '#000', // iOS 投影
		shadowOpacity: 1,
	},
	tabsFixed: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
	},
	tab: {
		alignItems: 'center',
		width: 50,
	},
	tabName: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#737B98',
		marginTop: 4,
	},
	tabNameSelected: {
		color: '#87d7c4',
	},
	tabIcon: {
		width: 30,
		height: 30,
	},
});

export default TabBar;
