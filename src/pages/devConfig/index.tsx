import React, { useState } from 'react';
import { View, Button, Text, TextInput, Switch, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-root-toast';
import { observer } from 'mobx-react';
import { useStores } from '@/store';

const DevConfig = observer(({ route, navigation }: any) => {
	const {
		publicStore: { token, projectUrl, tabsFiexd, setProjectUrl, setToken, setTabsFiexd },
	} = useStores();
	const [formData, setFormData] = useState<any>({ token, projectUrl, tabsFiexd });

	const updateFormData = (key: string, value: any) => {
		const obj: any = {};
		obj[key] = value;
		setFormData({ ...formData, ...obj });
	};

	const copyToken = () => {
		if (formData.token) {
			Clipboard.setString(formData.token);
			Toast.show('复制成功', {
				duration: 800,
				position: Toast.positions.CENTER,
			});
		}
	};

	const doSubmit = () => {
		setProjectUrl(formData.projectUrl);
		setToken(formData.token);
		setTabsFiexd(formData.tabsFiexd);
		navigation.goBack();
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={styles.container}>
				<View style={styles.input}>
					<Text style={styles.label}>web地址：</Text>
					<TextInput
						placeholder=""
						selectionColor="#06f"
						style={{ flex: 1 }}
						value={formData.projectUrl}
						onChangeText={e => updateFormData('projectUrl', e)}
					/>
				</View>
				<View style={styles.input}>
					<Text style={styles.label}>Token：</Text>
					<TextInput placeholder="" style={{ flex: 1 }} value={formData.token} onChangeText={e => updateFormData('token', e)} />
					<Button title="复制" onPress={copyToken}></Button>
				</View>
				<View style={styles.input}>
					<Text style={styles.label}>底部的Tabs绝对定位：</Text>
					<Switch onValueChange={e => updateFormData('tabsFiexd', e)} value={formData.tabsFiexd} />
				</View>
				<Button title="确定" onPress={doSubmit}></Button>
			</View>
		</TouchableWithoutFeedback>
	);
});

const styles = StyleSheet.create({
	container: {
		padding: 16,
		flex: 1,
	},
	input: {
		backgroundColor: '#fff',
		padding: 6,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	label: {
		color: '#999',
	},
});

export default DevConfig;
