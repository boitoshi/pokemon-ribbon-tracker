// Gen 3 リボン定義データ
// ルビー・サファイア・エメラルド・ファイアレッド・リーフグリーン・コロシアム・XD で取得可能な全29リボン

import type { Ribbon } from '$lib/types';

export const RIBBONS_GEN3: Ribbon[] = [
  // ── チャンピオン (1) ──────────────────────────────────────────────────────

  {
    id: 'champion-hoenn',
    name: 'チャンプリボン',
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
    description: 'コンテスト・かっこよさ部門ノーマルランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かっこよさ部門ノーマルランクで優勝する',
  },
  {
    id: 'cool-ribbon-super',
    name: 'クールリボンスーパー',
    description: 'コンテスト・かっこよさ部門スーパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かっこよさ部門スーパーランクで優勝する',
  },
  {
    id: 'cool-ribbon-hyper',
    name: 'クールリボンハイパー',
    description: 'コンテスト・かっこよさ部門ハイパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かっこよさ部門ハイパーランクで優勝する',
  },
  {
    id: 'cool-ribbon-master',
    name: 'クールリボンマスター',
    description: 'コンテスト・かっこよさ部門マスターランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かっこよさ部門マスターランクで優勝する',
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
    name: 'ビューティリボンスーパー',
    description: 'コンテスト・うつくしさ部門スーパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'うつくしさ部門スーパーランクで優勝する',
  },
  {
    id: 'beauty-ribbon-hyper',
    name: 'ビューティリボンハイパー',
    description: 'コンテスト・うつくしさ部門ハイパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'うつくしさ部門ハイパーランクで優勝する',
  },
  {
    id: 'beauty-ribbon-master',
    name: 'ビューティリボンマスター',
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
    name: 'キュートリボンスーパー',
    description: 'コンテスト・かわいさ部門スーパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かわいさ部門スーパーランクで優勝する',
  },
  {
    id: 'cute-ribbon-hyper',
    name: 'キュートリボンハイパー',
    description: 'コンテスト・かわいさ部門ハイパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かわいさ部門ハイパーランクで優勝する',
  },
  {
    id: 'cute-ribbon-master',
    name: 'キュートリボンマスター',
    description: 'コンテスト・かわいさ部門マスターランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かわいさ部門マスターランクで優勝する',
  },

  // ── コンテスト・ジーニアス (4) ────────────────────────────────────────────

  {
    id: 'smart-ribbon',
    name: 'ジーニアスリボン',
    description: 'コンテスト・かしこさ部門ノーマルランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かしこさ部門ノーマルランクで優勝する',
  },
  {
    id: 'smart-ribbon-super',
    name: 'ジーニアスリボンスーパー',
    description: 'コンテスト・かしこさ部門スーパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かしこさ部門スーパーランクで優勝する',
  },
  {
    id: 'smart-ribbon-hyper',
    name: 'ジーニアスリボンハイパー',
    description: 'コンテスト・かしこさ部門ハイパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かしこさ部門ハイパーランクで優勝する',
  },
  {
    id: 'smart-ribbon-master',
    name: 'ジーニアスリボンマスター',
    description: 'コンテスト・かしこさ部門マスターランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'かしこさ部門マスターランクで優勝する',
  },

  // ── コンテスト・パワフル (4) ──────────────────────────────────────────────

  {
    id: 'tough-ribbon',
    name: 'パワフルリボン',
    description: 'コンテスト・たくましさ部門ノーマルランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'たくましさ部門ノーマルランクで優勝する',
  },
  {
    id: 'tough-ribbon-super',
    name: 'パワフルリボンスーパー',
    description: 'コンテスト・たくましさ部門スーパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'たくましさ部門スーパーランクで優勝する',
  },
  {
    id: 'tough-ribbon-hyper',
    name: 'パワフルリボンハイパー',
    description: 'コンテスト・たくましさ部門ハイパーランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'たくましさ部門ハイパーランクで優勝する',
  },
  {
    id: 'tough-ribbon-master',
    name: 'パワフルリボンマスター',
    description: 'コンテスト・たくましさ部門マスターランク優勝',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald'],
    category: 'コンテスト',
    requirements: 'たくましさ部門マスターランクで優勝する',
  },

  // ── バトル施設 (2) ────────────────────────────────────────────────────────

  {
    id: 'winning-ribbon',
    name: 'ウイニングリボン',
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
    name: 'ブロマイドリボン',
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

  // ── イベント (2) ──────────────────────────────────────────────────────────

  {
    id: 'country-ribbon',
    name: 'カントリーリボン',
    description: '過去のイベント配布・大会で贈られたリボン（現在は入手不可）',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen'],
    category: 'イベント',
    requirements: '過去のイベント配布・大会で受け取る（現在は入手不可）',
  },
  {
    id: 'world-ribbon',
    name: 'ワールドリボン',
    description: '過去のイベント配布・大会で贈られたリボン（現在は入手不可）',
    generation: 3,
    games: ['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen'],
    category: 'イベント',
    requirements: '過去のイベント配布・大会で受け取る（現在は入手不可）',
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
