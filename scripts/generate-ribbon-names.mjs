/**
 * generate-ribbon-names.mjs
 * pokemon-data/mappings/ribbons.json から
 * src/lib/data/canonical-ribbon-names.ts を生成するスクリプト。
 *
 * 実行: node scripts/generate-ribbon-names.mjs
 * （pokemon-data の場所は環境変数 POKEMON_DATA_DIR で上書き可能）
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POKEMON_DATA_DIR = process.env.POKEMON_DATA_DIR ?? resolve(__dirname, '../../pokemon-data');
const OUTPUT = resolve(__dirname, '../src/lib/data/canonical-ribbon-names.ts');

// ribbons.json を読み込む（{ ribbons: { EN名: JA名 }, marks: { EN名: JA名 } }）
const json = JSON.parse(readFileSync(`${POKEMON_DATA_DIR}/mappings/ribbons.json`, 'utf-8'));

// ================================================================
// 検証: ribbons / marks が存在し空でないこと
// ================================================================

const errors = [];
if (!json.ribbons || Object.keys(json.ribbons).length === 0) {
  errors.push('ribbons.json に ribbons がありません');
}
if (!json.marks || Object.keys(json.marks).length === 0) {
  errors.push('ribbons.json に marks がありません');
}

if (errors.length > 0) {
  console.error('❌ 検証エラー:');
  for (const err of errors) console.error(`   - ${err}`);
  process.exit(1);
}

// ================================================================
// TypeScript ファイル出力
// ================================================================

function recordToTs(record) {
  return Object.entries(record)
    .map(([en, ja]) => `  '${en.replace(/'/g, "\\'")}': '${ja}'`)
    .join(',\n');
}

const tsContent = `// 公式リボン・あかし名の正本データ（EN名 → JA名）
// ⚠️  このファイルは自動生成です。直接編集しないでください。
// 生成元: pokemon-data/mappings/ribbons.json
// 再生成: node scripts/generate-ribbon-names.mjs

export const CANONICAL_RIBBON_NAMES: Record<string, string> = {
${recordToTs(json.ribbons)},
};

export const CANONICAL_MARK_NAMES: Record<string, string> = {
${recordToTs(json.marks)},
};
`;

writeFileSync(OUTPUT, tsContent, 'utf-8');
console.log(
  `✅ canonical-ribbon-names.ts を生成しました（ribbons ${Object.keys(json.ribbons).length}件 / marks ${Object.keys(json.marks).length}件）`
);
console.log(`   出力先: ${OUTPUT}`);
