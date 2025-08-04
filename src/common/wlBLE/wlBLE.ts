import {Buffer} from 'buffer';
import {ECGModel} from '@/models/index.js';
import {ab2hex, getPacketDataByType} from './dataChange';
import {computeSportECG, clearSportECGCache} from './wlsportecg.js';
import {median} from './math/tool.js';

class wlBLE {
	g_wlBLE_OrigenDataAry16: string[] = []; // 蓝牙总数据
	g_wlBLE_OneSecondDataAry: string[] = []; // 1秒的蓝牙数据
	// 质量判断
	g_wlBLE_packageSN = -1;
	g_wlBLE_lostPackageTotal = 0; // 丢包次数
	//显示波形需要(5秒的数据)
	g_wlBLE_fiveSecondDataAry: any = [];
	//处理心电波形图自适应
	g_wlBLE_fiveRPeakHeights: any[] = [];
	g_wlBLE_fiveSWaveHeights: any[] = [];

	// 初始化
	public initData = () => {
		this.g_wlBLE_OrigenDataAry16 = [];
		this.g_wlBLE_fiveRPeakHeights = [];
		this.g_wlBLE_fiveSWaveHeights = [];
		this.g_wlBLE_lostPackageTotal = 0;
		clearSportECGCache();
	};

	// 接收数据
	public receiveData(data: any) {
		// 得到的data为base64数据，要处理成buffer数据
		const buffer = Buffer.from(data, 'base64');
		// 16进制数据
		const data16: string = ab2hex(buffer);
		if (buffer[0] === 210 || buffer[0] === 211) {
			// 心电包
			this.g_wlBLE_OrigenDataAry16.push(data16); // 存总数据
			if (this.g_wlBLE_OrigenDataAry16.length > 20000) {
				// 超过2万个包就认为没有正在再检测
				this.g_wlBLE_OrigenDataAry16 = [];
			}
			this.g_wlBLE_OneSecondDataAry.push(data16); // 存一秒的数据

			// 判断丢包
			if (buffer[1] - this.g_wlBLE_packageSN === 1 || buffer[1] - this.g_wlBLE_packageSN === -255) {
				this.g_wlBLE_packageSN = buffer[1];
			} else {
				if (buffer[1] < this.g_wlBLE_packageSN) {
					this.g_wlBLE_lostPackageTotal += Math.abs(buffer[1] + 255 - this.g_wlBLE_packageSN);
				} else {
					this.g_wlBLE_lostPackageTotal += Math.abs(buffer[1] - this.g_wlBLE_packageSN - 1);
				}
				this.g_wlBLE_packageSN = buffer[1];
			}
		}
	}

	// 重置丢包总数
	clearlostPackageTotal() {
		this.g_wlBLE_lostPackageTotal = 0;
	}

	// 处理一秒的数据
	oneminutecallback() {
		let oneValueArray = getPacketDataByType(this.g_wlBLE_OneSecondDataAry);
		this.g_wlBLE_OneSecondDataAry = [];
		if (this.g_wlBLE_fiveSecondDataAry.length === 6) {
			this.g_wlBLE_fiveSecondDataAry.pop();
		}
		this.g_wlBLE_fiveSecondDataAry.unshift(oneValueArray);
	}

	// 获取当前一秒的心电数据 心率和画图
	getCurrentSportHRAndDrawdata() {
		// 5个样本数据
		let fiveDataValueAry: string[] = [];
		for (let index = this.g_wlBLE_fiveSecondDataAry.length; index > 0; index--) {
			fiveDataValueAry = fiveDataValueAry.concat(this.g_wlBLE_fiveSecondDataAry[index - 1]);
		}
		// 获取计算的心电图数据
		let ecgResultObj: ECGModel = computeSportECG(1, fiveDataValueAry) as any;
		let ecgResult: ECGModel = {
			isSigunsteady: ecgResultObj.isSigunsteady, // 信号是否稳定
			noRpeak: ecgResultObj.noRpeak,
			meanHR: ecgResultObj.meanHR || 0, // 平均心率
			RHeight: 0, // 心跳波形
			SWaveHeight: 0, // 心跳波形
			drawDataAry: ecgResultObj.drawDataAry,
		};

		if (!ecgResultObj.isSigunsteady) {
			if (this.g_wlBLE_fiveRPeakHeights.length === 5) {
				this.g_wlBLE_fiveRPeakHeights.shift();
			}
			this.g_wlBLE_fiveRPeakHeights.push(ecgResultObj.RPeakHeight);
			ecgResult.RHeight = median(this.g_wlBLE_fiveRPeakHeights);

			if (this.g_wlBLE_fiveSWaveHeights.length === 5) {
				this.g_wlBLE_fiveSWaveHeights.shift();
			}
			this.g_wlBLE_fiveSWaveHeights.push(ecgResultObj.SwaveMinHeight);
			ecgResult.SWaveHeight = median(this.g_wlBLE_fiveSWaveHeights);
		}
		return {lostPackageTotal: this.g_wlBLE_lostPackageTotal, ecgResult};
	}
}

export default wlBLE;
