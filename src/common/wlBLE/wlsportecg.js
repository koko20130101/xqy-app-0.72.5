import {medianBiquad} from './wlbiquad.js';
import {wlFilter} from './math/wlFilterTool.js';
import {mean, median} from './math/tool.js';
import {computeECG} from './wlecg_ori.js';

let g_meanHR = 0;
let g_state = 0;
let g_stateBuffer = 0;
let g_meanRR = 0;
let g_RRLast = 0;
let g_RR6s = [];
let g_meanHR5s = [];
let g_continuous3s = 0;

export function getg_state() {
	return g_state;
}

export function clearSportECGCache() {
	g_meanHR = 0;
	g_state = 0;
	g_stateBuffer = 0;
	g_meanRR = 0;
	g_RRLast = 0;
	g_RR6s = [];
	g_meanHR5s = [];
	g_continuous3s = 0;
}

export function computeSportECG(metric, twoThousandPointDataAry) {
	//计算运动心率业务逻辑层
	switch (metric) {
		case 1:
			return logic_1(twoThousandPointDataAry); //logic_1的接口结构和原来的computerECG一致
	}
}

function computeHR(RRs, beforeMeanRR) {
	if (RRs.length < 1) {
		return 0;
	}
	let avgValue = 0;
	if (beforeMeanRR > 0) {
		avgValue = beforeMeanRR;
	} else {
		avgValue = mean(RRs);
	}
	let newRRs = [];
	for (let item of RRs) {
		if (Math.abs(item - avgValue) < avgValue * 0.2) {
			newRRs.push(item);
		}
	}
	let maxInterval = Math.max.apply(null, newRRs);
	let minInterval = Math.min.apply(null, newRRs);
	if (newRRs.length > 5 && maxInterval / minInterval < 1.5) {
		return Number((15000 / median(newRRs)).toFixed(1));
	} else {
		return 0;
	}
}
/**
 * 获取sig0是滤波后的数据
 */
function getSig0(fiveDataValueAry) {
	let x = [];
	if (fiveDataValueAry.length < 2000) {
		//不够2000补齐2000个点
		let tempAry = new Array(2000 - fiveDataValueAry.length).fill(0);
		x = tempAry.concat(fiveDataValueAry);
	} else {
		x = fiveDataValueAry.slice(fiveDataValueAry.length - 2000);
	}

	let x0 = x[0];
	for (let idx = 0; idx < x.length; idx++) {
		x[idx] = x[idx] - x0;
	}
	return wlFilter(x);
}

//计算心率
function computeHRinterval(sig1, sig2) {
	let sig4 = new Array(sig2.length).fill(0);
	let m2 = 4; //？
	for (let idx = m2; idx < sig2.length - m2; idx++) {
		sig4[idx] = sig2[idx] - sig2[idx + m2];
	}
	let m = 7; //？
	let sig3 = new Array(sig2.length).fill(0);
	for (let idx = m; idx < sig4.length - m; idx++) {
		sig3[idx] = sig4[idx] - sig4[idx - m];
	}

	let threshold1 = Math.max.apply(null, sig3) * 0.4;
	threshold1 = Math.min(threshold1, 500); //250
	let threshold = Math.max(80, threshold1); //50
	let indexPeak = [];
	let peakConfidence = [];
	let indexSwave = [];
	let lastPeak = -10000;
	for (let i = m; i < sig3.length - m; i++) {
		if (sig3[i] > threshold && sig3[i] >= sig3[i - 1] && sig3[i] >= sig3[i + 1] && i - lastPeak > 60) {
			let bFindRR = false;
			let idx = i;
			for (let j = -m; j < m; j++) {
				if (sig1[i - j] >= sig1[i - j - 1] && sig1[i - j] >= sig1[i - j + 1]) {
					bFindRR = true;
					peakConfidence.push(sig3[i] / threshold); //用sig3[i]和threshold做商（或其它操作）形成R峰置信度（暂时不可用）
					idx = i - j;
					break;
				}
			}
			if (bFindRR) {
				indexPeak.push(idx);
				lastPeak = idx;
				for (let j = 0; j < 2 * m; j++) {
					if (sig1[i + j] <= sig1[i + j - 1] && sig1[i + j] <= sig1[i + j + 1]) {
						indexSwave.push(i + j);
						break;
					}
				}
			}
		}
	}

	let noRpeak = false;
	let intervalAry = [];
	let intervalAry1 = [];
	if (indexPeak.length >= 2) {
		let intervalTempAry = [];
		let intervalTemp = 0;
		for (let idx = 1; idx < indexPeak.length; idx++) {
			intervalTempAry.push(indexPeak[idx] - indexPeak[idx - 1]);
		}

		for (let idx = 0; idx < intervalTempAry.length; idx++) {
			intervalTemp = intervalTempAry[idx];
			if (intervalTemp > 75 && intervalTemp < 250) {
				intervalAry.push(intervalTemp); //只有可信的间期才能加入intervalAry，如何计算置信度是一个课题
			}
		}

		if (0 === intervalAry.length) {
			noRpeak = true;
		} else {
			let meanInterval = mean(intervalAry);
			let threshold = meanInterval * 0.5;
			let intervalAryTempTemp = [];
			for (let item of intervalAry) {
				if (Math.abs(item - meanInterval) <= threshold) {
					intervalAryTempTemp.push(item);
				}
			}
			intervalAry1 = intervalAryTempTemp;
		}
	} else {
		noRpeak = true;
	}

	return {
		intervalAry,
		intervalAry1,
		indexPeak,
		peakConfidence,
		noRpeak,
		indexSwave,
	};
}

