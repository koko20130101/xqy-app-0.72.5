/**
 * 转换返回二进制8位字符串函数
 * @param num {number} - 0-255
 * @return string  10101010
 */
export function get0b(num: number) {
	let BinaryStr = num.toString(2);
	while (BinaryStr.length < 8) {
		BinaryStr = '0' + BinaryStr;
	}
	return BinaryStr;
}

/**
 * 转换返回16进制数组拼接的字符串通过buffer
 * @param buffer
 * @return sting
 */
export function ab2hex(buffer: ArrayBuffer) {
	const hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
		return bit.toString(16).slice(-2);
	});
	return hexArr.join('\n');
}

/**
 * 转换返回nubmer通过16进制
 * @param hex {string} - 16进制  '3f'
 * @return number
 */
export function hex2int(hex: string) {
	var len = hex.length,
		a = new Array(len),
		code;
	for (var i = 0; i < len; i++) {
		code = hex.charCodeAt(i);
		if (48 <= code && code < 58) {
			code -= 48;
		} else {
			code = (code & 0xdf) - 65 + 10;
		}
		a[i] = code;
	}

	return a.reduce(function (acc, c) {
		acc = 16 * acc + c;
		return acc;
	}, 0);
}

/**
 * 获取包的数据
 * @param packetHAry {string[]} - 16进制  ['d3','00',...]
 * @param type {number} - 0 正常ECG包 1 跳绳包
 * @return number[]
 */
export function getPacketDataByType(packetHAry: string[]) {
	//解析赋值过来的数组
	let dataValueAry: string[] = [];
	for (const onePacket of packetHAry) {
		dataValueAry = dataValueAry.concat(getOnePacketDataType0(onePacket) as []);
	}
	return dataValueAry;
}

/**
 * 获取一个包的数据 正常ECG包
 * @param onePacket {string} - 16进制通过\n连接的字符串
 * @return number[]
 */
function getOnePacketDataType0(onePacket: string) {
	let dataValueAry = [];
	let onePackageAry = onePacket.split('\n');
	if (onePackageAry[0] === 'd3') {
		//一次6个包
		dataValueAry.push(getNumberByThree0HByte(onePackageAry[2], onePackageAry[3], onePackageAry[4]));
		dataValueAry.push(getNumberByThree0HByte(onePackageAry[5], onePackageAry[6], onePackageAry[7]));
		dataValueAry.push(getNumberByThree0HByte(onePackageAry[8], onePackageAry[9], onePackageAry[10]));
		dataValueAry.push(getNumberByThree0HByte(onePackageAry[11], onePackageAry[12], onePackageAry[13]));
		dataValueAry.push(getNumberByThree0HByte(onePackageAry[14], onePackageAry[15], onePackageAry[16]));
		dataValueAry.push(getNumberByThree0HByte(onePackageAry[17], onePackageAry[18], onePackageAry[19]));
	} else if (onePackageAry[0] === 'd2') {
		//一次16个包
		let data1 = getNumberByThree0HByte(onePackageAry[2], onePackageAry[3], onePackageAry[4]);
		dataValueAry.push(data1);
		//计算data2 - data16
		let dataBefore = data1;
		for (let index = 5; index < 20; index++) {
			dataBefore = dataBefore + hex2int(onePackageAry[index]) - 128;
			dataValueAry.push(dataBefore);
		}
	}
	return dataValueAry;
}

/**
 * 转换返回有符号的number 通过三个字节
 * @param num1 {string} - 16进制  '3f'
 * @return number
 */
function getNumberByThree0HByte(m1: string, m2: string, m3: string) {
	let temp1 = hex2int(m1);
	let num = get0b(temp1) + get0b(hex2int(m2)) + get0b(hex2int(m3));
	if (temp1 < 128) {
		return parseInt(num, 2);
	} else {
		return parseInt(num, 2) - 16777216;
	}
}
