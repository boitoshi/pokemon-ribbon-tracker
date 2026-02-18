/**
 * PokeAPI から Gen 1-3 のポケモンデータを取得して data/pokemon-gen3.ts に出力するスクリプト
 *
 * 実行方法:
 *   npx tsx scripts/generate-pokemon-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// 日本語タイプ名マッピング
const TYPE_MAP: Record<string, string> = {
  normal: 'ノーマル',
  fire: 'ほのお',
  water: 'みず',
  electric: 'でんき',
  grass: 'くさ',
  ice: 'こおり',
  fighting: 'かくとう',
  poison: 'どく',
  ground: 'じめん',
  flying: 'ひこう',
  psychic: 'エスパー',
  bug: 'むし',
  rock: 'いわ',
  ghost: 'ゴースト',
  dragon: 'ドラゴン',
  dark: 'あく',
  steel: 'はがね',
  fairy: 'フェアリー',
};

/** 世代を図鑑番号から判定する */
function getGeneration(dexNumber: number): number {
  if (dexNumber <= 151) return 1;
  if (dexNumber <= 251) return 2;
  if (dexNumber <= 386) return 3;
  return 4;
}

/** PokeAPI のレスポンス型 */
interface PokeApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    slot: number;
    type: { name: string; url: string };
  }>;
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  abilities: Array<{
    ability: { name: string; url: string };
    is_hidden: boolean;
    slot: number;
  }>;
}

interface PokeApiSpecies {
  names: Array<{
    language: { name: string; url: string };
    name: string;
  }>;
  genera: Array<{
    genus: string;
    language: { name: string; url: string };
  }>;
}

/** 出力するポケモンデータの型 */
interface PokemonDetail {
  id: string;
  dexNumber: number;
  name: string;
  types: string[];
  generation: number;
  image: string;
  category: string;
  height: number;
  weight: number;
  abilities: string[];
}

/** リトライ付き fetch */
async function fetchWithRetry(url: string, maxRetries = 5): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      if (response.status === 429) {
        const waitMs = attempt * 2000;
        console.warn(`  Rate limited (429). Waiting ${waitMs}ms before retry ${attempt}/${maxRetries}...`);
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${url}`);
      }

      return response;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const waitMs = attempt * 1000;
      console.warn(`  Fetch error (attempt ${attempt}/${maxRetries}): ${err}. Retrying in ${waitMs}ms...`);
      await sleep(waitMs);
    }
  }
  throw new Error(`Failed to fetch after ${maxRetries} attempts: ${url}`);
}

/** 指定ミリ秒スリープ */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 単一ポケモンのデータを取得する */
async function fetchPokemonData(dexNumber: number): Promise<PokemonDetail> {
  const [pokemonRes, speciesRes] = await Promise.all([
    fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${dexNumber}`),
    fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${dexNumber}`),
  ]);

  const pokemon = (await pokemonRes.json()) as PokeApiPokemon;
  const species = (await speciesRes.json()) as PokeApiSpecies;

  // 日本語名の取得（'ja' → 'ja-Hrkt' の順でフォールバック）
  const jaName =
    species.names.find((n) => n.language.name === 'ja')?.name ??
    species.names.find((n) => n.language.name === 'ja-Hrkt')?.name ??
    pokemon.name;

  // カテゴリ（分類）の取得
  const jaCategory = species.genera.find((g) => g.language.name === 'ja')?.genus ?? '';

  // タイプの日本語変換（slot でソート）
  const types = pokemon.types
    .sort((a, b) => a.slot - b.slot)
    .map((t) => TYPE_MAP[t.type.name] ?? t.type.name);

  // 画像URL
  const image =
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;

  // 特性（英語名のまま）
  const abilities = pokemon.abilities.sort((a, b) => a.slot - b.slot).map((a) => a.ability.name);

  return {
    id: pokemon.name,
    dexNumber,
    name: jaName,
    types,
    generation: getGeneration(dexNumber),
    image,
    category: jaCategory,
    height: pokemon.height,
    weight: pokemon.weight,
    abilities,
  };
}

/** バッチ処理で全ポケモンデータを取得する */
async function fetchAllPokemon(
  start: number,
  end: number,
  batchSize = 10,
  delayMs = 1000,
): Promise<PokemonDetail[]> {
  const results: PokemonDetail[] = [];
  const total = end - start + 1;

  for (let i = start; i <= end; i += batchSize) {
    const batchEnd = Math.min(i + batchSize - 1, end);
    const batchNums = Array.from({ length: batchEnd - i + 1 }, (_, k) => i + k);

    console.log(`  Fetching #${i}–#${batchEnd} (${results.length + batchNums.length}/${total})...`);

    const batchResults = await Promise.all(
      batchNums.map(async (num) => {
        try {
          return await fetchPokemonData(num);
        } catch (err) {
          console.error(`  ERROR: Failed to fetch #${num}: ${err}`);
          // エラー時はプレースホルダーを返す
          return {
            id: `unknown-${num}`,
            dexNumber: num,
            name: `Unknown #${num}`,
            types: [],
            generation: getGeneration(num),
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`,
            category: '',
            height: 0,
            weight: 0,
            abilities: [],
          } satisfies PokemonDetail;
        }
      }),
    );

    results.push(...batchResults);

    // バッチ間のインターバル（最後のバッチでは待たない）
    if (batchEnd < end) {
      await sleep(delayMs);
    }
  }

  return results;
}

/** TypeScript ソースコードとして出力する */
function generateTypeScriptSource(pokemonList: PokemonDetail[]): string {
  const entries = pokemonList
    .map((p) => {
      const typesStr = JSON.stringify(p.types);
      const abilitiesStr = JSON.stringify(p.abilities);
      return `  {
    id: ${JSON.stringify(p.id)},
    dexNumber: ${p.dexNumber},
    name: ${JSON.stringify(p.name)},
    types: ${typesStr},
    generation: ${p.generation},
    image: ${JSON.stringify(p.image)},
    category: ${JSON.stringify(p.category)},
    height: ${p.height},
    weight: ${p.weight},
    abilities: ${abilitiesStr},
  }`;
    })
    .join(',\n');

  return `import type { PokemonDetail } from '~/types';

/** Gen 1-3 ポケモンデータ（386匹）— PokeAPI から自動生成 */
export const POKEMON_GEN3: PokemonDetail[] = [
${entries},
];
`;
}

/** メイン処理 */
async function main(): Promise<void> {
  console.log('=== PokeAPI Pokemon Data Generator ===');
  console.log('Gen 1-3 (#1–#386) のデータを取得します...\n');

  const startTime = Date.now();

  const pokemonList = await fetchAllPokemon(
    1,
    386,
    10, // バッチサイズ: 10匹ずつ
    1000, // バッチ間インターバル: 1秒
  );

  console.log(`\n取得完了: ${pokemonList.length} 匹`);

  // 出力ディレクトリの確認・作成
  const outputDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  // TypeScript ファイルの生成
  const outputPath = path.join(outputDir, 'pokemon-gen3.ts');
  const source = generateTypeScriptSource(pokemonList);
  fs.writeFileSync(outputPath, source, 'utf-8');

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n出力完了: ${outputPath}`);
  console.log(`所要時間: ${elapsed}秒`);
  console.log(`ポケモン数: ${pokemonList.length} 匹`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
