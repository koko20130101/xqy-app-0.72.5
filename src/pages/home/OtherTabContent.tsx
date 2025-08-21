import React from 'react';
import { View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import MyWebView from '@/components/WebView';

const OtherTabContent = observer(({ route, navigation }: any) => {
	const {
		publicStore: { hash, projectUrl },
	} = useStores();
	route.params.url = `${projectUrl}/#/${hash}`;

	return (
		<View style={{ ...styles.wrap, zIndex: hash ? 2 : 1 }}>
			<MyWebView route={{ ...route }} navigation={navigation} />
		</View>
	);
});
const styles = StyleSheet.create({
	wrap: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 98,
		backgroundColor: '#f2f5fa'
	},
});

export default OtherTabContent;
