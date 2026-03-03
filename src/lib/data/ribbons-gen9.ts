import type { Ribbon } from '$lib/types';

export const RIBBONS_GEN9: Ribbon[] = [
  // ============================================================
  // チャンピオン
  // ============================================================
  {
    id: 'champion-paldea',
    name: 'パルデアチャンプリボン',
    description: 'パルデア地方で最強のトレーナーとして認められた証',
    generation: 9,
    games: ['scarlet', 'violet'],
    category: 'チャンピオン',
    requirements: '四天王とチャンピオンを倒して殿堂入りする',
  },

  // ============================================================
  // パートナー
  // ============================================================
  {
    id: 'partner-ribbon-sv',
    name: 'パートナーリボン',
    description: '特別な絆で結ばれたポケモンに贈られるリボン',
    generation: 9,
    games: ['scarlet', 'violet'],
    category: '思い出',
    requirements: '藍の円盤DLC — ブルーベリー学園の特別講師とポケモンを交換する。ニャオハ（リコ）など一部の配布ポケモンにも付いている',
  },

];
