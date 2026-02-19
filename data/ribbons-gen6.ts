import type { Ribbon } from '~/types';

export const RIBBONS_GEN6: Ribbon[] = [
  // ============================================================
  // チャンピオン (2)
  // ============================================================
  {
    id: 'champion-kalos',
    name: 'カロスチャンピオンリボン',
    description: 'カロス地方のポケモンリーグを制覇した証',
    generation: 6,
    games: ['x', 'y'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },
  {
    id: 'champion-hoenn-remake',
    name: 'ホウエンチャンピオンリボン',
    description: 'ホウエン地方のポケモンリーグを制覇した証',
    generation: 6,
    games: ['oras'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },

  // ============================================================
  // コンテスト (5) — OR/AS コンテスト・マスターランク
  // ============================================================
  {
    id: 'coolness-ribbon',
    name: 'クールネスリボン',
    description: 'コンテスト・クールのマスターランクで優勝した証',
    generation: 6,
    games: ['oras'],
    category: 'コンテスト',
    requirements: 'ポケモンコンテスト・クール マスターランクで優勝する',
  },
  {
    id: 'beauty-ribbon-oras',
    name: 'ビューティーリボン',
    description: 'コンテスト・ビューティーのマスターランクで優勝した証',
    generation: 6,
    games: ['oras'],
    category: 'コンテスト',
    requirements: 'ポケモンコンテスト・ビューティー マスターランクで優勝する',
  },
  {
    id: 'cuteness-ribbon',
    name: 'キュートネスリボン',
    description: 'コンテスト・キュートのマスターランクで優勝した証',
    generation: 6,
    games: ['oras'],
    category: 'コンテスト',
    requirements: 'ポケモンコンテスト・キュート マスターランクで優勝する',
  },
  {
    id: 'cleverness-ribbon',
    name: 'クレバーネスリボン',
    description: 'コンテスト・かしこさのマスターランクで優勝した証',
    generation: 6,
    games: ['oras'],
    category: 'コンテスト',
    requirements: 'ポケモンコンテスト・かしこさ マスターランクで優勝する',
  },
  {
    id: 'toughness-ribbon',
    name: 'タフネスリボン',
    description: 'コンテスト・タフネスのマスターランクで優勝した証',
    generation: 6,
    games: ['oras'],
    category: 'コンテスト',
    requirements: 'ポケモンコンテスト・タフネス マスターランクで優勝する',
  },

  // ============================================================
  // バトル・トレーニング
  // ============================================================
  {
    id: 'training-ribbon',
    name: 'トレーニングリボン',
    description: 'スーパートレーニングを完全クリアした証',
    generation: 6,
    games: ['x', 'y', 'oras'],
    category: 'バトル施設',
    requirements: 'スーパートレーニングの全コースをS評価でクリアする',
  },
  {
    id: 'skillful-battler-ribbon',
    name: 'バトルマスターリボン',
    description: '高度なバトルで実力を示した証',
    generation: 6,
    games: ['x', 'y'],
    category: 'バトル施設',
    requirements: 'スカイバトルで所定の条件を達成する',
  },
  {
    id: 'expert-battler-ribbon',
    name: 'エキスパートバトラーリボン',
    description: 'エキスパートとして認められたバトルの実力の証',
    generation: 6,
    games: ['x', 'y'],
    category: 'バトル施設',
    requirements: 'バトルシャトーで所定のランクに到達する',
  },

  // ============================================================
  // 友情
  // ============================================================
  {
    id: 'best-friends-ribbon-g6',
    name: 'ベストフレンドリボン',
    description: 'トレーナーと最高の友情を育んだ証',
    generation: 6,
    games: ['x', 'y', 'oras'],
    category: '思い出',
    requirements: '友好度がMAXの状態でポケモンに話しかける',
  },
];
