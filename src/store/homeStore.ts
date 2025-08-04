/* eslint-disable no-undef */
import {makeAutoObservable, toJS, runInAction} from 'mobx';
import {Alert} from 'react-native';
import dayjs from 'dayjs';
import {PROJECT_URL, RES_SUC_CODE} from '@/config';
import {MusicTagModel} from '@/models';
import api from '@/api';

class HomeStore {
	constructor() {
		makeAutoObservable(this);
	}
	// 开始日期
	archivesStartDate: string = dayjs().subtract(6, 'month').format('YYYY-MM-DD');
	// 结束日期
	archivesEndDate: string = dayjs().format('YYYY-MM-DD');
	// 档案数据
	_personalArchivesFileData: any = {};
	_musicList: MusicTagModel[] = []; // 音乐列表
	_courseList: any[] = []; // 课程列表
	_questionnaireList: any[] = []; // 量表

	get personalArchivesFileData() {
		return toJS(this._personalArchivesFileData);
	}
	get musicList() {
		return toJS(this._musicList);
	}
	get courseList() {
		return toJS(this._courseList);
	}
	get questionnaireList() {
		return toJS(this._questionnaireList);
	}

	// 获取档案数据
	getUserHealthRecord = async () => {
		try {
			const params = {
				startDate: this.archivesStartDate,
				endDate: this.archivesEndDate,
			};
			const {code, data}: any = await api.getUserHealthRecord(params);
			if (code === 200) {
				runInAction(() => {
					this._personalArchivesFileData = data;
				});
			}
		} catch (error) {
			console.log(error);
		}
	};

	// AI音乐疗愈推荐
	getMusicList = async ({userId}: any) => {
		try {
			// AI音乐疗愈推荐音乐
			const {code, data}: any = await api.aiHealingRecommends({userId});
			if (code === RES_SUC_CODE) {
				runInAction(() => {
					this._musicList = data;
				});
			}
			// 心力能量推荐音乐
			const {data: energy}: any = await api.healingEnergy({userId});
			if (code === RES_SUC_CODE) {
				if (toJS(this._musicList).some(item => item.id === energy.id)) return;
				runInAction(() => {
					this._musicList = toJS(this._musicList).concat(energy);
				});
			}
		} catch (error) {
			console.log(error);
		}
	};

	// 推荐课程
	getCourseList = async () => {
		try {
			const {code, data}: any = await api.getMoneyCourseList({pageSize: 2, pageNum: 1, isRecommended: 'on'});
			if (code === RES_SUC_CODE) {
				runInAction(() => {
					this._courseList = data;
				});
			}
		} catch (error) {
			console.log(error);
		}
	};
	// 量表
	getQuestionnaireList = async () => {
		try {
			const {code, data}: any = await api.getQuestionnaireList();
			if (code === RES_SUC_CODE) {
				runInAction(() => {
					this._questionnaireList = data;
				});
			}
		} catch (error) {
			console.log(error);
		}
	};
}

export default new HomeStore();
