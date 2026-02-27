import type { Ribbon } from '$lib/types';

export const RIBBONS_GEN7: Ribbon[] = [
  // ============================================================
  // チャンピオン (2)
  // ============================================================
  {
    id: 'champion-alola',
    name: 'アローラチャンピオンリボン',
    description: 'アローラ地方のポケモンリーグを制覇した証',
    generation: 7,
    games: ['sun', 'moon', 'usum'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },
  {
    id: 'champion-lets-go',
    name: 'チャンピオンリボン',
    description: 'カントー地方のポケモンリーグを制覇した証',
    generation: 7,
    games: ['lets_go'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },

  // ============================================================
  // バトル施設
  // ============================================================
  {
    id: 'battle-tree-ribbon',
    name: 'バトルツリーリボン',
    description: 'バトルツリーで20連勝した証',
    generation: 7,
    games: ['sun', 'moon', 'usum'],
    category: 'バトル施設',
    requirements: 'バトルツリーのシングルバトルで20連勝する',
    eligibility: { type: 'level_max', maxLevel: 50 },
  },
  {
    id: 'battle-royal-ribbon',
    name: 'バトルロイヤルリボン',
    description: 'バトルロイヤルのマスターランクに到達した証',
    generation: 7,
    games: ['sun', 'moon', 'usum'],
    category: 'バトル施設',
    requirements: 'バトルロイヤルドームでマスターランクに到達する',
    eligibility: { type: 'level_max', maxLevel: 50 },
  },

  // ============================================================
  // 友情
  // ============================================================
  {
    id: 'best-friends-ribbon-g7',
    name: 'ベストフレンドリボン',
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
