/* eslint-disable no-undef */
import {makeAutoObservable, runInAction, toJS} from 'mobx';
import dayjs from 'dayjs';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';
import {Buffer} from 'buffer';
import AliWebsocket from '@/common/services/AliWebsocket';
import {MusicModel} from '@/models';
import api from '@/api';

class MediaStore {
	constructor() {
		makeAutoObservable(this);
	}
	myTimeout: any;
	audioRecorderPlayer = new AudioRecorderPlayer();
	wsUrl: string = 'wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1'; // 阿里云语音识别 websocket地址
	appKey: string = 'd1bShNkCMDQrvWSm'; // 阿里云语音识别 appkey
	aliyunToken: string = ''; // 阿里云语音识别 token
	isRecording: boolean = false;
	coverImgUrl: string = ''; // 专辑图片
	title: string = '专辑名称';
	musicList: MusicModel[] = []; // 当前播放的音频列表
	currentMusic: MusicModel = {musicUrl: '', percent: 0, playTime: '00:00', totalTime: '00:00'}; // 当前播放的音乐
	playType: number = 0; // 0:播放后停止  1:单首循环 2:列表循环
	playStatus: number = 2; // 0：播放 1:暂停  2：停止
	callback: any = null; // webview传过来的回调函数
	ws: any = null; // websocket实例

	updateAppkey = (val: string) => {
		this.appKey = val;
	};

	updateWSURL = (val: string) => {
		this.wsUrl = val;
	};

	// 开始录音
	startRecorder = async (callback?: any) => {
		try {
			if (!this.aliyunToken) {
				const {data: TokenData}: any = await api.getAliyunToken();
				this.aliyunToken = TokenData.token;
			}

			this.ws = new AliWebsocket({
				wsUrl: `${this.wsUrl}?token=${this.aliyunToken}`,
				appkey: this.appKey,
				onReady: () => {},
				onSpeaking: (val: string) => {
					// 说话中
					callback({code: 1, result: val});
				},
				onComplete: (val: string) => {
					// 说话结束
					callback({code: 2, result: val});
				},
				onError: () => {
					//发生错误，清空token
					this.aliyunToken = '';
					callback({code: -1, result: '语音识别错误'});
				},
			});
			this.ws.initWebSocket();

			AudioRecord.init({
				sampleRate: 16000, // default 44100
				channels: 1, // 1 or 2, default 1
				bitsPerSample: 16, // 8 or 16, default 16
				audioSource: 6, // android only (see below)
				wavFile: 'test.wav', // default 'audio.wav'}); // 初始化录音参数
			});
			AudioRecord.on('data', data => {
				// base64-encoded audio data chunks
				const chunk = Buffer.from(data, 'base64');
				this.ws.websocketSend(chunk);
			});
			AudioRecord.start(); // 开始录音
		} catch (error) {
			console.error(error);
		}
	};

	// 停止录音
	stopRecorder = async () => {
		console.log('停止录音');
		AudioRecord.stop();
		this.ws.closeWebSocket();
	};

	// 设置播放信息
	setMusicInfo = (coverImg: string = '', title: string = '', musicList: MusicModel[] = []) => {
		runInAction(() => {
			this.coverImgUrl = coverImg;
			this.title = title;
			this.musicList = musicList;
		});
	};

	setPlayStatus = (val: number) => {
		this.playStatus = val;
	};

	setPlayType = (val: number) => {
		this.playType = val;
	};

	// 开始播放
	startPlay = async (currentMusic: MusicModel, callback?: any) => {
		if (!!currentMusic.musicUrl) {
			this.currentMusic = currentMusic;
		} else {
			return;
		}
		if (callback) this.callback = callback;

		const audioName = currentMusic.musicUrl.substring(currentMusic.musicUrl.lastIndexOf('/') + 1);
		// 本地文件地址
		const audioPath = `${RNFS.CachesDirectoryPath}/${audioName}`;
		let playMsg = null;
		try {
			// 检测是否存在文件
			await RNFS.stat(audioPath);
			playMsg = await this.audioRecorderPlayer.startPlayer(audioPath);
			this.setPlayStatus(0);
			if (this.callback) this.callback({code: 0, msg: 'ok'});
		} catch (error) {
			// 下载文件
			const res = await RNFS.downloadFile({
				fromUrl: currentMusic.musicUrl, // 下载地址
				toFile: audioPath,
				progressDivider: 5, // 总共（100/5）= 20次下载回调
				progress: res => {
					// 这里会调用20次
					if (this.callback) this.callback({code: -1, msg: (res.bytesWritten / res.contentLength) * 100});
				},
			}).promise;
			if (res.statusCode === 200) {
				// 下载完成
				playMsg = await this.audioRecorderPlayer.startPlayer(audioPath);
				this.setPlayStatus(0);
				if (this.callback) this.callback({code: 0, msg: 'ok'});
			}
		}
		this.audioRecorderPlayer.addPlayBackListener(e => {
			const percent = Math.round((e.currentPosition / e.duration) * 100);
			runInAction(() => {
				this.currentMusic = {
					...toJS(this.currentMusic),
					percent,
					playTime: dayjs(e.currentPosition).format('mm:ss'),
					totalTime: dayjs(e.duration).format('mm:ss'),
					duration: e.duration,
				};
			});
			if (percent === 100) {
				if (this.playType === 1) {
					// 单曲循环
					this.startPlay(this.currentMusic);
				} else {
					this.stopPlay();
				}
			}
		});
	};
	// 暂停播放
	pausePlay = () => {
		this.audioRecorderPlayer.pausePlayer();
		this.setPlayStatus(1);
		if (this.callback) this.callback({code: 1, msg: 'ok'});
	};
	// 恢复播放
	restorePlay = () => {
		this.audioRecorderPlayer.startPlayer();
		this.setPlayStatus(0);
		if (this.callback) this.callback({code: 0, msg: 'ok'});
	};
	// 结束播放
	stopPlay = () => {
		this.audioRecorderPlayer.stopPlayer();
		this.audioRecorderPlayer.removePlayBackListener();
		this.setPlayStatus(2);
		if (this.callback) this.callback({code: 2, msg: 'ok'});
	};
	// 上一首
	prevPlay = () => {
		const index: number = this.currentMusic.index || 0;
		const _prev = this.musicList[index - 1];
		if (_prev) {
			this.audioRecorderPlayer.stopPlayer();
			this.audioRecorderPlayer.removePlayBackListener();
			this.startPlay(_prev);
		}
	};
	// 下一首
	nextPlay = () => {
		const index: number = this.currentMusic.index || 0;
		const _next = this.musicList[index + 1];
		if (_next) {
			this.audioRecorderPlayer.stopPlayer();
			this.audioRecorderPlayer.removePlayBackListener();
			this.startPlay(_next);
		}
	};
	// 指定位置播放
	seekToPlay = (val: number) => {
		const duration = this.currentMusic.duration || 0;
		this.audioRecorderPlayer.seekToPlayer(duration * (val / 100));
	};
}

export default new MediaStore();
