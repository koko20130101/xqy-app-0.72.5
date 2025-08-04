export interface DeviceModel {
	deviceId: string; // 设备id
	deviceName: string | null; // 设备名称
	deviceSN?: string;
	deviceVersion?: string; // 版本
	deviceElectricity?: number; // 电量
	deviceOriginalElectricity?: string;
	temperature?: string; // 温度
	isConnected?: boolean; // 是否连接
}

export interface ECGModel {
	isSigunsteady: boolean; // 信号是否稳定
	noRpeak: boolean; // 峰值？
	meanHR: number; // 平均心率
	RHeight: number; // 心跳波形
	RPeakHeight?: number | null;
	SWaveHeight: number; // 心跳波形
	SwaveMinHeight?: number;
	drawDataAry: number[];
	secondSteady?: number;
}

export interface RecordResultModel {
	code: number; // 0 正常  1 不可录音  2 录音机错误
	result: string; // 语音识别结果
}

export interface MusicModel {
	index?: number;
	musicUrl: string; // 音乐链接
	musicImg?: string; // 音乐图片
	title?: string;
	percent?: number;
	duration?: number; // 长度
	playTime?: string; // 当前时间
	totalTime?: string; // 总时间
}

export interface MusicTagModel {
	id?: string;
	pid?: string;
	tagName?: string;
	sortNo?: string;
	remark?: string;
	modifyTime?: string;
	createTime?: string;
	backImageUrl1?: string;
	backImageUrl2?: string;
	children?: MusicTagModel[];
}
