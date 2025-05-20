<template>
  <div class="bg-white border rounded-lg p-4 shadow-sm">
    <h3 class="text-lg font-bold mb-3">リボン獲得ガイド</h3>
    
    <div v-if="!selectedRibbon" class="text-gray-500 text-center py-8">
      左のリストからリボンを選択すると、詳細な獲得方法が表示されます
    </div>
    
    <div v-else>
      <div class="flex items-start mb-4">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <img v-if="selectedRibbon.image_url" :src="selectedRibbon.image_url" :alt="selectedRibbon.name" class="w-12 h-12">
          <span v-else class="text-3xl">🎀</span>
        </div>
        <div>
          <h4 class="text-xl font-bold">{{ selectedRibbon.name }}</h4>
          <p class="text-gray-600">{{ selectedRibbon.description }}</p>
          <div class="mt-1 text-xs">
            <span class="inline-block bg-gray-200 rounded px-2 py-0.5">第{{ selectedRibbon.generation }}世代</span>
            <span class="inline-block ml-1 bg-gray-200 rounded px-2 py-0.5">{{ formatGames(selectedRibbon.games) }}</span>
          </div>
        </div>
      </div>
      
      <hr class="my-4">
      
      <div class="mb-4">
        <h5 class="font-medium mb-2">獲得条件</h5>
        <p class="text-gray-700">{{ selectedRibbon.requirements }}</p>
      </div>
      
      <div class="mb-4">
        <h5 class="font-medium mb-2">詳細な獲得方法</h5>
        <div class="bg-gray-50 p-3 rounded text-gray-700">
          {{ getRibbonGuide(selectedRibbon.id) }}
        </div>
      </div>
      
      <div v-if="getRibbonTips(selectedRibbon.id)" class="mb-4">
        <h5 class="font-medium mb-2">獲得のコツ</h5>
        <ul class="list-disc pl-5 text-gray-700">
          <li v-for="(tip, index) in getRibbonTips(selectedRibbon.id)" :key="index" class="mb-1">
            {{ tip }}
          </li>
        </ul>
      </div>
      
      <div class="mt-4 text-sm text-gray-500">
        <p>最終更新: {{ new Date().toLocaleDateString('ja-JP') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  selectedRibbon: {
    type: Object,
    default: null
  }
});

// ゲーム名をフォーマット
const formatGames = (games) => {
  if (!games) return '';
  
  const gameNames = {
    'ruby': 'ルビー',
    'sapphire': 'サファイア',
    'emerald': 'エメラルド',
    'diamond': 'ダイヤモンド',
    'pearl': 'パール',
    'platinum': 'プラチナ',
    'heartgold': 'ハートゴールド',
    'soulsilver': 'ソウルシルバー',
    'black': 'ブラック',
    'white': 'ホワイト',
    'black2': 'ブラック2',
    'white2': 'ホワイト2',
    'x': 'X',
    'y': 'Y',
    'oras': 'オメガルビー・アルファサファイア',
    'sun': 'サン',
    'moon': 'ムーン',
    'usum': 'ウルトラサン・ウルトラムーン',
    'lets_go': 'レッツゴー',
    'sword': 'ソード',
    'shield': 'シールド'
  };
  
  return games.map(game => gameNames[game] || game).join('、');
};

// リボンの詳細ガイドを取得
const getRibbonGuide = (ribbonId) => {
  const guides = {
    'champion-hoenn': 'ホウエン地方（ルビー・サファイア・エメラルド）でポケモンリーグを倒し、殿堂入りをすることで獲得できます。手持ちのポケモン全員がリボンを獲得します。',
    'contest-master-cute': 'ルビー・サファイア・エメラルドのコンテスト「かわいさ」部門のノーマル、スーパー、ハイパー、マスターランクですべて優勝する必要があります。各ランクのコンテストは各町のコンテスト会場で開催されています。',
    // 他のリボンに対するガイド...
  };
  
  return guides[ribbonId] || 'このリボンの詳細なガイドはまだ作成中です。';
};

// リボン獲得のヒントを取得
const getRibbonTips = (ribbonId) => {
  const tips = {
    'champion-hoenn': [
      'ストーリーを進めながら普通にリーグを倒せば獲得可能です。',
      '手持ちのポケモン全員がリボンを獲得するので、これから長期的にリボン集めをしたいポケモンを育成してから挑戦するとよいでしょう。'
    ],
    'contest-master-cute': [
      'ポフィンやポロックでかわいさを上げておくと有利になります。',
      'かわいさを上げる技を揃えておくと勝ちやすくなります。',
      'マスターランクは最低でもかわいさ170以上あると安定します。'
    ],
    // 他のリボンに対するヒント...
  };
  
  return tips[ribbonId] || null;
};
</script>
