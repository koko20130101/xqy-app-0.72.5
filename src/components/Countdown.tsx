import React, {
	useState,
	useEffect,
	forwardRef,
	useImperativeHandle,
} from 'react';
import {View, Text} from 'react-native';

interface CountDownProps {
	[x: string]: any;
	format: string;
	time: any;
	autoStart?: boolean;
	onOver?: any;
}

const CountDown: React.FC<CountDownProps> = forwardRef((props, ref: any) => {
	const formatArr = !!props.format ? props.format.split(':') : 'HH:mm:ss';
	const timeData = Number(props.time) || 0;
	const [autoStart] = useState<boolean>(!!props.autoStart ? true : false);
	let time = timeData;
	let interval: any = null;
	let [format] = useState({
		hasDay: formatArr.indexOf('DD') !== -1 ? true : false,
		hasHour: formatArr.indexOf('HH') !== -1 ? true : false,
		hasMinute: formatArr.indexOf('mm') !== -1 ? true : false,
		hasSecond: true,
	});
	const getCountDown = (val?: any) => {
		let ms = val;
		let ss = 1000;
		let mi = ss * 60;
		let hh = mi * 60;
		let dd = hh * 24;

		let days = Math.floor(ms / dd); //天
		let hours = Math.floor((ms - (format.hasDay ? days * dd : 0)) / hh); //小时
		let minutes = Math.floor(
			(ms -
				(format.hasDay ? days * dd : 0) -
				(format.hasHour ? hours * hh : 0)) /
				mi,
		); //分钟
		let seconds = Math.floor(
			(ms -
				(format.hasDay ? days * dd : 0) -
				(format.hasHour ? hours * hh : 0) -
				(format.hasMinute ? minutes * mi : 0)) /
				ss,
		); //秒

		return {
			days,
			hours: hours < 10 ? '0' + hours : hours,
			minutes: minutes < 10 ? '0' + minutes : minutes,
			seconds: seconds < 10 ? '0' + seconds : seconds,
		};
	};
	const [countDownObj, setCuntDownObj] = useState<any>(getCountDown(timeData));
	const countDown = () => {
		const {onOver} = props;
		time -= 1000;
		if (time < 0) {
			clearInterval(interval);
			onOver && onOver(); // 结束后回调
			return;
		}
		setCuntDownObj(getCountDown(time));
	};
	const start = (val?: any) => {
		if (interval != null) {
			clearInterval(interval);
			interval = null;
		}
		if (time <= 0) {
			time = Number(props.time) || 0;
		}
		if (!!val) {
			time = Number(val) || 0;
		}
		interval = setInterval(countDown, 1000);
	};

	const stop = () => {
		clearInterval(interval);
		interval = null;
	};

	useEffect(() => {
		if (autoStart) start();
		return function cleanup() {
			// 组件卸载后清除定时器
			clearInterval(interval);
		};
	}, [timeData]); // 如果timeData发生变化，则调用useEffect

	useImperativeHandle(ref, () => ({
		start: () => start(),
		stop: () => stop(),
	}));

	return (
		<>
			{props.children ? (
				<>
					{React.Children.map(props.children, (child: any) => {
						const {datatype, children} = child.props;
						return React.cloneElement(child, {
							children: datatype ? countDownObj[datatype] : children,
						});
					})}
				</>
			) : (
				<Text>
					{format.hasDay && countDownObj.days}
					{format.hasDay && ':'}
					{format.hasHour && countDownObj.hours}
					{format.hasHour && ':'}
					{format.hasMinute && countDownObj.minutes}
					{format.hasMinute && ':'}
					{format.hasSecond && countDownObj.seconds}
				</Text>
			)}
		</>
	);
});
export default CountDown;
