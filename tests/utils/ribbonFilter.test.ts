import { describe, it, expect } from 'vitest';
import type { Ribbon } from '~/types';

const CATEGORY_MAP: Record<string, string> = {
  champion: 'チャンピオン',
  contest: 'コンテスト',
  battle: 'バトル施設',
  memory: '思い出',
  event: 'イベント',
};

/**
 * フィルタータイプIDを日本語カテゴリ名に変換する
 */
function getCategoryName(filterId: string): string | undefined {
  return CATEGORY_MAP[filterId];
}

/**
 * カテゴリでリボン配列をフィルタリングする
 */
function filterRibbonsByCategory(ribbons: Ribbon[], filterId: string): Ribbon[] {
  const categoryName = getCategoryName(filterId);
  if (!categoryName) return [];
  return ribbons.filter((r) => r.category === categoryName);
}

const sampleRibbons: Ribbon[] = [
  {
    id: 'champion-hoenn',
    name: 'チャンピオンリボン（ホウエン）',
    description: 'ホウエンリーグを制覇した証',
    generation: 3,
    games: ['ruby', 'sapphire'],
    category: 'チャンピオン',
  },
  {
    id: 'cool-contest',
    name: 'カッコよさリボン',
    description: 'コンテストで優勝した証',
    generation: 3,
    games: ['ruby'],
    category: 'コンテスト',
  },
  {
    id: 'battle-frontier',
    name: 'バトルフロンティアリボン',
    description: 'バトルフロンティアを制覇した証',
    generation: 3,
    games: ['emerald'],
    category: 'バトル施設',
  },
  {
    id: 'effort',
    name: 'がんばリボン',
    description: '努力を重ねた証',
    generation: 3,
    games: ['ruby'],
    category: '思い出',
  },
  {
    id: 'alert',
    name: 'アラートリボン',
    description: 'イベントで配布された証',
    generation: 4,
    games: ['diamond'],
    category: 'イベント',
  },
];

describe('CATEGORY_MAP', () => {
  it('champion が チャンピオン にマップされる', () => {
    expect(getCategoryName('champion')).toBe('チャンピオン');
  });

  it('contest が コンテスト にマップされる', () => {
    expect(getCategoryName('contest')).toBe('コンテスト');
  });

  it('battle が バトル施設 にマップされる', () => {
    expect(getCategoryName('battle')).toBe('バトル施設');
  });

  it('memory が 思い出 にマップされる', () => {
    expect(getCategoryName('memory')).toBe('思い出');
  });

  it('event が イベント にマップされる', () => {
    expect(getCategoryName('event')).toBe('イベント');
  });

  it('未知のカテゴリIDは undefined を返す', () => {
    expect(getCategoryName('unknown')).toBeUndefined();
    expect(getCategoryName('')).toBeUndefined();
    expect(getCategoryName('CHAMPION')).toBeUndefined();
  });
});

describe('filterRibbonsByCategory', () => {
  it('champion フィルターでチャンピオンリボンのみ返す', () => {
    const result = filterRibbonsByCategory(sampleRibbons, 'champion');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('champion-hoenn');
    expect(result[0].category).toBe('チャンピオン');
  });

  it('contest フィルターでコンテストリボンのみ返す', () => {
    const result = filterRibbonsByCategory(sampleRibbons, 'contest');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cool-contest');
  });

  it('battle フィルターでバトル施設リボンのみ返す', () => {
    const result = filterRibbonsByCategory(sampleRibbons, 'battle');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('battle-frontier');
  });

  it('memory フィルターで思い出リボンのみ返す', () => {
    const result = filterRibbonsByCategory(sampleRibbons, 'memory');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('effort');
  });

  it('event フィルターでイベントリボンのみ返す', () => {
    const result = filterRibbonsByCategory(sampleRibbons, 'event');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('alert');
  });

  it('未知のフィルターIDは空配列を返す', () => {
    const result = filterRibbonsByCategory(sampleRibbons, 'unknown');
    expect(result).toHaveLength(0);
  });

  it('空のリボン配列は空配列を返す', () => {
    const result = filterRibbonsByCategory([], 'champion');
    expect(result).toHaveLength(0);
  });

  it('複数一致するリボンをすべて返す', () => {
    const ribbonsWithMultipleChampion: Ribbon[] = [
      ...sampleRibbons,
      {
        id: 'champion-sinnoh',
        name: 'チャンピオンリボン（シンオウ）',
        description: 'シンオウリーグを制覇した証',
        generation: 4,
        games: ['diamond', 'pearl'],
        category: 'チャンピオン',
      },
    ];
    const result = filterRibbonsByCategory(ribbonsWithMultipleChampion, 'champion');
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.category === 'チャンピオン')).toBe(true);
  });
});
