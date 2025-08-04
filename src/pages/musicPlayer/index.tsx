import React, {useEffect} from 'react';
import {View, StyleSheet, Text, Image, TouchableWithoutFeedback} from 'react-native';
import {observer} from 'mobx-react';
import {useStores} from '@/store';
import Slider from '@/components/Slider';

const MusicPlayer = observer(() => {
	const {
		mediaStore: {
			playStatus,
			playType,
			title,
			coverImgUrl,
			currentMusic,
			musicList,
			setPlayType,
			startPlay,
			pausePlay,
			restorePlay,
			prevPlay,
			nextPlay,
			seekToPlay,
		},
	} = useStores();

	const togglePlay = () => {
		if (playStatus === 1) {
			restorePlay();
		} else if (playStatus === 0) {
			pausePlay();
		} else if (playStatus === 2 && musicList[0]) {
			startPlay(musicList[0]);
		}
	};

	// 循环
	const setRepeatType = () => {
		setPlayType(playType === 0 ? 1 : 0);
	};

	const handleSliderChange = (val: number) => {
		seekToPlay(val);
	};

	return (
		<View style={styles.container}>
			<View style={styles.main}>
				<Image source={{uri: currentMusic.musicImg || coverImgUrl || ''}} style={styles.coverImg} />
				<Text style={styles.musicTitle}>{currentMusic.title || title}</Text>
			</View>
			<View style={styles.controls}>
				<View style={styles.progress}>
					<Slider
						step={currentMusic.percent || 0}
						trackColor="#999"
						fillColor="#88D8C5"
						trumbBorderWidth={0.5}
						trumbSize={10}
						elevation={0.2}
						onRelease={handleSliderChange}
					/>
				</View>
				<View style={styles.times}>
					<Text>{currentMusic.playTime || '00:00'}</Text>
					<Text>{currentMusic.totalTime || '00:00'}</Text>
				</View>
				<View style={styles.controlBtns}>
					<TouchableWithoutFeedback onPress={setRepeatType}>
						<View style={styles.repeatBtn}>
							<Image style={styles.btn1} source={require('@images/icons/icon-music-rep.png')} />
							{playType === 1 && <Text style={styles.repeatNum}>1</Text>}
						</View>
					</TouchableWithoutFeedback>
					<View style={styles.mainButtons}>
						<TouchableWithoutFeedback disabled={currentMusic.index === 0} onPress={prevPlay}>
							<Image
								style={[styles.btn1, {opacity: currentMusic.index === 0 ? 0.3 : 1}]}
								source={require('@images/icons/icon-music-prev.png')}
							/>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={togglePlay}>
							<View style={styles.playBtn}>
								{playStatus === 0 && <Image style={styles.btn1} source={require('@images/icons/icon-pause-white.png')} />}
								{[1, 2].includes(playStatus) && (
									<Image style={styles.btn1} source={require('@images/icons/icon-play-white.png')} />
								)}
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback disabled={currentMusic.index === musicList.length - 1} onPress={nextPlay}>
							<Image
								style={[styles.btn1, {opacity: currentMusic.index === musicList.length - 1 ? 0.3 : 1}]}
								source={require('@images/icons/icon-music-next.png')}
							/>
						</TouchableWithoutFeedback>
					</View>
					<TouchableWithoutFeedback>
						<Image style={styles.btn1} source={require('@images/icons/icon-music-share.png')} />
					</TouchableWithoutFeedback>
				</View>
			</View>
		</View>
	);
});

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		flex: 1,
		justifyContent: 'space-between',
	},
	main: {
		flex: 1,
		padding: 30,
	},
	coverImg: {
		width: '100%',
		height: 300,
		borderRadius: 10,
	},
	musicTitle: {
		color: '#000',
		fontSize: 20,
		marginTop: 10,
	},
	controls: {
		height: 140,
	},
	progress: {
		paddingHorizontal: 30,
	},
	times: {
		paddingHorizontal: 30,
		paddingVertical: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	controlBtns: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 30,
	},
	mainButtons: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	repeatBtn: {
		position: 'relative',
	},
	playBtn: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: '#88d8c5',
		marginHorizontal: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	repeatNum: {
		position: 'absolute',
		left: 0,
		top: 4,
		right: 0,
		bottom: 0,
		textAlign: 'center',
		fontSize: 12,
		color: '#88d8c5',
		fontWeight: 'bold',
	},
	btn1: {
		width: 24,
		height: 24,
	},
});

export default MusicPlayer;
