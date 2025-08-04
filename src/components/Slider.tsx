import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {View, StyleSheet, Dimensions, PanResponder} from 'react-native';
import {isNumber} from '@/common/utils';

type SliderProps = PropsWithChildren<{
	step: number;
	trackColor?: string;
	trackHeight?: number;
	thumbColor?: string;
	trumbSize?: number;
	trumbBorderWidth?: number;
	trumbBorderColor?: string;
	fillColor?: string;
	elevation?: number;
	onChange?: (step: number) => void;
	onRelease?: (step: number) => void;
}>;

const Slider = (props: SliderProps) => {
	const [sliderPosition, setSliderPosition] = useState(0);
	const [sliderWidth, setSliderWidth] = useState(0);
	const [step, setStep] = useState(0);
	const styleInfo = {
		trackColor: props.trackColor || '#fff',
		trackHeight: props.trackHeight || 4,
		thumbColor: props.thumbColor || '#fff',
		fillColor: props.fillColor || '#666',
		trumbSize: props.trumbSize || 20,
		elevation: props.elevation || 5,
		trumbBorderWidth: props.trumbBorderWidth || 0,
		trumbBorderColor: props.trumbBorderColor || '#eee',
	};

	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: () => true,
		onPanResponderGrant: (e, gestureState) => {
			// 开始拖动
			// console.log('开始拖动');
		},
		onPanResponderMove: (e, gestureState) => {
			// 处理拖动中的逻辑
			const position = Math.max(0, Math.min(sliderWidth, sliderPosition + gestureState.dx));
			// setStep(Math.round(100 * (position / sliderWidth)));
			setSliderPosition(position);
			// 滑动距离百分比
			if (props.onChange) props.onChange(Math.round(100 * (position / sliderWidth)));
		},
		onPanResponderRelease: (e, gestureState) => {
			// 处理拖动结束的逻辑
			const position = Math.max(0, Math.min(sliderWidth, sliderPosition + gestureState.dx));
			// 滑动距离百分比
			if (props.onRelease) props.onRelease(Math.round(100 * (position / sliderWidth)));
		},
	});

	const onLayout = (event: any) => {
		const {width: layoutWidth} = event.nativeEvent.layout;
		setSliderWidth(layoutWidth);
		setSliderPosition(layoutWidth * (props.step / 100));
	};

	useEffect(() => {
		if (isNumber(props.step)) {
			setSliderPosition((sliderWidth / 100) * props.step);
		}
	}, [props.step]);

	return (
		<View style={styles.sliderContainer}>
			<View
				onLayout={onLayout}
				style={{...styles.sliderTrack, height: styleInfo.trackHeight, backgroundColor: styleInfo.trackColor}}>
				<View style={{...styles.trackfill, backgroundColor: styleInfo.fillColor, width: sliderPosition}}></View>
				<View
					style={{...styles.thumbBox, left: sliderPosition - 22, top: -(22 - styleInfo.trackHeight / 2)}}
					{...panResponder.panHandlers}>
					<View
						style={{
							...styles.thumb,
							width: styleInfo.trumbSize,
							height: styleInfo.trumbSize,
							backgroundColor: styleInfo.thumbColor,
							borderRadius: styleInfo.trumbSize / 2,
							elevation: styleInfo.elevation,
							borderWidth: styleInfo.trumbBorderWidth,
							borderColor: styleInfo.trumbBorderColor,
						}}></View>
				</View>
			</View>
		</View>
	);
};
export default Slider;

const styles = StyleSheet.create({
	sliderContainer: {
		position: 'relative',
	},
	sliderTrack: {
		height: 4,
		width: '100%',
		borderRadius: 2,
	},
	trackfill: {
		height: 4,
		borderRadius: 2,
	},
	thumbBox: {
		position: 'absolute',
		left: 0,
		top: -22,
		height: 44,
		width: 44,
		justifyContent: 'center',
		alignItems: 'center',
	},
	thumb: {
		shadowOffset: {width: 0, height: 0},
		elevation: 5, // Android 投影
		shadowColor: '#000', // iOS 投影
		shadowOpacity: 1,
		borderWidth: 1,
		borderColor: '#eee',
	},
});
