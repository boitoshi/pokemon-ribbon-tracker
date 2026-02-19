import type { Ribbon } from '~/types';

export const RIBBONS_GEN5: Ribbon[] = [
  // ============================================================
  // イベント・特殊 (Gen 5 はイベント配布リボンが中心)
  // ============================================================
  {
    id: 'classic-ribbon',
    name: 'クラシックリボン',
    description: 'イベントで配布された特別なポケモンに付いているリボン',
    generation: 5,
    games: ['black', 'white', 'black2', 'white2'],
    category: 'イベント',
    requirements: 'イベント配布ポケモンを受け取る',
  },
  {
    id: 'wishing-ribbon',
    name: 'ウィッシングリボン',
    description: '願いをかなえてくれる不思議なリボン',
    generation: 5,
    games: ['black', 'white', 'black2', 'white2'],
    category: 'イベント',
    requirements: 'イベント配布ポケモンを受け取る',
  },
  {
    id: 'premier-ribbon',
    name: 'プレミアリボン',
    description: '記念すべき特別なリボン',
    generation: 5,
    games: ['black', 'white', 'black2', 'white2'],
    category: 'イベント',
    requirements: 'イベント配布ポケモンを受け取る',
  },
  {
    id: 'event-ribbon',
    name: 'イベントリボン',
    description: 'イベントに参加した証として贈られるリボン',
    generation: 5,
    games: ['black', 'white', 'black2', 'white2'],
    category: 'イベント',
    requirements: 'イベント参加または配布ポケモンを受け取る',
  },
  {
    id: 'birthday-ribbon',
    name: 'バースデーリボン',
    description: '誕生日を祝って贈られる特別なリボン',
    generation: 5,
    games: ['black', 'white', 'black2', 'white2'],
    category: 'イベント',
    requirements: 'イベント配布ポケモンを受け取る',
  },
  {
    id: 'special-ribbon',
    name: 'スペシャルリボン',
    description: '特別な証として贈られるリボン',
    generation: 5,
    games: ['black', 'white', 'black2', 'white2'],
    category: 'イベント',
    requirements: 'イベント配布ポケモンを受け取る',
  },
  {
    id: 'souvenir-ribbon',
    name: 'スーベニアリボン',
    description: '旅の記念として贈られるリボン',
    generation: 5,
    games: ['black', 'white', 'black2', 'white2'],
    category: 'イベント',
    requirements: 'イベント配布ポケモンを受け取る',
  },
];
