import { describe, it, expect } from 'vitest';
import { getGenTheme, GEN_THEME, DEFAULT_GEN_THEME } from './genTheme';

/** 未知の世代番号（データに存在しない） */
const UNKNOWN_GENERATION = 99;

describe('getGenTheme', () => {
	it('第3世代のテーマを返す', () => {
		expect(getGenTheme(3)).toEqual({
			gradient: 'from-red-50 to-orange-50',
			border: 'border-red-200',
			accent: 'text-red-700'
		});
	});

	it('第9世代のテーマを返す', () => {
		expect(getGenTheme(9)).toEqual({
			gradient: 'from-violet-50 to-purple-50',
			border: 'border-violet-200',
			accent: 'text-violet-700'
		});
	});

	it('未知の世代はデフォルトテーマを返す', () => {
		expect(getGenTheme(UNKNOWN_GENERATION)).toEqual(DEFAULT_GEN_THEME);
	});

	it('第3〜9世代がすべて定義されている', () => {
		for (let gen = 3; gen <= 9; gen++) {
			expect(GEN_THEME[gen]).toBeDefined();
		}
	});
});
