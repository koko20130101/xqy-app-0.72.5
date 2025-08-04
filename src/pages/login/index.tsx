import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, TextInput, Keyboard, View, Text, TouchableWithoutFeedback, TouchableOpacity, Image} from 'react-native';
import {useStores} from '@/store';
import Toast from 'react-native-root-toast';
import Countdown from '@/components/Countdown';
import Validator from '@/common/utils/validator';
import {RES_SUC_CODE} from '@/config';
import api from '@/api';

interface LoginForm {
	phone: string;
	code: string;
}

//表单验证策略
const validateForm = (formData: LoginForm) => {
	const validator = new Validator();

	validator.addStrategy(formData['phone'], [
		{
			strategy: 'isNonEmpty',
			errorMsg: '手机号码不能为空',
		},
		{
			strategy: 'isMobile',
			errorMsg: '手机号码不正确',
		},
	]);

	validator.addStrategy(formData['code'], [
		{
			strategy: 'isNonEmpty',
			errorMsg: '短信验证码不能为空',
		},
		{
			strategy: 'minLength:4',
			errorMsg: '验证码格式有误',
		},
	]);

	return validator.startValidate();
};

const Login = ({navigation}: any) => {
	const {
		publicStore: {setToken},
	} = useStores();
	const [codeButtonStatus, setCodeButtonStatus] = useState(false);
	const [formData, setFormData] = useState<LoginForm>({phone: '', code: ''});
	const inputMobileRef = useRef<any>();
	const inputCodeRef = useRef<any>();

	const updateFormData = (key: string, value: any) => {
		const obj: any = {};
		obj[key] = value;
		setFormData({...formData, ...obj});
	};

	// 获取短信验证码
	const getMobileCode = async () => {
		const validator = new Validator();
		validator.addStrategy(formData['phone'], [
			{
				strategy: 'isNonEmpty',
				errorMsg: '手机号码不能为空',
			},
			{
				strategy: 'isMobile',
				errorMsg: '手机号码格式不正确',
			},
		]);

		const errorMsg = validator.startValidate();
		if (errorMsg) {
			Toast.show(errorMsg, {
				duration: 800,
				position: Toast.positions.CENTER,
			});
			return;
		}

		const res: any = await api.getMobileCode({
			phoneNumber: formData.phone,
		});

		// 打开倒计时
		if (res.code === RES_SUC_CODE) setCodeButtonStatus(true);
	};

	// 倒计时结束
	const countdownOver = () => {
		setCodeButtonStatus(false);
	};

	const doSubmit = async () => {
		const errorMsg = validateForm(formData);
		if (errorMsg) {
			Toast.show(errorMsg, {
				duration: 800,
				position: Toast.positions.CENTER,
			});
			return;
		}
		// 登录
		const {code, token}: any = await api.loginByCode({
			phone: formData.phone,
			code: formData.code,
		});
		if (code === RES_SUC_CODE && token) {
			setToken(token);
			navigation.goBack();
		}
	};

	useEffect(() => {
		Keyboard.addListener('keyboardDidHide', () => {
			// 失去焦点
			inputMobileRef.current.blur();
			inputCodeRef.current.blur();
		});
		return () => {
			Keyboard.removeAllListeners('keyboardDidHide');
		};
	}, []);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={styles.container}>
				<View style={styles.logo}>
					<Image source={require('@images/public/logo.png')} style={{width: 130, height: 130, marginBottom: 40}} />
				</View>
				<View style={styles.input}>
					<Text style={styles.label}>+86</Text>
					<TextInput
						ref={inputMobileRef}
						placeholder="请输入手机号码"
						keyboardType="numeric"
						maxLength={11}
						selectionColor="#06f"
						style={{flex: 1}}
						placeholderTextColor={'#747474'}
						onChangeText={e => updateFormData('phone', e)}
					/>
				</View>
				<View style={styles.input}>
					<TextInput
						ref={inputCodeRef}
						placeholder="请输入短信验证码"
						keyboardType="numeric"
						maxLength={6}
						style={{flex: 1}}
						placeholderTextColor={'#747474'}
						onChangeText={e => updateFormData('code', e)}
					/>
					{!codeButtonStatus && (
						<TouchableOpacity style={styles.customButton} onPress={getMobileCode}>
							<Text style={styles.buttonLabel}>获取验证码</Text>
						</TouchableOpacity>
					)}
					{codeButtonStatus && <Countdown time={60000} format="ss" autoStart onOver={countdownOver} />}
				</View>
				<View style={{flexDirection: 'row', marginBottom: 46}}>
					<TouchableOpacity style={styles.agreeButton}>
						<Image source={require('@images/icons/agree-off.png')} style={styles.agreeIcon} />
					</TouchableOpacity>
					<Text style={styles.tips}>
						我已经阅读并同意
						<TouchableOpacity>
							<Text style={styles.agreement}>《心龙猫隐私政策》</Text>
						</TouchableOpacity>
						，未注册的手机号桨自动创建账号
					</Text>
				</View>
				<TouchableOpacity style={styles.loginButton} activeOpacity={0.7} onPress={doSubmit}>
					<Text style={styles.loginButton_text}>登录</Text>
				</TouchableOpacity>
				<View style={{flex: 1}}></View>
			</View>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: '#fff',
		flex: 1,
		justifyContent: 'center',
	},
	logo: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	input: {
		backgroundColor: '#F9F9F9',
		color: '#000',
		borderRadius: 50,
		paddingHorizontal: 20,
		alignItems: 'center',
		flexDirection: 'row',
		marginBottom: 20,
		fontWeight: 'bold',
	},
	label: {
		color: '#747474',
		fontSize: 14,
	},
	customButton: {
		padding: 10,
	},
	buttonLabel: {
		color: '#333',
	},
	loginButton: {
		backgroundColor: '#8EDBC9',
		height: 54,
		borderRadius: 54,
		justifyContent: 'center',
	},
	loginButton_text: {
		color: '#fff',
		fontSize: 16,
		alignSelf: 'center',
	},
	tips: {
		color: '#8F8F8F',
		fontSize: 12,
		flex: 1,
		lineHeight: 16,
	},
	agreeButton: {
		height: 22,
		width: 22,
		marginHorizontal: 3,
	},
	agreeIcon: {
		width: 16,
		height: 16,
		marginTop: 2,
	},
	agreement: {
		color: '#8EDBC9',
		fontSize: 12,
	},
});

export default Login;
