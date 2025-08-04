/**
 * 求中值
 * @param arr {number[]}
 * @return number
 */
export function median(arr) {
	if(arr.length < 1){
		return 0
	}
	const mid = Math.floor(arr.length / 2)
	let nums = [...arr].sort((a, b) => a - b);
	return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}


/**
 * 求平均数
 * @param arr {number[]}
 * @return number
 */
export function mean(arr) {
	if (arr.length > 0) {
		let sum = 0;
		for (let i = 0; i < arr.length; i++) {
			sum += arr[i];
		}
		return sum / arr.length;
	} else {
		return 0
	}
}


/**
 * 求方差
 * @param arr {number[]}
 * @return number
 */
export function wlvar(arr) {
	if (arr.length > 1) {
		let  avg = mean(arr)
		let sum = 0;
		for (let i = 0; i < arr.length; i++) {
			sum += Math.pow(arr[i] - avg,2);
		}
		return (sum / (arr.length - 1));
	} else {
		return 0
	}
}

/**
 * 求数组中绝对值最大的值
 * @param arr {number[]}
 * @return number
 */
export function absMax(arr) {
	if (arr.length > 0) {
		let max = 0;
		for (let i = 0; i < arr.length; i++) {
			if(Math.abs(arr[i]) > max ){
				max = Math.abs(arr[i]) 
			}
		}
		return max;
	} else {
		return 0
	}
}

export function compare(x, y) {
	if (x < y) {
		return -1
	} else if (x > y) {
		return 1
	} else {
		return 0
	}
}