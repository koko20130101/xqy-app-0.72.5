interface configModel {
	wsUrl: string;
	appkey: string;
	onReady: () => void; // 已做好录音准备
	onComplete: (val: string) => void; // 识别完成调用
	onSpeaking: (val: string) => void; //说话过程中识别调用
	onError: () => void; //错误
}

//生成32位随机数UUID
const getRandomStrNum = () => {
	const s: any = [];
	const hexDigits = '0123456789abcdef';
	for (let i = 0; i < 32; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23];

	const uuid = s.join('');
	return uuid;
};

class AliWebsocket {
	constructor(config: configModel) {
		this.wsUrl = config.wsUrl;
		this.appkey = config.appkey;
		this.onReady = config.onReady;
		this.onComplete = config.onComplete;
		this.onSpeaking = config.onSpeaking;
		this.onError = config.onError;
		//初始化录音实例
	}
	interval: any = null; // 定时器
	// 阿里云相关参数
	wsUrl = ''; // websocket地址
	appkey = ''; // 阿里云语音识别项目appkey,在阿里云后台设置

	//定义ws的相关参数
	websocket: any = null; //websocket实例
	timer_websocket = null; //websocket定时器, 用于实时获取语音转文本的结果
	websocket_task_id = null; //websocket任务id 整个实时语音识别的会话ID，整个请求中需要保持一致，32位唯一ID。
	websocket_audio2txt_time = 0; //websocket 语音转文本  一句话收集完毕的时间，用于判断间隔
	websocket_audio2txt_result_msg: string[] = []; //websocket实例 音频转文字的结果
	websocket_audio2txt_result_msg_temp = null; //websocket实例 音频转文字的结果
	websocket_audio2txt_complete_b = false; //websocket 语音转文本  是否完成   true:完毕  false:未完毕
	websocket_audio2txt_complete_time_end = 100; //websocket 语音转文本 判断文本是否收集完毕的阈值 单位毫秒
	// 回调函数
	onReady;
	onComplete;
	onSpeaking;
	onError;

	//发送数据
	websocketSend = (data: any) => {
		//console.log('websocket 数据发送',data);
		//判断是否连接成功,连接成功再发送数据过去
		if (this.websocket.readyState === 1) {
			this.websocket.send(data);
		}
	};

	//初始化websocket
	initWebSocket = () => {
		console.log('初始化weosocket', this.wsUrl);

		//初始化参数
		this.websocket_audio2txt_complete_b = false;
		this.websocket_audio2txt_time = 0;

		//检测如果未关闭、则先关闭在重连
		if (this.websocket !== null) {
			this.websocket.close();
			this.websocket = null;
		}

		//连接wss服务端
		this.websocket = new WebSocket(this.wsUrl);
		//指定回调函数
		this.websocket.onopen = this.websocketOnOpen;
		this.websocket.onmessage = this.websocketOnMessage;
		this.websocket.onerror = this.websocketOnError;
		this.websocket.onclose = this.websocketOnClose;
	};

	// 建立连接
	websocketOnOpen = () => {
		// console.log("向 websocket 发送 链接请求");

		//生成新的任务id
		this.websocket_task_id = getRandomStrNum();
		//生成ali的请求参数message_id
		const message_id = getRandomStrNum();
		const actions = {
			header: {
				namespace: 'SpeechTranscriber', //固定值
				name: 'StartTranscription', //发送请求的名称，固定值
				appkey: this.appkey, //appkey
				message_id: message_id, //消息id
				task_id: this.websocket_task_id, //任务id
			},
			payload: {
				format: 'PCM', //音频编码格式，默认是PCM（无压缩的PCM文件或WAV文件），16bit采样位数的单声道。
				sample_rate: 16000, //需要与录音采样率一致、默认是16000，单位是Hz。
				enable_intermediate_result: true, //是否返回中间识别结果，默认是false。
				enable_punctuation_prediction: true, //是否在后处理中添加标点，默认是false。
				enable_inverse_text_normalization: true, //是否在后处理中执行数字转写，默认是false。
				max_sentence_silence: 500, //	语音断句检测阈值，静音时长超过该阈值会被认为断句，参数范围200ms～2000ms，默认值800ms。
			},
		};

		//发送请求
		this.websocketSend(JSON.stringify(actions));
	};

	//接收数据
	websocketOnMessage = (e: {data: string}) => {
		//接受ali 语音返回的数据
		const leng = this.websocket_audio2txt_result_msg.length;
		const ret = JSON.parse(e.data);
		//判断返回的数据类型
		switch (ret.header.name) {
			case 'TranscriptionStarted':
				console.log('服务端已经准备好了进行识别，客户端可以发送音频数据了');
				this.onReady();
				break;
			case 'SentenceBegin':
				//一句话开始后，就可以启动录音了
				console.log('检测到了一句话的开始');
				this.websocket_audio2txt_result_msg.push('');
				break;
			case 'TranscriptionResultChanged':
				//数据在收集中 一句话的中间结果
				console.log('数据在收集中');
				//实时获取语音转文本的结果
				this.websocket_audio2txt_result_msg[leng - 1] = ret.payload.result;
				this.onSpeaking(this.websocket_audio2txt_result_msg.join(''));
				break;
			case 'SentenceEnd':
				console.log('数据接收结束', ret);
				this.websocket_audio2txt_result_msg[leng - 1] = ret.payload.result;
				// 传给回调函数
				this.onSpeaking(this.websocket_audio2txt_result_msg.join(''));
				break;
			case 'TranscriptionCompleted':
				console.log('服务端已停止了语音转写', ret);
				break;
		}
	};

	// 关闭websocket
	websocketOnClose = () => {
		console.log('websocketClose断开连接');
		this.onComplete(this.websocket_audio2txt_result_msg.join(''));
	};

	websocketOnError = (e: any) => {
		console.log('连接建立失败重连', e);
		this.onError();
	};

	closeWebSocket() {
		this.websocket?.close();
	}

	removeText() {
		this.websocket_audio2txt_result_msg = []; //置空
	}
}
export default AliWebsocket;
