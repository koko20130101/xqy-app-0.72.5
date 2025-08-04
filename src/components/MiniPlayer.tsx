import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-native-draggable';
import { Animated, View, Image, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { observer } from 'mobx-react';
import { useStores } from '@/store';

const { width, height } = Dimensions.get('window');

const MiniPlayer = observer(({ route }: any) => {
	const {
		publicStore: { navigation },
		mediaStore: { playStatus, coverImgUrl, pausePlay, restorePlay, stopPlay },
	} = useStores();

	const togglePlay = () => {
		if (playStatus === 1) {
			restorePlay();
		} else if (playStatus === 0) {
			pausePlay();
		}
	};

	const goMusicPlayerPage = () => {
		if (navigation) navigation.navigate('MusicPlayer');
	};

	return (
		<Draggable x={width - 75}>
			<View style={{ ...styles.miniPlayerContainer, display: playStatus === 2 ? 'none' : 'flex' }}>
				<TouchableWithoutFeedback onPress={goMusicPlayerPage}>
					<View style={styles.coverImgBox}>{coverImgUrl && <Image style={styles.coverImg} source={{ uri: coverImgUrl }} />}</View>
				</TouchableWithoutFeedback>
				<View style={styles.btns}>
					<TouchableWithoutFeedback onPress={togglePlay}>
						<View style={styles.iconBox}>
							{playStatus === 0 && <Image style={styles.contrlIcon} source={require('@images/icons/icon-pause.png')} />}
							{[1, 2].includes(playStatus) && <Image style={styles.contrlIcon} source={require('@images/icons/icon-play.png')} />}
						</View>
					</TouchableWithoutFeedback>
					<TouchableWithoutFeedback onPress={stopPlay}>
						<View style={styles.iconBox}>
							<Image style={styles.contrlIcon} source={require('@images/icons/icon-close-2.png')} />
						</View>
					</TouchableWithoutFeedback>
				</View>
			</View>
		</Draggable>
	);
});

const styles = StyleSheet.create({
	miniPlayerContainer: {
		borderRadius: 8,
		backgroundColor: '#eee',
		shadowOffset: { width: 0, height: 0 },
		elevation: 10, // Android 投影
		shadowColor: '#000', // iOS 投影
		shadowOpacity: 1,
		overflow: 'hidden',
		height: 85,
		marginTop: 50
	},
	coverImgBox: {
		height: 65,
		width: 65,
	},
	coverImg: {
		width: 65,
		height: 65,
	},
	btns: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: '#fff',
	},
	iconBox: {
		paddingVertical: 5,
		paddingHorizontal: 8,
	},
	contrlIcon: {
		width: 10,
		height: 10,
	},
});

export default MiniPlayer;
