import Request from './request';
import {REST} from '@/config';

export default {
	// 登录
	login: (params: any) => Request.post(REST + 'frontend/edu/login', params),
	// 验证码登录
	loginByCode: (params: any) => Request.post(REST + 'frontend/edu/login_sms', params),
	// 获取短信验证码
	getMobileCode: (params: any) =>
		Request.post(REST + 'frontend/edu/sms/send_without_auth', params, {
			dataType: 'form-data',
		}),
	// 用户基础信息
	getUserInfo: (params?: any) => Request.get(REST + 'getInfo', params),

	/* ============== 首页 ============== */
	// 用户健康档案
	getUserHealthRecord: (params?: any) => Request.get(REST + 'edu/examine/user_health_record', params),
	// 获取量表列表
	getQuestionnaireList: (params?: any) => Request.get(REST + 'edu/questionnaire/list', params),
	// 首页音乐疗愈推荐
	aiHealingRecommends: ({userId, ...params}: any) =>
		Request.get(REST + `edu/healing/music/ai_healing_recommends/${userId}`, params),
	// 心力能量推荐音乐，拼到音乐列表中
	healingEnergy: ({userId, ...params}: any) => Request.get(REST + `edu/healing/music/healing_energy/${userId}`, params),
	// 获取课程列表数据
	getMoneyCourseList: (params?: any) => Request.get(REST + `frontend/edu/course/courseList`, params),

	// 语音识别
	audioToText: (params?: any, config?: any) => Request.post('', params, config),
	// 获取阿里云语音识别token
	getAliyunToken: (params?: any) => Request.get(REST + 'edu/chat/getNlsAccessToken', params),
};
