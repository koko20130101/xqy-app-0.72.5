import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Modal, Animated, StyleSheet, TouchableHighlight, TouchableWithoutFeedback, Vibration } from 'react-native';

interface IProps {
	title?: string;
	content?: string;
	confirmText?: string;
	cancelText?: string;
	bgClose?: boolean;
	onCancel?: () => void; // 取消按钮回调
	onConfirm?: () => void; // 确认按钮回调
}

const ModalDefault = forwardRef((props: any, ref) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [modalInfo, setModalInfo] = useState<IProps>({ bgClose: true });
	const fadeAnim = useRef(new Animated.Value(0)).current; //

	// 定义一个handleShow函数，用于显示Modal，并传入配置信息
	const handleShow = async (config?: any) => {
		if (config) {
			setModalInfo(config);
		}
		setModalVisible(true);
	};

	const handleConfirm = () => {
		// Vibration.vibrate([0, 50, 0]);
		setModalVisible(false);
		if (modalInfo.onConfirm) modalInfo.onConfirm();
	};

	const handleCancel = () => {
		// Vibration.vibrate([0, 50, 0]);
		setModalVisible(false);
		if (modalInfo.onCancel) modalInfo.onCancel();
	};

	// 使用useImperativeHandle函数，将handleShow和handleClose函数暴露给父组件
	useImperativeHandle(ref, () => ({
		handleShow: (config?: any) => handleShow(config),
	}));

	const fadeIn = () => {
		Animated.timing(fadeAnim, {
			toValue: 1, // 目标值为1，即完全不透明
			duration: 300, // 动画持续时间
			useNativeDriver: true, // 使用原生驱动可以提高性能
		}).start();
	};

	const fadeOut = () => {
		Animated.timing(fadeAnim, {
			toValue: 0, // 目标值为0，即完全透明
			duration: 500,
			useNativeDriver: true,
		}).start();
	};

	const handleClose = () => {
		if (!modalInfo.bgClose) return
		fadeIn();
		fadeOut();
		setModalVisible(false);
	}

	useEffect(() => {
		if (modalVisible) fadeIn();
		else fadeOut;
	}, [modalVisible]);

	return (
		<Animated.View
			style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				zIndex: 999,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				opacity: fadeAnim,
				display: modalVisible ? 'flex' : 'none',
			}}>
			<Modal
				animationType="fade"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					setModalVisible(!modalVisible);
				}}>
				<TouchableWithoutFeedback
					onPress={handleClose}>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							{modalInfo?.title && <Text style={styles.modalTitle}>{modalInfo.title}</Text>}
							<Text style={styles.modalText}>{modalInfo.content || ''}</Text>
							<View style={styles.actions}>
								{modalInfo.cancelText && (
									<TouchableHighlight underlayColor="none" style={styles.cancelButton} onPress={handleCancel}>
										<Text style={styles.cancelStyle}>{modalInfo.cancelText}</Text>
									</TouchableHighlight>
								)}
								<TouchableHighlight underlayColor="none" style={{ ...styles.openButton }} onPress={handleConfirm}>
									<Text style={styles.confirmStyle}>{modalInfo.confirmText || '确认'}</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</Animated.View >
	);
});
export default ModalDefault;

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalView: {
		width: 300,
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 20,
		justifyContent: 'space-between',
	},
	actions: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	openButton: {
		backgroundColor: '#88D8C5',
		borderRadius: 20,
		padding: 10,
		marginHorizontal: '2%',
		minWidth: 100,
	},
	cancelButton: {
		backgroundColor: '#f8f8f8',
		borderRadius: 20,
		padding: 10,
		marginHorizontal: '2%',
		minWidth: 100,
	},
	confirmStyle: {
		color: '#fff',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	cancelStyle: {
		fontWeight: 'bold',
		textAlign: 'center',
	},
	modalTitle: {
		fontSize: 18,
		textAlign: 'center',
		color: '#000',
		fontWeight: 'bold',
	},
	modalText: {
		textAlign: 'center',
		marginTop: 20,
		marginBottom: 30,
	},
});
