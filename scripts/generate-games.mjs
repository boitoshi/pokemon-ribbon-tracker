/**
 * generate-games.mjs
 * pokemon-data/games/titles.json と groups.json から
 * src/lib/data/games.ts を生成するスクリプト。
 *
 * 実行: node scripts/generate-games.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POKEMON_DATA_DIR = resolve(__dirname, '../../pokemon-data/games');
const OUTPUT = resolve(__dirname, '../src/lib/data/games.ts');

// titles.json / groups.json を読み込む
const titles = JSON.parse(readFileSync(`${POKEMON_DATA_DIR}/titles.json`, 'utf-8'));
const groups = JSON.parse(readFileSync(`${POKEMON_DATA_DIR}/groups.json`, 'utf-8'));

// グループID → グループ情報のマップ
const groupMap = Object.fromEntries(groups.map((g) => [g.id, g]));

// ================================================================
// ribbon-tracker 固有の設定
// ================================================================

// ペアをまとめて1エントリにする設定
// { mergedId, groupId, name, shortName } の形式
const MERGED_ENTRIES = [
  {
    id: 'oras',
    groupId: 'ORAS',
    name: 'ポケットモンスター オメガルビー・アルファサファイア',
    shortName: 'ORAS',
  },
  {
    id: 'usum',
    groupId: 'USUM',
    name: 'ポケットモンスター ウルトラサン・ウルトラムーン',
    shortName: 'USUM',
  },
  {
    id: 'lets_go',
    groupId: 'LPLE',
    name: "ポケットモンスター Let's Go! ピカチュウ・イーブイ",
    shortName: 'レッツゴー',
  },
];

// titles.json に存在しない ribbon-tracker 固有エントリ（Switch Online再販等）
const EXTRA_ENTRIES = [
  {
    id: 'firered_switch',
    name: 'ポケットモンスター ファイアレッド（Switch）',
    shortName: 'FR Switch',
    generation: 3,
    releaseDate: '2025-01-01',
    platform: 'Switch',
  },
  {
    id: 'leafgreen_switch',
    name: 'ポケットモンスター リーフグリーン（Switch）',
    shortName: 'LG Switch',
    generation: 3,
    releaseDate: '2025-01-01',
    platform: 'Switch',
  },
];

// shortName のオーバーライド（グループ略称で表示したいもの）
const SHORT_NAME_OVERRIDES = {
  scarlet: 'SV',
};

// ================================================================
// 生成対象タイトルのフィルタリング
// ================================================================

// ペアまとめ対象のグループID（個別エントリは出力しない）
const MERGED_GROUP_IDS = new Set(MERGED_ENTRIES.map((e) => e.groupId));

// リボントラッカーで対象外のゲーム（Gen1/2・スピンオフ等）
const EXCLUDED_IDS = new Set([
  'red', 'green', 'blue', 'yellow',           // Gen 1（リボンなし）
  'gold', 'silver', 'crystal',                // Gen 2（リボンなし）
  'poko_a_pokemon',                           // スピンオフ（リボン関係なし）
  'legends_za',                               // 今後対応予定（リボン実装未定）
  // ORAS / USUM / LPLE はまとめエントリで出力するため個別除外
  'omegaruby', 'alphasapphire',
  'ultra_sun', 'ultra_moon',
  'lets_go_pikachu', 'lets_go_eevee',
]);

// ================================================================
// エントリ生成
// ================================================================

function makeEntry(title) {
  const shortName = SHORT_NAME_OVERRIDES[title.id] ?? title.shortName;
  return {
    id: title.id,
    name: title.name,
    shortName,
    generation: title.generation,
    releaseDate: title.releaseDate_jp,
    platform: title.platform,
  };
}

// titles.json から個別エントリを生成（除外リスト適用）
const individualEntries = titles
  .filter((t) => t.generation !== null && t.generation >= 3)
  .filter((t) => !EXCLUDED_IDS.has(t.id))
  .filter((t) => !MERGED_GROUP_IDS.has(t.group))
  .map(makeEntry);

// まとめエントリを生成（グループの発売日・世代を titles.json から取得）
const mergedEntries = MERGED_ENTRIES.map((m) => {
  const group = groupMap[m.groupId];
  const firstGame = titles.find((t) => t.id === group.games[0]);
  return {
    id: m.id,
    name: m.name,
    shortName: m.shortName,
    generation: group.generation,
    releaseDate: firstGame?.releaseDate_jp ?? '',
    platform: firstGame?.platform ?? 'unknown',
  };
});

// ================================================================
// 世代・発売日順に並べる
// ================================================================

// 挿入位置の定義（どのゲームIDの後ろに挿入するか）
const INSERT_AFTER = {
  oras: 'y',           // Gen 6: X/Y の後
  usum: 'moon',        // Gen 7: サン・ムーンの後
  lets_go: 'usum',     // Gen 7: USUM の後
};

// 個別エントリに ORAS/USUM/LPLE まとめエントリとEXTRAを差し込む
function buildOrderedEntries() {
  // 個別エントリを id → index で管理
  const result = [...individualEntries];

  // firered/leafgreen の後ろに Switch版を挿入
  const lgIdx = result.findIndex((e) => e.id === 'leafgreen');
  if (lgIdx !== -1) {
    result.splice(lgIdx + 1, 0, ...EXTRA_ENTRIES);
  }

  // まとめエントリを指定位置に挿入
  for (const merged of mergedEntries) {
    const afterId = INSERT_AFTER[merged.id];
    const idx = result.findIndex((e) => e.id === afterId);
    if (idx !== -1) {
      result.splice(idx + 1, 0, merged);
    } else {
      result.push(merged);
    }
  }

  return result;
}

const allEntries = buildOrderedEntries();

// ================================================================
// TypeScript ファイル出力
// ================================================================

function entryToTs(e) {
  // name/shortName は JSON.stringify でアポストロフィ等を安全にエスケープ
  const name = JSON.stringify(e.name);
  const shortName = JSON.stringify(e.shortName);
  return `  { id: '${e.id}', name: ${name}, shortName: ${shortName}, generation: ${e.generation}, releaseDate: '${e.releaseDate}', platform: '${e.platform}' }`;
}

const tsContent = `// ゲームタイトル定義データ
// ⚠️  このファイルは自動生成です。直接編集しないでください。
// 生成元: pokemon-data/games/titles.json + groups.json
// 再生成: node scripts/generate-games.mjs

import type { Game } from '$lib/types';

export const GAMES: Game[] = [
${allEntries.map(entryToTs).join(',\n')}
];
`;

writeFileSync(OUTPUT, tsContent, 'utf-8');
console.log(`✅ games.ts を生成しました（${allEntries.length}件）`);
console.log(`   出力先: ${OUTPUT}`);
