import type { Ribbon } from '$lib/types';

export const RIBBONS_GEN6: Ribbon[] = [
  // ============================================================
  // チャンピオン (2)
  // ============================================================
  {
    id: 'champion-kalos',
    name: 'カロスチャンプリボン',
    description: 'カロス地方のポケモンリーグを制覇した証',
    generation: 6,
    games: ['x', 'y'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },
  {
    id: 'champion-hoenn-remake',
    name: 'ホウエンチャンプリボン',
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
    name: 'かっこよさマスターリボン',
    description: 'コンテスト・かっこよさ部門のマスターランクで優勝した証',
    generation: 6,
    games: ['oras'],
    category: 'コンテスト',
    requirements: 'ポケモンコンテスト・かっこよさ部門 マスターランクで優勝する',
  },
  {
    id: 'beauty-ribbon-oras',
    name: 'うつくしさマスターリボン',
    description: 'コンテスト・うつくしさ部門のマスターランクで優勝した証',
    generation: 6,
    games: ['oras'],
    category: 'コンテスト',
    requirements: 'ポケモンコンテスト・うつくしさ部門 マスターランクで優勝する',
  },
  {
    id: 'cuteness-ribbon',
    name: 'かわいさマスターリボン',
    description: 'コンテスト・かわいさ部門のマスターランクで優勝した証',
    generation: 6,
    games: ['oras'],
    category: 'コンテスト',
    requirements: 'ポケモンコンテスト・かわいさ部門 マスターランクで優勝する',
  },
  {
    id: 'cleverness-ribbon',
    name: 'かしこさマスターリボン',
    description: 'コンテスト・かしこさ部門のマスターランクで優勝した証',
    generation: 6,
    games: ['oras'],
    category: 'コンテスト',
    requirements: 'ポケモンコンテスト・かしこさ部門 マスターランクで優勝する',
  },
  {
    id: 'toughness-ribbon',
    name: 'たくましさマスターリボン',
    description: 'コンテスト・たくましさ部門のマスターランクで優勝した証',
    generation: 6,
    games: ['oras'],
    category: 'コンテスト',
    requirements: 'ポケモンコンテスト・たくましさ部門 マスターランクで優勝する',
  },

  // ============================================================
  // バトル・トレーニング
  // ============================================================
  {
    id: 'training-ribbon',
    name: 'しゅぎょうリボン',
    description: 'スーパートレーニングを完全クリアした証',
    generation: 6,
    games: ['x', 'y', 'oras'],
    category: 'バトル施設',
    requirements: '同一個体でスーパートレーニングの全30トレーニングを「すごい記録」でクリアし、XYは自宅の母、ORASはムロタウンの男性に話しかける',
  },
  {
    id: 'skillful-battler-ribbon',
    name: 'グレートバトルリボン',
    description: '高度なバトルで実力を示した証',
    generation: 6,
    games: ['x', 'y'],
    category: 'バトル施設',
    requirements: 'スカイバトルで所定の条件を達成する',
  },
  {
    id: 'expert-battler-ribbon',
    name: 'マスターバトルリボン',
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
    name: 'なかよしリボン',
    description: 'トレーナーと最高の友情を育んだ証',
    generation: 6,
    games: ['x', 'y', 'oras'],
    category: '思い出',
    requirements: '友好度がMAXの状態でポケモンに話しかける',
  },

  // ============================================================
  // 思い出（過去作リボンの変換）
  // ============================================================
  {
    id: 'contest-memory-ribbon',
    name: 'おもいでコンテストリボン',
    description: '過去作で取得したコンテスト系リボンの思い出をまとめたリボン',
    generation: 6,
    games: ['x', 'y', 'oras'],
    category: '思い出',
    requirements: 'Gen3/4のコンテスト系リボンを持つポケモンをポケムーバー/ポケモンバンク経由でGen6に転送すると変換付与される',
  },
  {
    id: 'battle-memory-ribbon',
    name: 'おもいでバトルリボン',
    description: '過去作で取得したバトル施設系リボンの思い出をまとめたリボン',
    generation: 6,
    games: ['x', 'y', 'oras'],
    category: '思い出',
    requirements: 'Gen3/4のバトル施設系リボンを持つポケモンをポケムーバー/ポケモンバンク経由でGen6に転送すると変換付与される',
  },
];
