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
		<View style={{ flex: hash ? 1 : 0 }}>
			<MyWebView route={{ ...route }} navigation={navigation} />
		</View>
	);
});
const styles = StyleSheet.create({});

export default OtherTabContent;
