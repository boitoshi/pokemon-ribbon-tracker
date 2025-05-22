<template>
  <div>
    <h2 class="text-xl font-bold mb-4">リボン取得チャート</h2>
    
    <div v-if="!pokemon" class="bg-yellow-100 border-yellow-400 border p-4 rounded">
      <p>ポケモンを選択すると、世代別のリボン取得状況が表示されます。</p>
    </div>
    
    <div v-else>
      <!-- ポケモン情報 -->
      <div class="mb-4 p-4 bg-green-50 rounded">
        <h3 class="font-medium">{{ pokemon.name }}のリボンチャート</h3>
      </div>
      
      <!-- ゲーム別リボンチャート -->
      <div class="space-y-6">
        <!-- 各世代のセクション -->
        <div v-for="(gameGroup, generation) in gameRibbonsMap" :key="generation" class="border rounded-lg overflow-hidden">
          <div class="bg-gray-100 p-3 font-medium">第{{ generation }}世代</div>
          
          <!-- 各ゲームのリボン -->
          <div v-for="(gameData, game) in gameGroup" :key="game" class="border-b last:border-b-0">
            <div class="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <h4 class="font-medium">{{ getGameName(game) }}</h4>
              <span class="text-sm text-gray-600">{{ gameData.ribbons.length }}個のリボン</span>
            </div>
            
            <!-- リボン一覧 -->
            <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div 
                v-for="ribbon in gameData.ribbons" 
                :key="`${game}-${ribbon.id}`"
                class="flex items-center p-2 bg-white border rounded">
                
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <span class="text-sm">🎀</span>
                </div>
                
                <div class="flex-1 text-sm">
                  <div class="font-medium">{{ ribbon.name }}</div>
                  <div class="text-xs text-gray-500 line-clamp-1">{{ ribbon.description }}</div>
                </div>
                
                <!-- 取得状況表示（実際のアプリでは、ユーザー選択から取得） -->
                <div class="ml-2 w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                  <span v-if="isRibbonObtained(ribbon.id)" class="text-green-800">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 移行経路 -->
      <div class="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 class="font-medium mb-2">世代間移行経路</h3>
        <div class="text-sm">
          <p>第3世代 → 第4世代: パルパーク</p>
          <p>第4世代 → 第5世代: ポケシフター</p>
          <p>第5世代 → 第6世代: ポケムーバー → ポケバンク</p>
          <p>第6世代 → 第7世代: ポケバンク</p>
          <p>第7世代 → 第8世代: ポケバンク → ポケモンHOME</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  pokemon: {
    type: Object,
    default: null
  },
  ribbons: {
    type: Array,
    required: true
  },
  games: {
    type: Array,
    required: true
  }
});

// 取得済みリボンの状態（実際のアプリではAPIから取得したり、Vuexで管理）
const obtainedRibbons = ref([
  'champion-hoenn',
  'contest-master-cute'
  // 実際のアプリではここに取得済みリボンIDが入る
]);

// ゲーム名の表示用マッピング
const getGameName = (gameId) => {
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
    'sword': 'ソード',
    'shield': 'シールド'
  };
  
  return gameNames[gameId] || gameId;
};

// リボンが取得済みかどうかのチェック
const isRibbonObtained = (ribbonId) => {
  return obtainedRibbons.value.includes(ribbonId);
};

// ゲームとリボンのマッピング作成
const gameRibbonsMap = computed(() => {
  const map = {};
  
  // ゲームデータからマッピングを構築
  props.games.forEach(game => {
    // 世代がまだマップになければ初期化
    if (!map[game.generation]) {
      map[game.generation] = {};
    }
    
    // そのゲームで取得可能なリボンを抽出
    const gameRibbons = props.ribbons.filter(ribbon => 
      ribbon.games && ribbon.games.includes(game.id)
    );
    
    map[game.generation][game.id] = {
      name: getGameName(game.id),
      ribbons: gameRibbons
    };
  });
  
  return map;
});
</script>
