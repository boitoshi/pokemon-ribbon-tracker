import { describe, it, expect } from 'vitest';
import type { PokemonDetail, MyPokemon } from '~/types';
import { canPokemonGetRibbon } from '~/utils/ribbonEligibility';
import { RIBBONS_GEN3 } from '~/data/ribbons-gen3';

// ── テスト用ポケモンデータ ────────────────────────────────────────────────

const pikachu: PokemonDetail = {
  id: 'pikachu',
  dexNumber: 25,
  name: 'ピカチュウ',
  types: ['でんき'],
  generation: 1,
  image: '',
  category: 'ねずみポケモン',
  height: 4,
  weight: 60,
  abilities: ['static'],
};

const makuhita: PokemonDetail = {
  id: 'makuhita',
  dexNumber: 296,
  name: 'マクノシタ',
  types: ['かくとう'],
  generation: 3,
  image: '',
  category: 'ガッツポケモン',
  height: 10,
  weight: 864,
  abilities: ['thick-fat'],
};

const bidoof: PokemonDetail = {
  id: 'bidoof',
  dexNumber: 399,
  name: 'ビッパ',
  types: ['ノーマル'],
  generation: 4,
  image: '',
  category: 'まるねずみポケモン',
  height: 5,
  weight: 200,
  abilities: ['simple'],
};

// ── リボンデータの取得ヘルパー ────────────────────────────────────────────

function getRibbon(id: string) {
  const ribbon = RIBBONS_GEN3.find((r) => r.id === id);
  if (!ribbon) throw new Error(`Ribbon '${id}' not found in RIBBONS_GEN3`);
  return ribbon;
}

// ── テスト ────────────────────────────────────────────────────────────────

describe('canPokemonGetRibbon', () => {
  describe('世代チェック', () => {
    it('第4世代ポケモンは第3世代リボンを取得できない', () => {
      const ribbon = getRibbon('champion-hoenn');
      const result = canPokemonGetRibbon(bidoof, ribbon);
      expect(result.eligible).toBe(false);
    });

    it('第1世代ポケモンは第3世代リボンを取得できる', () => {
      const ribbon = getRibbon('champion-hoenn');
      const result = canPokemonGetRibbon(pikachu, ribbon);
      expect(result.eligible).toBe(true);
    });
  });

  describe('eligibilityフィールドなし', () => {
    it('eligibilityがないリボンは互換世代のポケモンが取得可能', () => {
      const ribbon = getRibbon('champion-hoenn');
      // champion-hoenn は eligibility フィールドを持たない
      expect(ribbon.eligibility).toBeUndefined();
      const result = canPokemonGetRibbon(pikachu, ribbon);
      expect(result.eligible).toBe(true);
    });
  });

  describe('shadow_only — 非シャドウポケモン', () => {
    it('ピカチュウ（非シャドウ）はナショナルリボンを取得できない', () => {
      const ribbon = getRibbon('national-ribbon');
      const result = canPokemonGetRibbon(pikachu, ribbon);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('シャドウ');
    });
  });

  describe('shadow_only — シャドウポケモン（myPokemonなし）', () => {
    it('マクノシタ（シャドウ）はmyPokemonなしでナショナルリボンを取得できる', () => {
      const ribbon = getRibbon('national-ribbon');
      const result = canPokemonGetRibbon(makuhita, ribbon);
      expect(result.eligible).toBe(true);
    });
  });

  describe('shadow_only — シャドウポケモン with myPokemon', () => {
    it('originGameがcolosseumのマクノシタはナショナルリボンを取得できる', () => {
      const ribbon = getRibbon('national-ribbon');
      const myPokemon: MyPokemon = {
        id: 'my-makuhita-1',
        pokemonId: 'makuhita',
        nickname: 'マクノシタ',
        originGame: 'colosseum',
        memo: '',
        createdAt: '2026-02-18T00:00:00.000Z',
      };
      const result = canPokemonGetRibbon(makuhita, ribbon, myPokemon);
      expect(result.eligible).toBe(true);
    });

    it('originGameがemeraldのマクノシタはナショナルリボンを取得できない', () => {
      const ribbon = getRibbon('national-ribbon');
      const myPokemon: MyPokemon = {
        id: 'my-makuhita-2',
        pokemonId: 'makuhita',
        nickname: 'マクノシタ',
        originGame: 'emerald',
        memo: '',
        createdAt: '2026-02-18T00:00:00.000Z',
      };
      const result = canPokemonGetRibbon(makuhita, ribbon, myPokemon);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('コロシアム/XD');
    });
  });

  describe('level_max', () => {
    it('ウィニングリボンは取得可能で、理由にLv.50が含まれる', () => {
      const ribbon = getRibbon('winning-ribbon');
      const result = canPokemonGetRibbon(pikachu, ribbon);
      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('Lv.50');
    });
  });
});
