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
		name: '检测',
		hash: 'home',
		iconPath: require('@images/home-off.png'),
		selectedIconPath: require('@images/home-on.png'),
	},

	{
		name: '标注',
		hash: 'check/0',
		iconPath: require('@images/mark-off.png'),
		selectedIconPath: require('@images/mark-on.png'),
	},
	{
		name: '成果',
		hash: 'gain/0',
		iconPath: require('@images/gain-off.png'),
		selectedIconPath: require('@images/gain-on.png'),
	},
	{
		name: '发现',
		hash: 'find',
		iconPath: require('@images/find-off.png'),
		selectedIconPath: require('@images/find-on.png'),
	},
	{
		name: '我的',
		hash: 'mine',
		iconPath: require('@images/mine-off.png'),
		selectedIconPath: require('@images/mine-on.png'),
	},
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
						<View style={[styles.tabIconBox, item.name === tabName ? styles.tabIconBoxSelected : null]} >
							<Image style={styles.tabIcon} source={item.name === tabName ? item.selectedIconPath : item.iconPath} />
						</View>
						<Text style={[styles.tabName, item.name === tabName ? styles.tabNameSelected : null]}>{item.name}</Text>
					</View>
				</TouchableWithoutFeedback>
			))}
		</View>
	);
});

const styles = StyleSheet.create({
	tabsContainer: {
		height: 100,
		// borderTopLeftRadius: 18,
		// borderTopRightRadius: 18,
		backgroundColor: '#fff',
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingTop: 10,
		// alignItems: 'center',
		// shadowOffset: { width: 0, height: 0 },
		// elevation: 10, // Android 投影
		// shadowColor: '#000', // iOS 投影
		// shadowOpacity: 1,
	},
	tabsFixed: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 99
	},
	tab: {
		alignItems: 'center',
		width: 50,
	},
	tabName: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#475569',
		marginTop: 5,
	},
	tabNameSelected: {
		color: '#1e64fa',
	},
	tabIconBox: {
		width: 48,
		height: 48,
		justifyContent: 'space-around',
		alignItems: 'center',
		borderRadius: 10,
		overflow: 'hidden'
	},
	tabIconBoxSelected: {
		backgroundColor: '#eff6ff',
	},
	tabIcon: {
		width: 30,
		height: 30,
	},
});

export default TabBar;
