/**
 * generate-pokemon.mjs
 * pokemon-data/pokemon/all.json から
 * src/lib/data/pokemon.ts を生成するスクリプト。
 *
 * 実行: node scripts/generate-pokemon.mjs
 * （pokemon-data の場所は環境変数 POKEMON_DATA_DIR で上書き可能）
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POKEMON_DATA_DIR = process.env.POKEMON_DATA_DIR ?? resolve(__dirname, '../../pokemon-data');
const OUTPUT = resolve(__dirname, '../src/lib/data/pokemon.ts');

const MIN_DEX = 1;
const MAX_DEX = 1025;

// all.json を読み込む（キー = 全国図鑑番号の文字列）
const allJson = JSON.parse(readFileSync(`${POKEMON_DATA_DIR}/pokemon/all.json`, 'utf-8'));

// ================================================================
// スラッグ生成（PokeAPI 準拠・既存 localStorage の id と互換必須）
// ================================================================

// 既存 id 互換のためのオーバーライド（dex番号 → スラッグ）
const SLUG_OVERRIDES = {
  386: 'deoxys-normal',
};

function toSlug(nameEn) {
  return nameEn
    .toLowerCase()
    .replaceAll('♀', '-f')
    .replaceAll('♂', '-m')
    .replaceAll('é', 'e')
    .replace(/['’.:]/g, '')
    .replace(/\s+/g, '-');
}

// ================================================================
// エントリ生成
// ================================================================

const IMAGE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

const entries = [];
const errors = [];

for (let dex = MIN_DEX; dex <= MAX_DEX; dex++) {
  const p = allJson[String(dex)];
  if (!p) {
    errors.push(`dex ${dex} が all.json に存在しません`);
    continue;
  }
  entries.push({
    id: SLUG_OVERRIDES[dex] ?? toSlug(p.name_en),
    dexNumber: p.no,
    name: p.name_ja,
    types: p.types,
    generation: p.gen,
    image: `${IMAGE_BASE}/${p.no}.png`,
  });
}

// ================================================================
// 検証: 全件存在・スラッグ重複なし
// ================================================================

const seen = new Map();
for (const e of entries) {
  if (seen.has(e.id)) {
    errors.push(`スラッグ重複: '${e.id}' (dex ${seen.get(e.id)} と dex ${e.dexNumber})`);
  } else {
    seen.set(e.id, e.dexNumber);
  }
}

if (errors.length > 0) {
  console.error('❌ 検証エラー:');
  for (const err of errors) console.error(`   - ${err}`);
  process.exit(1);
}

// ================================================================
// TypeScript ファイル出力
// ================================================================

function entryToTs(e) {
  const name = JSON.stringify(e.name);
  const types = JSON.stringify(e.types);
  return `  { id: '${e.id}', dexNumber: ${e.dexNumber}, name: ${name}, types: ${types}, generation: ${e.generation}, image: '${e.image}' }`;
}

const tsContent = `// ポケモン定義データ（全国図鑑 ${MIN_DEX}〜${MAX_DEX}）
// ⚠️  このファイルは自動生成です。直接編集しないでください。
// 生成元: pokemon-data/pokemon/all.json
// 再生成: node scripts/generate-pokemon.mjs

import type { PokemonDetail } from '$lib/types';

export const POKEMON_ALL: PokemonDetail[] = [
${entries.map(entryToTs).join(',\n')}
];
`;

writeFileSync(OUTPUT, tsContent, 'utf-8');
console.log(`✅ pokemon.ts を生成しました（${entries.length}件）`);
console.log(`   出力先: ${OUTPUT}`);
