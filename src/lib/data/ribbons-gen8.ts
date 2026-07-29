import type { Ribbon } from '$lib/types';

export const RIBBONS_GEN8: Ribbon[] = [
  // ============================================================
  // チャンピオン
  // ============================================================
  {
    id: 'champion-galar',
    name: 'ガラルチャンプリボン',
    description: 'ガラル地方のポケモンリーグを制覇した証',
    generation: 8,
    games: ['sword', 'shield'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },
  {
    id: 'champion-sinnoh-bdsp',
    name: 'シンオウチャンプリボン',
    description: 'シンオウ地方のポケモンリーグを制覇した証（BDSP）',
    generation: 8,
    games: ['brilliant_diamond', 'shining_pearl'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },

  // ============================================================
  // コンテスト
  // ============================================================
  {
    id: 'twinkling-star-ribbon',
    name: 'トゥインクルスターリボン',
    description: 'スーパーコンテストショーのマスターランクでベストパフォーマーに輝いた証',
    generation: 8,
    games: ['brilliant_diamond', 'shining_pearl'],
    category: 'コンテスト',
    requirements: 'スーパーコンテストショー マスターランクでベストパフォーマーになる（5部門のマスターランク制覇後に挑戦可能）',
  },

  // ============================================================
  // バトル施設
  // ============================================================
  {
    id: 'tower-master-ribbon',
    name: 'マスタータワーリボン',
    description: 'バトルタワーでマスターランクに到達した証',
    generation: 8,
    games: ['sword', 'shield', 'brilliant_diamond', 'shining_pearl'],
    category: 'バトル施設',
    requirements: 'バトルタワーでマスターランクに到達する（BDSPのバトルタワー制覇でも入手可能）',
    eligibility: { type: 'level_max', maxLevel: 50 },
  },
  {
    id: 'master-rank-ribbon',
    name: 'マスターランクリボン',
    description: 'バトルスタジアムのランクバトルでマスターランクに到達した証',
    generation: 8,
    games: ['sword', 'shield', 'scarlet', 'violet'],
    category: 'バトル施設',
    requirements: 'バトルスタジアムのランクバトルでマスターランクに到達する（SVのランクバトル マスターボール級到達でも入手可能）',
  },

  // ============================================================
  // 思い出
  // ============================================================
  {
    id: 'hisui-ribbon',
    name: 'ヒスイリボン',
    description: 'ヒスイ地方で記念写真を撮った思い出の証',
    generation: 8,
    games: ['legends_arceus'],
    category: '思い出',
    requirements: 'コトブキムラの写真屋でポケモンと記念写真を撮る',
  },

  // ============================================================
  // 友情
  // ============================================================
  {
    id: 'best-friends-ribbon-g8',
    name: 'なかよしリボン',
    description: 'トレーナーと最高の友情を育んだ証',
    generation: 8,
    games: ['sword', 'shield'],
    category: '思い出',
    requirements: '友好度がMAXの状態でポケモンに話しかける',
  },
];
