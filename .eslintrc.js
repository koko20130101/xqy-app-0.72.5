module.exports = {
	root: true,
	extends: '@react-native',
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	parser: '@typescript-eslint/parser',
	plugins: ['react-refresh'],
	rules: {
		'@typescript-eslint/no-unused-vars': [
			'error',
			{argsIgnorePattern: '^_', varsIgnorePattern: '^_'}, // 忽略了以_开头的变量
		],
		'react-refresh/only-export-components': ['warn', {allowConstantExport: true}],
		'react-hooks/exhaustive-deps': 0, // 去除useEffect依赖项警告
	},
};
