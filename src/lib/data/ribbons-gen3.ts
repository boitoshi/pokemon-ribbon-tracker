// Gen 3 リボン定義データ
// ルビー・サファイア・エメラルド・ファイアレッド・リーフグリーン・コロシアム・XD で取得可能な全27リボン

import type { Ribbon } from '$lib/types';

export const RIBBONS_GEN3: Ribbon[] = [
  // ── チャンピオン (1) ──────────────────────────────────────────────────────

  {
    id: 'champion-hoenn',
    name: 'チャンピオンリボン',
    description: 'ホウエン/カントー地方のポケモンリーグを制覇した証',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen', 'firered_switch', 'leafgreen_switch'],
    category: 'チャンピオン',
    requirements: '殿堂入りメンバーに入っている',
  },

  // ── コンテスト・クール (4) ────────────────────────────────────────────────

  {
    id: 'cool-ribbon',
    name: 'クールリボン',
    description: 'コンテスト・クール部門ノーマルランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'クール部門ノーマルランクで優勝する',
  },
  {
    id: 'cool-ribbon-super',
    name: 'クールリボン スーパー',
    description: 'コンテスト・クール部門スーパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'クール部門スーパーランクで優勝する',
  },
  {
    id: 'cool-ribbon-hyper',
    name: 'クールリボン ハイパー',
    description: 'コンテスト・クール部門ハイパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'クール部門ハイパーランクで優勝する',
  },
  {
    id: 'cool-ribbon-master',
    name: 'クールリボン マスター',
    description: 'コンテスト・クール部門マスターランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'クール部門マスターランクで優勝する',
  },

  // ── コンテスト・ビューティ (4) ───────────────────────────────────────────

  {
    id: 'beauty-ribbon',
    name: 'ビューティリボン',
    description: 'コンテスト・うつくしさ部門ノーマルランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'うつくしさ部門ノーマルランクで優勝する',
  },
  {
    id: 'beauty-ribbon-super',
    name: 'ビューティリボン スーパー',
    description: 'コンテスト・うつくしさ部門スーパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'うつくしさ部門スーパーランクで優勝する',
  },
  {
    id: 'beauty-ribbon-hyper',
    name: 'ビューティリボン ハイパー',
    description: 'コンテスト・うつくしさ部門ハイパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'うつくしさ部門ハイパーランクで優勝する',
  },
  {
    id: 'beauty-ribbon-master',
    name: 'ビューティリボン マスター',
    description: 'コンテスト・うつくしさ部門マスターランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'うつくしさ部門マスターランクで優勝する',
  },

  // ── コンテスト・キュート (4) ──────────────────────────────────────────────

  {
    id: 'cute-ribbon',
    name: 'キュートリボン',
    description: 'コンテスト・かわいさ部門ノーマルランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かわいさ部門ノーマルランクで優勝する',
  },
  {
    id: 'cute-ribbon-super',
    name: 'キュートリボン スーパー',
    description: 'コンテスト・かわいさ部門スーパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かわいさ部門スーパーランクで優勝する',
  },
  {
    id: 'cute-ribbon-hyper',
    name: 'キュートリボン ハイパー',
    description: 'コンテスト・かわいさ部門ハイパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かわいさ部門ハイパーランクで優勝する',
  },
  {
    id: 'cute-ribbon-master',
    name: 'キュートリボン マスター',
    description: 'コンテスト・かわいさ部門マスターランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かわいさ部門マスターランクで優勝する',
  },

  // ── コンテスト・スマート (4) ──────────────────────────────────────────────

  {
    id: 'smart-ribbon',
    name: 'スマートリボン',
    description: 'コンテスト・かしこさ部門ノーマルランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かしこさ部門ノーマルランクで優勝する',
  },
  {
    id: 'smart-ribbon-super',
    name: 'スマートリボン スーパー',
    description: 'コンテスト・かしこさ部門スーパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かしこさ部門スーパーランクで優勝する',
  },
  {
    id: 'smart-ribbon-hyper',
    name: 'スマートリボン ハイパー',
    description: 'コンテスト・かしこさ部門ハイパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かしこさ部門ハイパーランクで優勝する',
  },
  {
    id: 'smart-ribbon-master',
    name: 'スマートリボン マスター',
    description: 'コンテスト・かしこさ部門マスターランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かしこさ部門マスターランクで優勝する',
  },

  // ── コンテスト・タフ (4) ──────────────────────────────────────────────────

  {
    id: 'tough-ribbon',
    name: 'タフリボン',
    description: 'コンテスト・たくましさ部門ノーマルランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'たくましさ部門ノーマルランクで優勝する',
  },
  {
    id: 'tough-ribbon-super',
    name: 'タフリボン スーパー',
    description: 'コンテスト・たくましさ部門スーパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'たくましさ部門スーパーランクで優勝する',
  },
  {
    id: 'tough-ribbon-hyper',
    name: 'タフリボン ハイパー',
    description: 'コンテスト・たくましさ部門ハイパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'たくましさ部門ハイパーランクで優勝する',
  },
  {
    id: 'tough-ribbon-master',
    name: 'タフリボン マスター',
    description: 'コンテスト・たくましさ部門マスターランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'たくましさ部門マスターランクで優勝する',
  },

  // ── バトル施設 (2) ────────────────────────────────────────────────────────

  {
    id: 'winning-ribbon',
    name: 'ウィニングリボン',
    description: 'バトルタワー Lv.50チャレンジを制覇した証',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'バトル施設',
    requirements: 'バトルタワーのLv.50チャレンジで勝ち抜く',
    eligibility: { type: 'level_max', maxLevel: 50 },
  },
  {
    id: 'victory-ribbon',
    name: 'ビクトリーリボン',
    description: 'バトルタワー オープンレベルチャレンジを制覇した証',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'バトル施設',
    requirements: 'バトルタワーのオープンレベルチャレンジで勝ち抜く',
  },

  // ── コンテスト特殊 (1) ────────────────────────────────────────────────────

  {
    id: 'artist-ribbon',
    name: 'アーティストリボン',
    description: 'コンテストのマスターランクで優勝し、美術館に絵が飾られた証',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'マスターランクで最高スコアを獲得し、リルシティ美術館に絵が飾られる',
  },

  // ── 思い出 (1) ────────────────────────────────────────────────────────────

  {
    id: 'effort-ribbon',
    name: 'がんばリボン',
    description: '努力値を最大まで上げた証',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen', 'firered_switch', 'leafgreen_switch'],
    category: '思い出',
    requirements: '努力値の合計が510に達した状態で特定のNPCに話しかける',
  },

  // ── 特殊（コロシアム / XD専用）(2) ──────────────────────────────────────

  {
    id: 'national-ribbon',
    name: 'ナショナルリボン',
    description: 'シャドウポケモンを浄化した証',
    generation: 3,
    games: ['colosseum', 'xd'],
    category: '特殊',
    requirements: 'シャドウポケモンをリライブ（浄化）する',
    eligibility: { type: 'shadow_only', shadowGames: ['colosseum', 'xd'] },
  },
  {
    id: 'earth-ribbon',
    name: 'アースリボン',
    description: 'Mt.Battleを100連勝した証',
    generation: 3,
    games: ['colosseum', 'xd'],
    category: 'バトル施設',
    requirements: 'Mt.Battleの100人抜きをメンバーチェンジなしで達成する',
  },
];
