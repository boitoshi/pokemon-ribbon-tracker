import type { Ribbon } from '$lib/types';

/**
 * グリッドセル用の短縮ラベル。
 *
 * 全リボンが「リボン」で終わるので、9px・1行 truncate の狭い枠は
 * 一番情報量のない3文字に一番いい場所を渡していた。
 * ここでは「リボン」「のあかし」を落とし、識別語を先頭に出す。
 *
 * 返り値が配列なのは、ランク付きリボン（クールリボンスーパー）を
 * 「クール / スーパー」の2行に割るため。CJK の自動折り返しに任せると
 * 「クールス / ーパー」のように識別語の途中で割れる。
 *
 * 正式名は title / aria-label に残すので、ここでの短縮は表示だけの話。
 */

/** コンテストのランク語。リボン名の前にも後ろにも付く */
const RANKS = ['ノーマル', 'スーパー', 'ハイパー', 'マスター', 'グレート', 'ウルトラ'] as const;

/**
 * 行の境目にしたい末尾語。
 *
 * リボン名はほぼ「修飾語 + 系統語」の複合語で、識別の仕事をしているのは修飾語のほう。
 * その境目で割ると修飾語が1行目に丸ごと乗る（ホウエン / チャンプ）。
 * CJK の自動折り返しに任せると「ホウエンチャ / ンプ」と語の途中で切れる。
 *
 * 並び順は優先順位。ランクを先に置くことで、「ロイヤルマスター」が
 * 「スター」ではなく「マスター」で割れる。
 */
const LINE_BREAK_SUFFIXES = [
	...RANKS,
	'アビリティ',
	'コンテスト',
	'チャンプ',
	'ロイヤル',
	'ツリー',
	'タワー',
	'ランク',
	'バトル',
	'スター'
] as const;

/**
 * 「リボン」を落としてはいけないリボン。
 *
 * これらは副詞（がんばり・うっかり…）の「り」を「リボン」に掛けたかばん語で、
 * 機械的に落とすと「がんば」「うっか」になって語が壊れる。
 * 総評が「きねんリボン系は手で決めたほうがいい」と言っていたのがここ。
 */
const KEEP_FULL_NAME = new Set([
	'がんばリボン',
	'うっかリボン',
	'ぐっすリボン',
	'しゃっきリボン',
	'しょんぼリボン',
	'たっきリボン',
	'どっきリボン',
	'にっこリボン'
]);

/**
 * 派生では出せない短縮名の明示指定。id → 表示行。
 * 現状は派生ルールで全件さばけているので空。
 * データ側に shortLabel が入るまでの逃げ道として残している。
 */
const SHORT_LABEL_OVERRIDES: Record<string, string[]> = {};

/** 末尾のランク語を切り出す（クールリボンスーパー → スーパー） */
function splitTrailingRank(rest: string): string | null {
	return RANKS.find((rank) => rest === rank) ?? null;
}

/**
 * 「リボン」直前の末尾語で行を割る（かっこよさマスターリボン → かっこよさ / マスター）。
 * 語全体が末尾語と一致する場合（チャンプリボン）は割らない。
 */
function splitPrecedingSuffix(base: string): { base: string; suffix: string } | null {
	for (const suffix of LINE_BREAK_SUFFIXES) {
		if (base.length > suffix.length && base.endsWith(suffix)) {
			return { base: base.slice(0, -suffix.length), suffix };
		}
	}
	return null;
}

/**
 * リボンからグリッド表示用の行を得る。最大2行。
 *
 * 優先順位:
 *   1. データが shortLabel を持っていればそれ（生成側で用意された場合）
 *   2. 明示指定の上書き表
 *   3. かばん語はそのまま
 *   4. 派生ルール（あかし / ランク後置 / ランク前置 / 単純除去）
 */
export function getRibbonShortLabel(ribbon: Ribbon): string[] {
	if (ribbon.shortLabel) return [ribbon.shortLabel];

	const override = SHORT_LABEL_OVERRIDES[ribbon.id];
	if (override) return override;

	const name = ribbon.name;

	if (KEEP_FULL_NAME.has(name)) return [name];

	// あかしは「のあかし」が多数だが、「つりあげられたあかし」「でっかいあかし」の
	// ように助詞を挟まないものもある。長いほうから順に落とす。
	for (const suffix of ['のあかし', 'あかし']) {
		if (name.endsWith(suffix)) {
			const base = name.slice(0, -suffix.length);
			return base.length > 0 ? [base] : [name];
		}
	}

	const ribbonIndex = name.indexOf('リボン');
	if (ribbonIndex <= 0) return [name];

	const base = name.slice(0, ribbonIndex);
	const rest = name.slice(ribbonIndex + 'リボン'.length);

	// ランク後置: クールリボンスーパー → クール / スーパー
	if (rest.length > 0) {
		const trailingRank = splitTrailingRank(rest);
		return trailingRank ? [base, trailingRank] : [base, rest];
	}

	// 末尾語前置: かっこよさマスターリボン → かっこよさ / マスター
	//             ホウエンチャンプリボン → ホウエン / チャンプ
	const preceding = splitPrecedingSuffix(base);
	if (preceding) return [preceding.base, preceding.suffix];

	return [base];
}

/** 短縮ラベルを1本の文字列にする（Toast など行構造を持てない場所用） */
export function getRibbonShortLabelText(ribbon: Ribbon): string {
	return getRibbonShortLabel(ribbon).join(' ');
}
