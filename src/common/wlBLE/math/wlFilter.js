let temp_all = [
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0]
];

function initTemp_all(){
	temp_all = [
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0]
	];
}

export function wlFilter(originSig) {
	initTemp_all()
	let outSigData0 = wlphasefilt(originSig);
	initTemp_all()
	let outSigData1 = wlcommonfilt(outSigData0, true);
	initTemp_all()
	return wlcommonfilt(outSigData1, false);
}


function iir_stream_all(X01, X11, X2, SOS, G, TAP_NUM) {
	let X0 = X01;
	let X1 = X11;
	let temp = X2;
	for (let i = 0; i < TAP_NUM; i++) {
		let Y0 = temp_all[i][0];
		let Y1 = temp_all[i][1];
		temp = G[i] * (temp * SOS[i][0] + X1 * SOS[i][1] + X0 * SOS[i][2]) - Y1 * SOS[i][4] - Y0 * SOS[i][5];
		X0 = Y0;
		X1 = Y1;
		temp_all[i][0] = Y1;
		temp_all[i][1] = temp;
	}
	return temp;
}

// 计算指标 低通40HZ
function wlcommonfilt(x_in, positive) {
	let G = [0.9911535951016633,
		0.9681522377236349,
		0.9681522377236349,
		0.9408092961815946,
		0.05499010707291403,
		0.04613180209331293,
		0.04220640333661781
	];

	let SOS = [
		[1.0, -2.0, 1.0, 1.0, -1.982228929792528, 0.9823854506141251],
		[1.0, -1.621233121980644, 1.0, 1.0, -1.501787337686438, 0.9347547531033475],
		[1.0, -1.621233121980644, 1.0, 1.0, -1.633042983240282, 0.9436248404806153],
		[1.0, -1.621233121980644, 1.0, 1.0, -1.525271192436899, 0.8816185923631893],
		[1.0, 2.0, 1.0, 1.0, -1.558312063461799, 0.7782724917534555],
		[1.0, 2.0, 1.0, 1.0, -1.307285028849323, 0.4918122372225753],
		[1.0, 2.0, 1.0, 1.0, -1.196046906902314, 0.3648725202487851]
	];

	return wlbasecommonfilt(x_in, positive, SOS, G, 7);
}

function wlbasecommonfilt(x_in, positive, SOS, G, TAP_NUM) {
	let x = [0, 0, 0];
	for (let i = 0; i < TAP_NUM; i++) {
		temp_all[i][0] = 0;
		temp_all[i][1] = 0;
	}
	let y_out = new Array(x_in.length);
	if (positive) {
		for (let j = 0; j < x_in.length; j++) {
			if (j == 0) {
				x[0] = x_in[j];
				x[1] = x_in[j];
				x[2] = x_in[j];
			} else if (j == 1) {
				x[0] = x_in[j - 1];
				x[1] = x_in[j - 1];
				x[2] = x_in[j];
			} else {
				x[0] = x_in[j - 2];
				x[1] = x_in[j - 1];
				x[2] = x_in[j];
			}
			y_out[j] = iir_stream_all(x[0], x[1], x[2], SOS, G, TAP_NUM);
		}
	} else {
		for (let j = x_in.length - 1; j >= 0; j--) {
			if (j == x_in.length - 1) {
				x[0] = x_in[j];
				x[1] = x_in[j];
				x[2] = x_in[j];
			} else if (j == x_in.length - 2) {
				x[0] = x_in[j + 1];
				x[1] = x_in[j + 1];
				x[2] = x_in[j];
			} else {
				x[0] = x_in[j + 2];
				x[1] = x_in[j + 1];
				x[2] = x_in[j];
			}
			y_out[j] = iir_stream_all(x[0], x[1], x[2], SOS, G, TAP_NUM);
		}
	}
	return y_out;
}

//相位校正滤波
function wlphasefilt(x_in) {
	let y_out = new Array(x_in.length);
	let x = [0, 0, 0];
	let G = [0.9987449394335488];

	let SOS = [
		[1.0, -1.0, 0, 1.0, -0.9974898788670975, 0]
	];
	for (let i = 0; i < 1; i++) {
		temp_all[i][0] = 0;
		temp_all[i][1] = 0;
	}

	for (let j = x_in.length - 1; j >= 0; j--) {
		if (j == x_in.length - 1) {
			x[0] = x_in[j];
			x[1] = x_in[j];
			x[2] = x_in[j];
		} else if (j == x_in.length - 2) {
			x[0] = x_in[j + 1];
			x[1] = x_in[j + 1];
			x[2] = x_in[j];
		} else {
			x[0] = x_in[j + 2];
			x[1] = x_in[j + 1];
			x[2] = x_in[j];
		}
		y_out[j] = iir_stream_all(x[0], x[1], x[2], SOS, G, 1);
	}
	return y_out;
}
