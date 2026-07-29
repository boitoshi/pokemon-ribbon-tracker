/**
 * generate-ribbons.mjs
 * pokemon-data/ribbons/catalog.json から
 * src/lib/data/ribbons-gen3.ts〜ribbons-gen9.ts と marks.ts を生成するスクリプト。
 *
 * 実行: node scripts/generate-ribbons.mjs
 * （pokemon-data の場所は環境変数 POKEMON_DATA_DIR で上書き可能）
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POKEMON_DATA_DIR = process.env.POKEMON_DATA_DIR ?? resolve(__dirname, '../../pokemon-data');
const OUTPUT_DIR = resolve(__dirname, '../src/lib/data');

const MIN_GEN = 3;
const MAX_GEN = 9;

// catalog.json を読み込む（配列。1要素 = 1リボン/あかし + routes）
const catalog = JSON.parse(readFileSync(`${POKEMON_DATA_DIR}/ribbons/catalog.json`, 'utf-8'));

// ================================================================
// games 変換（titles.json id → tracker 合成id + FRLG Switch 再販の復元）
// ================================================================

// ペアが両方そろっていたら合成idに畳む（片方だけならエラー）
const MERGE_PAIRS = [
  ['omegaruby', 'alphasapphire', 'oras'],
  ['ultra_sun', 'ultra_moon', 'usum'],
  ['lets_go_pikachu', 'lets_go_eevee', 'lets_go'],
];

const errors = [];

function convertGames(games, route) {
  const result = [];
  const set = new Set(games);

  for (const [first, second] of MERGE_PAIRS) {
    if (set.has(first) !== set.has(second)) {
      errors.push(`${route.id}: games に ${first}/${second} の片方しかありません`);
    }
  }

  for (let i = 0; i < games.length; i++) {
    const g = games[i];
    const pair = MERGE_PAIRS.find(([first]) => first === g);
    if (pair) {
      // 直後にペアの相方が来る前提で合成（並びが離れている場合はエラー）
      if (games[i + 1] === pair[1]) {
        result.push(pair[2]);
        i++;
        continue;
      }
      errors.push(`${route.id}: ${pair[0]} の直後に ${pair[1]} がありません`);
      continue;
    }
    if (MERGE_PAIRS.some(([, second]) => second === g)) {
      // 相方単独出現（上でエラー計上済み）
      continue;
    }
    result.push(g);
  }

  // FRLG の Switch（NSO）再販対応: firered/leafgreen があれば末尾側に Switch 版を復元する。
  // ただしイベント配布リボンは現実のイベントが終了しており Switch 版では入手不可のため復元しない。
  if (route.category !== 'イベント' && (set.has('firered') || set.has('leafgreen'))) {
    const anchor = set.has('leafgreen') ? 'leafgreen' : 'firered';
    const idx = result.indexOf(anchor);
    const inserts = [];
    if (set.has('firered')) inserts.push('firered_switch');
    if (set.has('leafgreen')) inserts.push('leafgreen_switch');
    result.splice(idx + 1, 0, ...inserts);
  }

  return result;
}

// ================================================================
// route → tracker エントリ変換
// ================================================================

const byGeneration = new Map(); // gen → entries（kind: ribbon）
for (let gen = MIN_GEN; gen <= MAX_GEN; gen++) byGeneration.set(gen, []);
const markEntries = [];

for (const elem of catalog) {
  for (const route of elem.routes) {
    const entry = {
      id: route.id,
      name: elem.name_ja,
      description: route.description,
      generation: route.generation,
      games: convertGames(route.games, route),
      category: route.category,
    };
    if (elem.kind === 'mark') entry.type = 'mark';
    if (route.requirements !== undefined) entry.requirements = route.requirements;
    if (route.eligibility !== undefined) entry.eligibility = route.eligibility;
    if (route.transferable !== undefined) entry.transferable = route.transferable;

    if (elem.kind === 'mark') {
      markEntries.push(entry);
    } else {
      if (!byGeneration.has(route.generation)) {
        errors.push(`${route.id}: 対象外の generation ${route.generation}`);
        continue;
      }
      byGeneration.get(route.generation).push(entry);
    }
  }
}

// ================================================================
// 検証: id 重複・空 games
// ================================================================

const seen = new Set();
for (const entry of [...[...byGeneration.values()].flat(), ...markEntries]) {
  if (seen.has(entry.id)) errors.push(`id 重複: '${entry.id}'`);
  seen.add(entry.id);
  if (entry.games.length === 0) errors.push(`${entry.id}: games が空です`);
}

if (errors.length > 0) {
  console.error('❌ 検証エラー:');
  for (const err of errors) console.error(`   - ${err}`);
  process.exit(1);
}

// ================================================================
// TypeScript ファイル出力
// ================================================================

function q(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function gamesToTs(games) {
  return `[${games.map(q).join(', ')}]`;
}

function eligibilityToTs(e) {
  const parts = [`type: ${q(e.type)}`];
  if (e.maxLevel !== undefined) parts.push(`maxLevel: ${e.maxLevel}`);
  if (e.shadowGames !== undefined) parts.push(`shadowGames: ${gamesToTs(e.shadowGames)}`);
  return `{ ${parts.join(', ')} }`;
}

function entryToTs(entry) {
  const lines = [
    `    id: ${q(entry.id)},`,
    `    name: ${q(entry.name)},`,
    `    description: ${q(entry.description)},`,
    `    generation: ${entry.generation},`,
    `    games: ${gamesToTs(entry.games)},`,
    `    category: ${q(entry.category)},`,
  ];
  if (entry.type) lines.push(`    type: ${q(entry.type)},`);
  if (entry.requirements !== undefined) lines.push(`    requirements: ${q(entry.requirements)},`);
  if (entry.eligibility !== undefined) {
    lines.push(`    eligibility: ${eligibilityToTs(entry.eligibility)},`);
  }
  if (entry.transferable !== undefined) lines.push(`    transferable: ${entry.transferable},`);
  return `  {\n${lines.join('\n')}\n  }`;
}

function fileContent(headline, exportName, entries) {
  return `// ${headline}
// ⚠️  このファイルは自動生成です。直接編集しないでください。
// 生成元: pokemon-data/ribbons/catalog.json
// 再生成: node scripts/generate-ribbons.mjs

import type { Ribbon } from '$lib/types';

export const ${exportName}: Ribbon[] = [
${entries.map(entryToTs).join(',\n')},
];
`;
}

let total = 0;
for (let gen = MIN_GEN; gen <= MAX_GEN; gen++) {
  const entries = byGeneration.get(gen);
  const file = `ribbons-gen${gen}.ts`;
  writeFileSync(
    resolve(OUTPUT_DIR, file),
    fileContent(`Gen ${gen} リボン定義データ`, `RIBBONS_GEN${gen}`, entries),
    'utf-8'
  );
  console.log(`✅ ${file} を生成しました（${entries.length}件）`);
  total += entries.length;
}

writeFileSync(
  resolve(OUTPUT_DIR, 'marks.ts'),
  fileContent('あかし定義データ', 'MARKS', markEntries),
  'utf-8'
);
console.log(`✅ marks.ts を生成しました（${markEntries.length}件）`);
console.log(`   合計 ${total + markEntries.length}件 / 出力先: ${OUTPUT_DIR}`);
