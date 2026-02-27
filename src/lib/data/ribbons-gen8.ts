import type { Ribbon } from '$lib/types';

export const RIBBONS_GEN8: Ribbon[] = [
  // ============================================================
  // チャンピオン
  // ============================================================
  {
    id: 'champion-galar',
    name: 'ガラルチャンピオンリボン',
    description: 'ガラル地方のポケモンリーグを制覇した証',
    generation: 8,
    games: ['sword', 'shield'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },
  {
    id: 'champion-legends-arceus',
    name: '銀河チャンピオンリボン',
    description: 'ヒスイ地方で銀河団のポケモン使いとして最強を証明した証',
    generation: 8,
    games: ['legends_arceus'],
    category: 'チャンピオン',
    requirements: '銀河団のポケモン使いとして最強の証明を果たす',
  },

  // ============================================================
  // バトル施設
  // ============================================================
  {
    id: 'tower-master-ribbon',
    name: 'タワーマスターリボン',
    description: 'バトルタワーでマスターランクに到達した証',
    generation: 8,
    games: ['sword', 'shield'],
    category: 'バトル施設',
    requirements: 'バトルタワーでマスターランクに到達する',
    eligibility: { type: 'level_max', maxLevel: 50 },
  },
  {
    id: 'master-rank-ribbon',
    name: 'マスターランクリボン',
    description: 'バトルスタジアムのランクバトルでマスターランクに到達した証',
    generation: 8,
    games: ['sword', 'shield'],
    category: 'バトル施設',
    requirements: 'バトルスタジアムのランクバトルでマスターランクに到達する',
  },

  // ============================================================
  // 友情
  // ============================================================
  {
    id: 'best-friends-ribbon-g8',
    name: 'ベストフレンドリボン',
    description: 'トレーナーと最高の友情を育んだ証',
    generation: 8,
    games: ['sword', 'shield'],
    category: '思い出',
    requirements: '友好度がMAXの状態でポケモンに話しかける',
  },
];
