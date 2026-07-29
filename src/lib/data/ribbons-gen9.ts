// Gen 9 リボン定義データ
// ⚠️  このファイルは自動生成です。直接編集しないでください。
// 生成元: pokemon-data/ribbons/catalog.json
// 再生成: node scripts/generate-ribbons.mjs

import type { Ribbon } from '$lib/types';

export const RIBBONS_GEN9: Ribbon[] = [
  {
    id: "champion-paldea",
    name: "パルデアチャンプリボン",
    description: "パルデア地方で最強のトレーナーとして認められた証",
    generation: 9,
    games: ["scarlet", "violet"],
    category: "チャンピオン",
    requirements: "四天王とチャンピオンを倒して殿堂入りする",
    image_url: "https://www.pokebros.net/wp-content/uploads/pokemon-assets/ribbons/paldea_champion.png",
  },
  {
    id: "partner-ribbon-sv",
    name: "パートナーリボン",
    description: "特別な絆で結ばれたポケモンに贈られるリボン",
    generation: 9,
    games: ["scarlet", "violet"],
    category: "思い出",
    requirements: "藍の円盤DLC — ブルーベリー学園の特別講師とポケモンを交換する。ニャオハ（リコ）など一部の配布ポケモンにも付いている",
    image_url: "https://www.pokebros.net/wp-content/uploads/pokemon-assets/ribbons/partner.png",
  },
];
