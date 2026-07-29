import type { Ribbon } from '$lib/types';

export const RIBBONS_GEN7: Ribbon[] = [
  // ============================================================
  // チャンピオン (2)
  // ============================================================
  {
    id: 'champion-alola',
    name: 'アローラチャンプリボン',
    description: 'アローラ地方のポケモンリーグを制覇した証',
    generation: 7,
    games: ['sun', 'moon', 'usum'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },
  {
    id: 'champion-lets-go',
    name: 'チャンプリボン',
    description: 'カントー地方のポケモンリーグを制覇した証（Gen3のチャンプリボンと同一）',
    generation: 7,
    games: ['lets_go'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },

  // ============================================================
  // バトル施設
  // ============================================================
  {
    id: 'battle-tree-great-ribbon',
    name: 'グレートツリーリボン',
    description: 'バトルツリー（通常）を制覇した証',
    generation: 7,
    games: ['sun', 'moon', 'usum'],
    category: 'バトル施設',
    requirements: 'バトルツリー（通常）を制覇する',
    eligibility: { type: 'level_max', maxLevel: 50 },
  },
  {
    id: 'battle-tree-master-ribbon',
    name: 'マスターツリーリボン',
    description: 'スーパーバトルツリーを制覇した証',
    generation: 7,
    games: ['sun', 'moon', 'usum'],
    category: 'バトル施設',
    requirements: 'スーパーバトルツリーを制覇する',
    eligibility: { type: 'level_max', maxLevel: 50 },
  },
  {
    id: 'battle-royal-ribbon',
    name: 'ロイヤルマスターリボン',
    description: 'バトルロイヤルのマスターランクを制覇した証',
    generation: 7,
    games: ['sun', 'moon', 'usum'],
    category: 'バトル施設',
    requirements: 'バトルロイヤルドームでマスターランクを制覇する',
    eligibility: { type: 'level_max', maxLevel: 50 },
  },

  // ============================================================
  // 友情
  // ============================================================
  {
    id: 'best-friends-ribbon-g7',
    name: 'なかよしリボン',
    description: 'トレーナーと最高の友情を育んだ証',
    generation: 7,
    games: ['sun', 'moon', 'usum'],
    category: '思い出',
    requirements: '友好度がMAXの状態でポケモンに話しかける',
  },

  // ============================================================
  // 特殊
  // ============================================================
  {
    id: 'premier-ribbon-g7',
    name: 'プレミアリボン',
    description: '記念すべき特別なリボン',
    generation: 7,
    games: ['sun', 'moon', 'usum'],
    category: 'イベント',
    requirements: 'イベント配布ポケモンを受け取る',
  },
];
