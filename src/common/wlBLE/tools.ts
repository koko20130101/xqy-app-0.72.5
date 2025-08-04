import {get0b} from './dataChange';
import {getElectPecent} from './elect';

/**
 * 获取设备SN
 * @param onedata
 */
export const getDeivceSN = (onedata: Buffer) => {
	if (onedata.length != 20) {
		return '';
	} else {
		let month: any = onedata[8] % 16;
		if (month < 10) {
			month = '0' + month;
		} else {
			month = '' + month;
		}
		//求出对应的十进制
		let value: any = '';
		for (let index = 3; index < 8; index++) {
			value += get0b(onedata[index]);
		}
		value = parseInt(value, 2);
		value += '';
		let SN = value.substr(value.length - 12, 2);
		SN += month;
		let typeChars = ['B', 'C', 'E', 'H', 'M', 'N', 'P', 'S', 'T', 'U'];
		SN += typeChars[Number(value.substr(value.length - 10, 1))];
		SN += typeChars[Number(value.substr(value.length - 9, 1))];
		SN += value.substr(value.length - 8);
		return SN;
	}
};

/**
 * 获取设备版本
 * @param onedata
 */
export const getDeivceVersion = (onedata: Buffer) => {
	if (onedata.length != 20) {
		return '';
	} else {
		return 'V' + onedata[13] + '.' + onedata[14] + '.0';
	}
};

export const getDeivceOriginalElectricity = (onedata: Buffer) => {
	return (onedata[9] * 255 + onedata[10]) / 100;
};

export const getDeivceElectricity = (onedata: Buffer) => {
	let dy = getDeivceOriginalElectricity(onedata);
	let value = getElectPecent(dy);
	value = Math.sqrt(value) * 10;
	return Number(value.toFixed(0));
};
