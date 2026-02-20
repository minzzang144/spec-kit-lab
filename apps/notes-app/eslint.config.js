import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['dist', 'public/mockServiceWorker.js'] },

	// 공통 설정 (JS + TS 모두 적용)
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'simple-import-sort': simpleImportSort,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			'simple-import-sort/exports': 'error',
		},
	},

	// JS/JSX 전용 — 기본 ESLint만
	{
		files: ['**/*.{js,jsx}'],
		extends: [js.configs.recommended],
	},

	// TS/TSX 전용 — typescript-eslint 추가
	{
		files: ['**/*.{ts,tsx}'],
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
		},
	},
);