/**
 * 计算ECG：4秒2000个点 包括心率和波形
 */
function computeExerciseHR(sig0) {
	const NUM = 1000;
	let sig1 = new Array(NUM).fill(0);
	for (let idx = 0; idx < NUM; idx++) {
		sig1[idx] = sig0[idx * 2];
	}
	let Nshift = 25;
	let sig2 = medianBiquad(sig1, 25);
	//三秒计算心率，如何计算更短间隔内的心率是一个课题
	let HRIntervalObj = computeHRinterval(sig1.slice(250 - Nshift, 1000 - Nshift), sig2.slice(250 - Nshift, 1000 - Nshift));

	return HRIntervalObj;
}

function judgecomputeECGMeanHR(result1) {
	if (result1.isSigunsteady || result1.meanHR < 1) {
		return true; //不直接出心率，需要再计算
	} else {
		if (g_state === 5) {
			return false; //直接出心率
		} else {
			if (result1.secondSteady === 3) {
				return false; //直接出心率
			} else {
				return true; //不直接出心率，需要再计算
			}
		}
	}
}

function logic_1(tempAry) {
	let sig0 = getSig0(tempAry);
	let result1 = computeECG(sig0);
	let result = computeExerciseHR(sig0);
	if (g_RR6s.length > 4) {
		g_RR6s.shift();
	}

	g_RR6s.push(result.intervalAry);
	if (judgecomputeECGMeanHR(result1)) {
		//用以前的心率判断条件
		//不平稳
		if (g_RRLast > 0) {
			g_meanHR = g_RRLast;
			g_RRLast = 0;
			g_state = 2;
		} else {
			if (g_state === 5) {
				g_meanHR = 0;
			} else {
				if (g_meanHR > 1 && g_stateBuffer < 4) {
					let concatRR6s = [];
					for (let item of g_RR6s) {
						concatRR6s = concatRR6s.concat(item);
					}
					g_meanHR = computeHR(concatRR6s, g_meanRR);
					if (g_meanHR > 0) {
						g_state = 3;
					} else {
						g_continuous3s++;
						if (g_continuous3s >= 3) {
							g_state = 5;
							g_continuous3s = 0;
						} else {
							g_state = 4;
						}
					}
				} else {
					g_continuous3s++;
					if (g_continuous3s >= 3) {
						g_state = 5;
						g_continuous3s = 0;
					} else {
						g_state = 4;
					}
					g_meanHR = 0;
				}
			}
		}
		g_stateBuffer++;
	} else {
		g_meanHR = result1.meanHR;
		g_meanRR = 15000 / g_meanHR;
		g_RRLast = g_meanHR;
		g_state = 1;
		g_stateBuffer = 0;
	}

	if (g_meanHR > 0) {
		if (g_meanHR5s.length > 4) {
			g_meanHR5s.shift();
		}
		g_meanHR5s.push(g_meanHR);
		let newMeanBuffer = [];
		g_meanHR5s.forEach(item => {
			if (item) {
				newMeanBuffer.push(item);
			}
		});
		if (newMeanBuffer.length === 5) {
			newMeanBuffer.sort();
			g_meanHR = (newMeanBuffer[1] + newMeanBuffer[2] + newMeanBuffer[3]) / 3;
		} else {
			g_meanHR = median(newMeanBuffer);
		}
	}

	result1.meanHR = g_meanHR;
	return result1;
}
