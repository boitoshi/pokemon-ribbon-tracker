// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { RIBBONS_GEN3 } from '$lib/data/ribbons-gen3';
import { RIBBONS_GEN4 } from '$lib/data/ribbons-gen4';
import { RIBBONS_GEN5 } from '$lib/data/ribbons-gen5';
import { RIBBONS_GEN6 } from '$lib/data/ribbons-gen6';
import { RIBBONS_GEN7 } from '$lib/data/ribbons-gen7';
import { RIBBONS_GEN8 } from '$lib/data/ribbons-gen8';
import { RIBBONS_GEN9 } from '$lib/data/ribbons-gen9';
import { MARKS } from '$lib/data/marks';
import { CANONICAL_RIBBON_NAMES, CANONICAL_MARK_NAMES } from '$lib/data/canonical-ribbon-names';

// ---- リボン・あかし名の正本（pokemon-data/mappings/ribbons.json）との突合 ----
//
// 正本にあるリボン名はトラッカーにも存在し、トラッカーのリボン名は
// 「正本 ∪ HOME以前に消滅した旧世代リボンの公式名」に必ず含まれることを固定する。

/**
 * 正本（pokemon-data/mappings/ribbons.json）に無い公式リボン名。
 * 大半は HOME 以前に消滅した旧世代リボンだが、コンテストスターリボンのように
 * 現役でも正本49件に含まれないものがある。
 * 出典: PKHeX text_Ribbons_ja.txt（「 (3世代)」等の注記と全角スペースは除去した表記）
 */
const LEGACY_RIBBON_NAMES = new Set([
	// Gen3 コンテスト（RibbonG3Cool 〜 RibbonG3ToughMaster）
	'クールリボン',
	'クールリボンスーパー',
	'クールリボンハイパー',
	'クールリボンマスター',
	'ビューティリボン',
	'ビューティリボンスーパー',
	'ビューティリボンハイパー',
	'ビューティリボンマスター',
	'キュートリボン',
	'キュートリボンスーパー',
	'キュートリボンハイパー',
	'キュートリボンマスター',
	'ジーニアスリボン',
	'ジーニアスリボンスーパー',
	'ジーニアスリボンハイパー',
	'ジーニアスリボンマスター',
	'パワフルリボン',
	'パワフルリボンスーパー',
	'パワフルリボンハイパー',
	'パワフルリボンマスター',
	// Gen4 スーパーコンテスト（RibbonG4Cool 〜 RibbonG4ToughMaster、基本形・マスターは Gen3 と重複あり）
	'クールリボングレート',
	'クールリボンウルトラ',
	'ビューティーリボングレート',
	'ビューティーリボンウルトラ',
	'ビューティーリボンマスター',
	'キュートリボングレート',
	'キュートリボンウルトラ',
	'ジーニアスリボングレート',
	'ジーニアスリボンウルトラ',
	'パワフルリボングレート',
	'パワフルリボンウルトラ',
	// Gen4 バトルタワー（RibbonAbility 系 6種）
	'アビリティリボン',
	'グレートアビリティリボン',
	'ダブルアビリティリボン',
	'マルチアビリティリボン',
	'ペアアビリティリボン',
	'ワールドアビリティリボン',
	// Gen4 記念（RibbonRecord）
	'レコードリボン',
	// Gen6（RibbonTraining / RibbonMasterCoolness 〜 RibbonMasterToughness）
	'しゅぎょうリボン',
	'かっこよさマスターリボン',
	'うつくしさマスターリボン',
	'かわいさマスターリボン',
	'かしこさマスターリボン',
	'たくましさマスターリボン',
	// Gen7 バトル施設（RibbonBattleTreeGreat / RibbonBattleTreeMaster / RibbonBattleRoyale）
	'グレートツリーリボン',
	'マスターツリーリボン',
	'ロイヤルマスターリボン',
	// Gen6 ORAS / Gen8 BDSP（RibbonContestStar）。正本49件に無いが現役のリボン
	'コンテストスターリボン'
]);

/**
 * 正本にあるがトラッカー未収録のリボン名（理由を明示して除外）。
 */
const SKIP_CANONICAL_RIBBON_NAMES = new Set([
	// 入手手段が実装上疑義ありのため未収録（指示書 7 参照）
	'せんざいいちぐうリボン'
]);

const ALL_RIBBON_DATASETS: [string, { id: string; name: string }[]][] = [
	['RIBBONS_GEN3', RIBBONS_GEN3],
	['RIBBONS_GEN4', RIBBONS_GEN4],
	['RIBBONS_GEN5', RIBBONS_GEN5],
	['RIBBONS_GEN6', RIBBONS_GEN6],
	['RIBBONS_GEN7', RIBBONS_GEN7],
	['RIBBONS_GEN8', RIBBONS_GEN8],
	['RIBBONS_GEN9', RIBBONS_GEN9]
];

const ALL_RIBBONS = ALL_RIBBON_DATASETS.flatMap(([, ribbons]) => ribbons);

describe('あかし名 — 正本との突合', () => {
	it('MARKS の name 集合は正本 marks の値集合と完全一致する（件数一致）', () => {
		const markNames = MARKS.map((m) => m.name);
		const canonicalNames = Object.values(CANONICAL_MARK_NAMES);
		expect(markNames.length).toBe(canonicalNames.length);
		expect(new Set(markNames)).toEqual(new Set(canonicalNames));
	});
});

describe('リボン名 — 正本との突合', () => {
	it('全リボンの name は「正本 ∪ LEGACY_RIBBON_NAMES」に含まれる', () => {
		const allowed = new Set([...Object.values(CANONICAL_RIBBON_NAMES), ...LEGACY_RIBBON_NAMES]);
		for (const ribbon of ALL_RIBBONS) {
			expect(allowed.has(ribbon.name), `${ribbon.id}: '${ribbon.name}' は正本にもLEGACYにもない`).toBe(
				true
			);
		}
	});

	it('正本の各リボン名は SKIP を除きトラッカーに存在する', () => {
		const trackerNames = new Set(ALL_RIBBONS.map((r) => r.name));
		for (const name of Object.values(CANONICAL_RIBBON_NAMES)) {
			if (SKIP_CANONICAL_RIBBON_NAMES.has(name)) continue;
			expect(trackerNames.has(name), `正本のリボン '${name}' がトラッカーにない`).toBe(true);
		}
	});

	it('SKIP リストの名前は正本に実在する（陳腐化防止）', () => {
		const canonicalNames = new Set(Object.values(CANONICAL_RIBBON_NAMES));
		for (const name of SKIP_CANONICAL_RIBBON_NAMES) {
			expect(canonicalNames.has(name), `SKIP の '${name}' が正本に存在しない`).toBe(true);
		}
	});

	it('LEGACY_RIBBON_NAMES は正本と重複しない', () => {
		const canonicalNames = new Set(Object.values(CANONICAL_RIBBON_NAMES));
		for (const name of LEGACY_RIBBON_NAMES) {
			expect(canonicalNames.has(name), `LEGACY の '${name}' は正本にあるので不要`).toBe(false);
		}
	});
});

describe('重複チェック', () => {
	it('各データセット内で id がユニーク', () => {
		for (const [label, ribbons] of [...ALL_RIBBON_DATASETS, ['MARKS', MARKS] as const]) {
			const ids = ribbons.map((r) => r.id);
			expect(new Set(ids).size, `${label}: id が重複している`).toBe(ids.length);
		}
	});

	it('MARKS 内で name がユニーク', () => {
		const names = MARKS.map((m) => m.name);
		expect(new Set(names).size).toBe(names.length);
	});
});
