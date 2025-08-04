/**
 * 表单验证类
 * @class Validator
 * @example
 *  let validator = new Validator();
 *  validator.addStrategy(formData['creditNo'], [{
      strategy: 'isNonEmpty',
      errorMsg: '身份证号不能为空'
    }, {
      strategy: 'isIdCard',
      errorMsg: '请输入正确的身份证号码'
    }])
    let errorMsg = validator.startValidate()
    if(!!errorMsg) return
*/
class Validator {
	//策略对象
	strategies = {
		//不能为空
		isNonEmpty: function (value: string, errorMsg: string) {
			if (!value || value === '') {
				return errorMsg;
			}
		},
		//验证长度
		minLength: function (value: string, length: number, errorMsg: string) {
			if (value.length < length) {
				return errorMsg;
			}
		},
		//数字类型
		isNumber: function (value: string, errorMsg: string) {
			if (!/(^[0-9]*$)/.test(value)) {
				return errorMsg;
			}
		},
		//货币类型
		isMoney: function (value: string, errorMsg: string) {
			if (!/(^[0-9]+(.[0-9]{1,2})?$)/.test(value)) {
				return errorMsg;
			}
		},
		//中文
		isChinese: function (value: string, errorMsg: string) {
			if (!/(^[\u4E00-\u9FA5]*$)/.test(value)) {
				return errorMsg;
			}
		},
		//验证手机号
		isMobile: function (value: string, errorMsg: string) {
			if (!/^1[3,4,5,6,7,8,9][0-9]{9,9}$/.test(value)) {
				return errorMsg;
			}
		},
		//验证密码格式
		isPassword: function (value: string, errorMsg: string) {
			if (!/^[a-zA-Z]\S{5,15}/gi.test(value)) {
				return errorMsg;
			}
		},
		//验证支付密码格式
		isPayPassword: function (value: string, errorMsg: string) {
			if (!/\d{6}$/.test(value)) {
				return errorMsg;
			}
		},
		//验证身份证
		isIdCard: function (value: string, errorMsg: string) {
			if (!/\d{17}[\d|x]|\d{15}/.test(value)) {
				return errorMsg;
			}
		},
		//护照
		isPassport: function (value: string, errorMsg: string) {
			if (
				!/^1[45][0-9]{7}$|([P|p|S|s]\d{7}$)|([S|s|G|g]\d{8}$)|([Gg|Tt|Ss|Ll|Qq|Dd|Aa|Ff]\d{8}$)|([H|h|M|m]\d{8,10})$/.test(
					value,
				)
			) {
				return errorMsg;
			}
		},
		//军官证或士兵证
		isSoldbuch: function (value: string, errorMsg: string) {
			if (!/^[a-zA-Z0-9]{7,21}$/.test(value)) {
				return errorMsg;
			}
		},
		//港澳回归证 和 台胞证
		isIdCardHK_TW: function (value: string, errorMsg: string) {
			if (!/^[a-zA-Z0-9]{5,21}$/.test(value)) {
				return errorMsg;
			}
		},
		//验证邮箱
		isEmail: function (value: string, errorMsg: string) {
			if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(value)) {
				return errorMsg;
			}
		},
	};
	cache: any[] = []; //缓存验证方法列表
	//添加策略
	addStrategy(value: string, rules: any[]) {
		let self: any = this;
		for (let rule of rules) {
			let strategyAry = rule.strategy.split(':');
			let errorMsg = rule.errorMsg;
			self.cache.push(function () {
				let strategy = strategyAry.shift();
				strategyAry.unshift(value);
				strategyAry.push(errorMsg);
				return self.strategies[strategy].apply(self, strategyAry);
			});
		}
	}

	//开始验证
	startValidate() {
		for (let validatorFunc in this.cache) {
			let errorMsg = this.cache[validatorFunc]();
			if (errorMsg) {
				return errorMsg;
			}
		}
	}
}

export default Validator;
