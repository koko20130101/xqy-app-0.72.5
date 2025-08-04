/**
 * 判断是否为对象
 * @method isObject
 * @param {any} value 需要检查的值
 */
export const isObject = function (value: any) {
	return Object.prototype.toString.call(value) === '[object Object]';
};

/**
 * 判断对象是否为空对象
 * @method isEmptyObject
 * @param {any} obj 需要检查的值
 */
export const isEmptyObject = function (obj: object) {
	for (let i in obj) {
		return false;
	}
	return true;
};

/**
 * 判断是否为数组
 * @method isArray
 * @param {Array} value 需要检查的值
 */
export const isArray = function (value: any) {
	return Array.isArray ? Array.isArray(value) : Object.prototype.toString.call(value) === '[object Array]';
};

/**
 * 是否为JSON字符串
 * @method isJSON
 * @param {string} str 需要检查的值
 */
export const isJSON = function (str: string) {
	if (typeof str === 'string') {
		try {
			var obj = JSON.parse(str);
			if (typeof obj == 'object' && obj) {
				return true;
			} else {
				return false;
			}
		} catch (e) {
			return false;
		}
	}
};

/**
 * 判断是否为数字， str会转为number判断
 * @method isNumber
 * @param {any}} value 需要检查的值
 */
export const isNumber = function (val: any) {
	var regPos = /^\d+(\.\d+)?$/; // 非负浮点数
	var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; // 负浮点数
	if (regPos.test(val) || regNeg.test(val)) {
		return true;
	} else {
		return false;
	}
};

/**
 * 流程控制：延迟函数
 * @method sleep
 * @param {number}  time  延迟时间--毫秒
 */
export const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));

/**
 * 防抖函数
 * @method debounce
 * @param {function}  func  要执行的函数
 * @param {number}    delay   延迟时间
 * @param {boolen}    immediate   是否立即执行, 默认true
 * @desc 用于在短时间内多次触发同一个函数，只执行最后一次，或者只在开始时执行，如：拖拽改变窗口大小
 */
export const debounce = function (func: any, delay: number, immediate?: boolean) {
	let timer: any = null;
	return function (this: typeof func) {
		let context = this;
		let args = arguments;
		if (timer) clearTimeout(timer);
		if (immediate) {
			var doNow = !timer;
			timer = setTimeout(function () {
				timer = null;
			}, delay);
			if (doNow) func.apply(context, args);
		} else {
			timer = setTimeout(function () {
				func.apply(context, args);
			}, delay);
		}
	};
};

export const atob = (encoded: string) => {
	var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var output = '';
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;

	encoded = encoded.replace(/[^A-Za-z0-9+/=]/g, '');

	while (i < encoded.length) {
		enc1 = keyStr.indexOf(encoded.charAt(i++));
		enc2 = keyStr.indexOf(encoded.charAt(i++));
		enc3 = keyStr.indexOf(encoded.charAt(i++));
		enc4 = keyStr.indexOf(encoded.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		output = output + String.fromCharCode(chr1);
		if (enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}
	}

	return output;
};

/**
 * 将base64转换为Blob
 * @method dataURLtoBlob
 * @param {string} dataurl  base64数据
 * @param {string} filename  文件名
 */
export const dataURLtoBlob = function (base64Str: string) {
	// 去除base64字符串的前缀（如果有的话）
	const base64: any = base64Str.replace(/^data:\w+\/\w+;base64,/, '');
	// 将base64字符串转换为TypedArray
	const binaryArray = base64.match(/.{1,2}/g).map((binary: any) => String.fromCharCode(parseInt(binary, 2)));
	// 转换为Blob对象
	const blob = new Blob([binaryArray], {type: 'audio/mp3'} as any);
	// 返回二进制数据
	return blob;
};

/**
 * 生成随机字符串
 * @method randomString
 * @param {number} len  生成的长度
 */
// 导出一个名为 randomString 的常量，它是一个函数，用于生成指定长度的随机字符串
// 导出一个名为 randomString 的常量，它是一个函数，用于生成指定长度的随机字符串
export const randomString = function (len = 48) {
	const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
	const maxPos = chars.length;
	let str = '';
	let i = 0;
	while (i < len) {
		str += chars.charAt(Math.floor(Math.random() * maxPos));
		if (i == 0 && [2, 3, 4, 5, 6, 7, 8].includes(Number(str))) {
			// 首个字符不能是数字
		} else {
			i++;
		}
	}
	return str;
};
