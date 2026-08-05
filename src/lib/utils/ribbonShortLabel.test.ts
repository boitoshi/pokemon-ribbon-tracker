import { describe, it, expect } from 'vitest';
import type { Ribbon } from '$lib/types';
import { getRibbonShortLabel, getRibbonShortLabelText } from './ribbonShortLabel';
import { RIBBONS_GEN3 } from '$lib/data/ribbons-gen3';
import { RIBBONS_GEN4 } from '$lib/data/ribbons-gen4';
import { RIBBONS_GEN5 } from '$lib/data/ribbons-gen5';
import { RIBBONS_GEN6 } from '$lib/data/ribbons-gen6';
import { RIBBONS_GEN7 } from '$lib/data/ribbons-gen7';
import { RIBBONS_GEN8 } from '$lib/data/ribbons-gen8';
import { RIBBONS_GEN9 } from '$lib/data/ribbons-gen9';
import { MARKS } from '$lib/data/marks';

function makeRibbon(name: string, overrides: Partial<Ribbon> = {}): Ribbon {
	return {
		id: 'test',
		name,
		description: '',
		generation: 3,
		games: [],
		category: 'コンテスト',
		...overrides
	};
}

describe('getRibbonShortLabel', () => {
	it('末尾の「リボン」を落とす', () => {
		expect(getRibbonShortLabel(makeRibbon('アースリボン'))).toEqual(['アース']);
		expect(getRibbonShortLabel(makeRibbon('チャンピオンリボン'))).toEqual(['チャンピオン']);
	});

	it('ランクが「リボン」の後ろに付く場合は行で割る', () => {
		// name.replace(/リボン$/, '') では一切効かない形。しかも 1行 truncate では
		// 識別語であるランクが真っ先に切れていた
		expect(getRibbonShortLabel(makeRibbon('クールリボンスーパー'))).toEqual(['クール', 'スーパー']);
		expect(getRibbonShortLabel(makeRibbon('ジーニアスリボンマスター'))).toEqual([
			'ジーニアス',
			'マスター'
		]);
		expect(getRibbonShortLabel(makeRibbon('ビューティーリボンウルトラ'))).toEqual([
			'ビューティー',
			'ウルトラ'
		]);
	});

	it('ランクが「リボン」の前に付く場合も行で割る', () => {
		expect(getRibbonShortLabel(makeRibbon('かっこよさマスターリボン'))).toEqual([
			'かっこよさ',
			'マスター'
		]);
		expect(getRibbonShortLabel(makeRibbon('ロイヤルマスターリボン'))).toEqual([
			'ロイヤル',
			'マスター'
		]);
	});

	it('複合語は系統語の手前で割り、修飾語を1行目に丸ごと乗せる', () => {
		expect(getRibbonShortLabel(makeRibbon('グレートアビリティリボン'))).toEqual([
			'グレート',
			'アビリティ'
		]);
		expect(getRibbonShortLabel(makeRibbon('ゴージャスロイヤルリボン'))).toEqual([
			'ゴージャス',
			'ロイヤル'
		]);
		expect(getRibbonShortLabel(makeRibbon('トゥインクルスターリボン'))).toEqual([
			'トゥインクル',
			'スター'
		]);
		expect(getRibbonShortLabel(makeRibbon('マスタータワーリボン'))).toEqual(['マスター', 'タワー']);
	});

	it('系統語だけの名前は割らない', () => {
		expect(getRibbonShortLabel(makeRibbon('アビリティリボン'))).toEqual(['アビリティ']);
		expect(getRibbonShortLabel(makeRibbon('ロイヤルリボン'))).toEqual(['ロイヤル']);
	});

	it('ランクが系統語より優先される', () => {
		// 「ロイヤルマスター」は「スター」ではなく「マスター」で割る
		expect(getRibbonShortLabel(makeRibbon('ロイヤルマスターリボン'))).toEqual([
			'ロイヤル',
			'マスター'
		]);
	});

	it('かばん語の「リボン」は落とさない', () => {
		// がんばり + リボン。落とすと「がんば」になって語が壊れる
		for (const name of [
			'がんばリボン',
			'うっかリボン',
			'ぐっすリボン',
			'しゃっきリボン',
			'しょんぼリボン',
			'たっきリボン',
			'どっきリボン',
			'にっこリボン'
		]) {
			expect(getRibbonShortLabel(makeRibbon(name))).toEqual([name]);
		}
	});

	it('あかしは「のあかし」を落とす', () => {
		expect(getRibbonShortLabel(makeRibbon('しょうごのあかし', { category: 'あかし' }))).toEqual([
			'しょうご'
		]);
		expect(getRibbonShortLabel(makeRibbon('さいきょうのあかし', { category: 'あかし' }))).toEqual([
			'さいきょう'
		]);
	});

	it('データが shortLabel を持っていればそれを優先する', () => {
		const ribbon = makeRibbon('クールリボンスーパー', { shortLabel: '手動指定' });
		expect(getRibbonShortLabel(ribbon)).toEqual(['手動指定']);
	});

	it('チャンプ系は地方名で行を割る', () => {
		expect(getRibbonShortLabel(makeRibbon('ホウエンチャンプリボン'))).toEqual([
			'ホウエン',
			'チャンプ'
		]);
		expect(getRibbonShortLabel(makeRibbon('ナショナルチャンプリボン'))).toEqual([
			'ナショナル',
			'チャンプ'
		]);
		// 地方名のない初代チャンプは割らない
		expect(getRibbonShortLabel(makeRibbon('チャンプリボン'))).toEqual(['チャンプ']);
	});

	it('助詞を挟まないあかしも「あかし」を落とす', () => {
		expect(getRibbonShortLabel(makeRibbon('つりあげられたあかし', { category: 'あかし' }))).toEqual(
			['つりあげられた']
		);
		expect(getRibbonShortLabel(makeRibbon('でっかいあかし', { category: 'あかし' }))).toEqual([
			'でっかい'
		]);
	});

	it('行構造を持てない場所向けに1本の文字列も出せる', () => {
		expect(getRibbonShortLabelText(makeRibbon('クールリボンスーパー'))).toBe('クール スーパー');
	});
});

