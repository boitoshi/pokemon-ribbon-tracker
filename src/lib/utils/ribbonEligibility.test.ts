// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { getRibbonState } from '$lib/utils/ribbonEligibility';
import type { Ribbon, PokemonDetail, MyPokemon } from '$lib/types';

// ---- フィクスチャ ----

const gameGenMap: ReadonlyMap<string, number> = new Map([
  ['ruby', 3],
  ['firered', 3],
  ['diamond', 4],
  ['black', 5],
  ['sun', 7],
  ['sword', 8],
]);

const gen3Ribbon: Ribbon = {
  id: 'test-gen3',
  name: 'テストリボン',
  description: '',
  generation: 3,
  games: ['ruby', 'firered'],
  category: 'テスト',
};

const gen7LevelMaxRibbon: Ribbon = {
  id: 'test-gen7-level',
  name: 'レベルテストリボン',
  description: '',
  generation: 7,
  games: ['sun'],
  category: 'テスト',
  eligibility: { type: 'level_max', maxLevel: 50 },
};

const shadowRibbon: Ribbon = {
  id: 'test-shadow',
  name: 'シャドウリボン',
  description: '',
  generation: 3,
  games: ['ruby'],
  category: '特殊',
  eligibility: { type: 'shadow_only', shadowGames: ['colosseum'] },
};

const gen4Ribbon: Ribbon = {
  id: 'test-gen4',
  name: 'Gen4リボン',
  description: '',
  generation: 4,
  games: ['diamond'],
  category: 'テスト',
};

const gen3Pokemon: PokemonDetail = {
  id: 'pikachu',
  dexNumber: 25,
  name: 'ピカチュウ',
  types: ['でんき'],
  generation: 3,
  image: '',
  category: 'ねずみポケモン',
  height: 0.4,
  weight: 6,
  abilities: [],
};

const gen8Pokemon: PokemonDetail = {
  id: 'zacian',
  dexNumber: 888,
  name: 'ザシアン',
  types: ['はがね'],
  generation: 8,
  image: '',
  category: 'ゆうじのポケモン',
  height: 2.8,
  weight: 110,
  abilities: [],
};

// MyPokemon に currentGeneration フィールドはない
const gen3MyPokemon: MyPokemon = {
  id: 'mp1',
  pokemonId: 'pikachu',
  nickname: '',
  originGame: 'ruby',
  currentGame: 'ruby',
  level: 30,
  isTransferredToHome: false,
  memo: '',
  createdAt: '',
};

const gen3inGen7: MyPokemon = {
  id: 'mp2',
  pokemonId: 'pikachu',
  nickname: '',
  originGame: 'ruby',
  currentGame: 'sun',
  level: 30,
  isTransferredToHome: false,
  memo: '',
  createdAt: '',
};

const gen3inGen7HighLevel: MyPokemon = {
  id: 'mp3',
  pokemonId: 'pikachu',
  nickname: '',
  originGame: 'ruby',
  currentGame: 'sun',
  level: 60,
  isTransferredToHome: false,
  memo: '',
  createdAt: '',
};

const gen8MyPokemon: MyPokemon = {
  id: 'mp4',
  pokemonId: 'zacian',
  nickname: '',
  originGame: 'sword',
  currentGame: 'sword',
  level: 70,
  isTransferredToHome: false,
  memo: '',
  createdAt: '',
};

// ---- テスト ----

describe('getRibbonState', () => {
  it('取得済み → obtained', () => {
    // isObtained = true なら他の条件によらず obtained を返す
    expect(getRibbonState(gen3Ribbon, gen3Pokemon, gen3MyPokemon, true, gameGenMap)).toBe(
      'obtained'
    );
  });

  it('pokemon.generation > ribbon.generation → locked', () => {
    // Gen8 ポケモン（ザシアン）は Gen3 リボンを取れない
    expect(getRibbonState(gen3Ribbon, gen8Pokemon, undefined, false, gameGenMap)).toBe('locked');
  });

  it('shadow_only & 非シャドウポケモン → locked', () => {
    // pikachu は isShadowPokemon でfalseになるため locked
    expect(getRibbonState(shadowRibbon, gen3Pokemon, gen3MyPokemon, false, gameGenMap)).toBe(
      'locked'
    );
  });

  it('maxRibbonGen < originGen → locked（生まれる前）', () => {
    // gen3Ribbon の maxRibbonGen=3、gen8MyPokemon.originGame=sword=Gen8
    // 3 < 8 なので、このポケモンが生まれた世代よりリボンが古い → locked
    expect(getRibbonState(gen3Ribbon, null, gen8MyPokemon, false, gameGenMap)).toBe('locked');
  });

  it('level_max & レベルオーバー → missed', () => {
    // gen7LevelMaxRibbon の maxLevel=50、gen3inGen7HighLevel.level=60
    // 60 > 50 なのでレベルを下げられない → missed
    expect(
      getRibbonState(gen7LevelMaxRibbon, gen3Pokemon, gen3inGen7HighLevel, false, gameGenMap)
    ).toBe('missed');
  });

  it('全ゲームが現在世代より前 → missed', () => {
    // gen3Ribbon の maxRibbonGen=3、gen3inGen7.currentGame=sun=Gen7
    // 3 < 7 なのでもう戻れない → missed
    expect(getRibbonState(gen3Ribbon, gen3Pokemon, gen3inGen7, false, gameGenMap)).toBe('missed');
  });

  it('全ゲームが現在世代より後 → future', () => {
    // gen4Ribbon の minRibbonGen=4、gen3MyPokemon.currentGame=ruby=Gen3
    // 4 > 3 なのでまだ到達していない → future
    expect(getRibbonState(gen4Ribbon, gen3Pokemon, gen3MyPokemon, false, gameGenMap)).toBe(
      'future'
    );
  });

  it('level_max & 現在世代で level <= maxLevel → urgent', () => {
    // gen7LevelMaxRibbon の maxLevel=50、gen3inGen7.level=30、currentGame=sun=Gen7
    // レベル制限内 & 現在世代で取得可能 → urgent
    expect(
      getRibbonState(gen7LevelMaxRibbon, gen3Pokemon, gen3inGen7, false, gameGenMap)
    ).toBe('urgent');
  });

  it('myPokemon なし → available', () => {
    // ポケモン未選択（汎用ビュー）→ available
    expect(getRibbonState(gen3Ribbon, gen3Pokemon, undefined, false, gameGenMap)).toBe('available');
  });
});
