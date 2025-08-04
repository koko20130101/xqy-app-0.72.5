import AsyncStorage from '@react-native-async-storage/async-storage';
import {isJSON, isObject, isArray} from './index';

/**
 * @method setStorage
 * @param storage
 */
const setStorage = {
	// 获取
	get: async function (key: string) {
		var value: string = (await AsyncStorage.getItem(key)) || '';
		value = isJSON(value) ? JSON.parse(value) : value;
		return value;
	},
	// 设置
	set: function (key: string, value: any) {
		if (isObject(value) || isArray(value)) {
			// 如果是对象
			value = JSON.stringify(value);
		}
		AsyncStorage.setItem(key, value);
	},
	// 删除项
	remove: function (key: string) {
		AsyncStorage.removeItem(key);
	},
	//  清空
	clear: function () {
		AsyncStorage.clear(); // 清空本地存储
	},
};

export default setStorage;