describe('実データ全件', () => {
	const ALL: Ribbon[] = [
		...RIBBONS_GEN3,
		...RIBBONS_GEN4,
		...RIBBONS_GEN5,
		...RIBBONS_GEN6,
		...RIBBONS_GEN7,
		...RIBBONS_GEN8,
		...RIBBONS_GEN9,
		...MARKS
	];

	it('必ず1行以上2行以下を返す', () => {
		for (const ribbon of ALL) {
			const lines = getRibbonShortLabel(ribbon);
			expect(lines.length).toBeGreaterThanOrEqual(1);
			expect(lines.length).toBeLessThanOrEqual(2);
		}
	});

	it('空文字の行を作らない', () => {
		for (const ribbon of ALL) {
			for (const line of getRibbonShortLabel(ribbon)) {
				expect(line.length).toBeGreaterThan(0);
			}
		}
	});

	it('元の名前より長くならない', () => {
		for (const ribbon of ALL) {
			const joined = getRibbonShortLabel(ribbon).join('');
			expect(joined.length).toBeLessThanOrEqual(ribbon.name.length);
		}
	});

	/*
		セル幅 76px・11px の日本語は 1行あたり約6〜7文字。
		2行までなので、全体で 12文字を超えると clamp で切れて識別語が消える。
	*/
	const MAX_CHARS_PER_LINE = 7;
	const MAX_CHARS_TOTAL = 12;

	it('明示的に割った行が1行に収まる', () => {
		const tooLong = ALL.filter((ribbon) =>
			getRibbonShortLabel(ribbon).some((line) => line.length > MAX_CHARS_PER_LINE)
		).map((ribbon) => ribbon.name);
		expect(tooLong).toEqual([]);
	});

	it('2行の clamp で切れない長さに収まる', () => {
		const tooLong = ALL.filter(
			(ribbon) => getRibbonShortLabel(ribbon).join('').length > MAX_CHARS_TOTAL
		).map((ribbon) => ribbon.name);
		expect(tooLong).toEqual([]);
	});

	it('同じ世代・同じカテゴリの中で短縮名が衝突しない', () => {
		const byGroup = new Map<string, Map<string, string[]>>();
		for (const ribbon of ALL) {
			const groupKey = `${ribbon.generation}/${ribbon.category}`;
			const labelKey = getRibbonShortLabel(ribbon).join('');
			const group = byGroup.get(groupKey) ?? new Map<string, string[]>();
			group.set(labelKey, [...(group.get(labelKey) ?? []), ribbon.name]);
			byGroup.set(groupKey, group);
		}
		const collisions: string[][] = [];
		for (const group of byGroup.values()) {
			for (const names of group.values()) {
				if (names.length > 1) collisions.push(names);
			}
		}
		expect(collisions).toEqual([]);
	});
});
