import {API_ORIGIN} from '@/config';
import publicStore from '@/store/publicStore';

function showErrorMsg(message = '当前服务器拥挤，请稍后再试~~') {
	setTimeout(() => {
		//
	}, 32);
}

// 转换JSON数据为表单
const toFormData = function (params: any = {}, boundary = '') {
	let result = '';

	for (let i in params) {
		result += `\r\n--${boundary}`;
		result += `\r\nContent-Disposition: form-data; name="${i}"`;
		result += '\r\n';
		result += `\r\n${params[i]}`;
	}
	// 如果obj不为空，则最后一行加上boundary
	if (result) {
		result += `\r\n--${boundary}`;
	}
	return result;
};

const requestFun = (method: string, path: string, data?: any, options?: any) => {
	return new Promise((resolve, reject) => {
		const reqData = data || {};
		const {token} = publicStore;
		const boundary = `----FooBar${new Date().getTime()}`;
		// 当前接口域名
		let origin = options?.origin || API_ORIGIN + path;

		let headers = {
			Authorization: token,
			'Content-Type': options?.dataType === 'form-data' ? `multipart/form-data;boundary=${boundary}` : 'application/json',
		};
		if (options?.headers) {
			headers = {...headers, ...options?.headers};
		}

		if (method.toUpperCase() === 'GET') {
			let paramsArray: any = [];
			// 拼接参数
			Object.keys(reqData).forEach(key => {
				paramsArray.push(`${key}=${reqData[key]}`);
			});
			if (origin.indexOf('?') === -1) {
				origin += `?${paramsArray.join('&')}`;
			} else {
				origin += `&${paramsArray.join('&')}`;
			}
		}

		fetch(
			origin,
			method.toUpperCase() === 'POST'
				? {
						body: options?.dataType === 'form-data' ? toFormData(reqData, boundary) : reqData,
						method,
						headers,
				  }
				: {method, headers},
		)
			.then(response => response.json())
			.then((resData: any) => {
				console.info('接口路径--> ', origin);
				console.info('请求头部--> ', JSON.stringify({...headers}));
				console.log('请求参数--> ', JSON.stringify(reqData));
				console.log('响应报文--> ', JSON.stringify(resData));

				switch (resData.code) {
					case 401: // 401登录过期
						// showErrorMsg('登录过期，为您重新登录');
						publicStore.setToken('');
						publicStore.setIsLogin(false);
						reject(resData);
						break;
					case 416: // 未注册
						reject(resData);
						break;
					case 403: // 403拒绝访问
						// showErrorMsg(resData.msg || '拒绝访问');
						reject(resData);
						break;
					case 404:
						showErrorMsg('内容未找到');
						reject(resData);
						break;
					case 500: // 内部服务器错误
						showErrorMsg(resData.msg || '内部服务器错误');
						reject(resData);
						break;
					case 502:
						showErrorMsg(resData.msg);
						reject(resData);
						break;
					default:
						resolve({
							data: resData.data || resData.rows || resData,
							token: resData.token,
							code: resData.code,
							msg: resData.msg,
							total: resData.total,
						});
				}
			})
			.catch((err: any) => {
				console.error('请求错误', err);
			});
	});
};

export default class Request {
	// get方法
	static get(path: string, params: any) {
		return requestFun('GET', path, params);
	}
	// put方法
	static put(params: any) {
		return requestFun('PUT', params);
	}
	// delete方法
	static delete(params: any) {
		return requestFun('DELETE', params);
	}
	// post方法
	static post(path: string, params: string, opts: any = {origin: '', timeout: 30000, loading: false}) {
		return requestFun('POST', path, params, {
			...opts,
		});
	}
}
