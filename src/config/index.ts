import {NativeModules} from 'react-native';
// export const IsDev = NativeModules.SourceCode.scriptURL.split('&')[1] === 'dev=true';
export const IsDev = true;

/* 响应 */
export const RES_SUC_CODE = 200; // 请求返回成功状态码
export const HTTP_CODE_OVERDUE = 401; //登录过期
export const HTTP_CODE_REJECT = 403; //403拒绝访问
export const HTTP_CODE_DIFFERENCE = 408; //408与服务器时间有差异

/* API地址 */
export const API_ORIGIN = IsDev ? 'https://mind-test.aiwintao.com' : 'https://agent.aiwintao.com'; // 阿里云服务器

/* 分服务前缀 */
export const REST = '/mind/';

/* H5项目地址 */
export const PROJECT_URL = IsDev ? 'http://192.168.1.16:5173' : 'https://agent.aiwintao.com/xlm-app-h5';

/* OSS */
export const OSS_URL = 'https://aiwintao.oss-cn-guangzhou.aliyuncs.com/front-end/xzws-weapp';

export const WS_URL = IsDev
	? 'wss://mind-test.aiwintao.com/agent/api/edu/mind/wss/ai_talk'
	: 'wss://agent.aiwintao.com/agent/api/edu/mind/wss/ai_talk';
