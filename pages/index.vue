<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-center">ポケモンリボン制覇支援ツール</h1>
    
    <!-- ポケモン検索セクション -->
    <div class="mb-8">
      <PokemonSearch @select="selectPokemon" />
    </div>

    <!-- 選択されたポケモン情報 -->
    <div v-if="selectedPokemon" class="mb-8">
      <PokemonDetails :pokemon="selectedPokemon" />
    </div>

    <!-- メインタブ -->
    <div class="mb-8">
      <div class="flex border-b flex-wrap">
        <button 
          @click="activeTab = 'ribbons'" 
          :class="['px-4 py-2 mr-2', activeTab === 'ribbons' ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700']">
          リボン一覧
        </button>
        <button 
          @click="activeTab = 'chart'" 
          :class="['px-4 py-2 mr-2', activeTab === 'chart' ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700']">
          リボン取得チャート
        </button>
        <button 
          @click="activeTab = 'master'" 
          :class="['px-4 py-2 mr-2', activeTab === 'master' ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700']">
          リボン王チャート
        </button>
        <button 
          @click="activeTab = 'guide'" 
          :class="['px-4 py-2 mr-2', activeTab === 'guide' ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700']">
          獲得ガイド
        </button>
        <button 
          @click="activeTab = 'transfer'" 
          :class="['px-4 py-2 mr-2', activeTab === 'transfer' ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700']">
          転送方法
        </button>
      </div>

      <!-- タブコンテンツ -->
      <div class="mt-4">
        <div v-if="activeTab === 'ribbons'">
          <RibbonFilter @filter-change="applyFilters" />
          <RibbonsList 
            :pokemon="selectedPokemon" 
            :ribbons="filteredRibbons" 
            @select-ribbon="selectRibbon" />
        </div>
          
        <RibbonChart 
          v-if="activeTab === 'chart'" 
          :pokemon="selectedPokemon" 
          :ribbons="ribbons" 
          :games="games" />
          
        <RibbonMasterChart 
          v-if="activeTab === 'master'" 
          :pokemon="selectedPokemon" 
          :ribbons="ribbons" />
          
        <div v-if="activeTab === 'guide'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-1">
            <h3 class="text-lg font-bold mb-3">リボンリスト</h3>
            <div class="border rounded overflow-y-auto max-h-96">
              <div
                v-for="ribbon in ribbons"
                :key="ribbon.id"
                @click="selectRibbon(ribbon)"
                :class="['p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0', 
                         selectedRibbon && selectedRibbon.id === ribbon.id ? 'bg-blue-50' : '']">
                <div class="font-medium">{{ ribbon.name }}</div>
                <div class="text-xs text-gray-600">第{{ ribbon.generation }}世代</div>
              </div>
            </div>
          </div>
          <div class="md:col-span-2">
            <RibbonGuide :selectedRibbon="selectedRibbon" />
          </div>
        </div>
        
        <TransferGuide v-if="activeTab === 'transfer'" />
      </div>
    </div>
    
    <!-- お役立ち情報セクション -->
    <HelpfulResources />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

// 状態管理
const activeTab = ref('ribbons');
const selectedPokemon = ref(null);
const ribbons = ref([]);
const games = ref([]);
const selectedRibbon = ref(null);
const filters = ref({
  generation: null,
  type: null,
  status: null,
  search: ''
});

// ポケモン選択時のハンドラ
const selectPokemon = (pokemon) => {
  selectedPokemon.value = pokemon;
};

// リボン選択時のハンドラ
const selectRibbon = (ribbon) => {
  selectedRibbon.value = ribbon;
  if (activeTab.value !== 'guide') {
    activeTab.value = 'guide';
  }
};

// フィルター適用
const applyFilters = (newFilters) => {
  filters.value = { ...newFilters };
};

// フィルター適用後のリボン一覧
const filteredRibbons = computed(() => {
  let result = ribbons.value;
  
  // 世代フィルター
  if (filters.value.generation) {
    result = result.filter(ribbon => ribbon.generation === filters.value.generation);
  }
  
  // タイプフィルター
  if (filters.value.type) {
    result = result.filter(ribbon => {
      // リボンタイプの判定ロジック（実際のアプリではより精緻なロジックを実装）
      if (filters.value.type === 'champion' && ribbon.id.includes('champion')) return true;
      if (filters.value.type === 'contest' && ribbon.id.includes('contest')) return true;
      if (filters.value.type === 'battle' && ribbon.id.includes('tower')) return true;
      if (filters.value.type === 'memory' && ribbon.id.includes('memory')) return true;
      if (filters.value.type === 'event' && ribbon.id.includes('event')) return true;
      return false;
    });
  }
  
  // 検索フィルター
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase();
    result = result.filter(ribbon => 
      ribbon.name.toLowerCase().includes(searchLower) || 
      ribbon.description.toLowerCase().includes(searchLower)
    );
  }
  
  return result;
});

// データの読み込み
onMounted(async () => {
  // 実際のアプリでは適切なデータ取得ロジックに置き換え
  ribbons.value = await fetchRibbonData();
  games.value = await fetchGameData();
});

// データ取得関数（実際のアプリではAPI呼び出しなど）
const fetchRibbonData = async () => {
  // サンプルデータ
  return [
    {
      id: 'champion-hoenn',
      name: 'ホウエンチャンピオンリボン',
      description: 'ホウエン地方のポケモンリーグで優勝した証',
      games: ['ruby', 'sapphire', 'emerald', 'oras'],
      generation: 3,
      compatible_pokemon: 'all-except-special',
      requirements: 'ホウエン地方のポケモンリーグを制覇する',
      image_url: '/ribbons/champion-hoenn.png',
      type: 'champion'
    },
    {
      id: 'contest-master-cute',
      name: 'かわいさマスターリボン',
      description: 'かわいさコンテストですべてのランクで優勝した証',
      games: ['ruby', 'sapphire', 'emerald'],
      generation: 3,
      compatible_pokemon: 'all-except-special',
      requirements: 'かわいさコンテストのすべてのランクで優勝する',
      image_url: '/ribbons/contest-master-cute.png',
      type: 'contest'
    },
    {
      id: 'tower-ability',
      name: 'アビリティリボン',
      description: 'バトルタワーでレベル50のポケモンと対戦し勝ち抜いた証',
      games: ['ruby', 'sapphire', 'emerald'],
      generation: 3,
      compatible_pokemon: 'all',
      requirements: 'バトルタワーのレベル50の「シングル」で勝ち抜く',
      image_url: '/ribbons/tower-ability.png',
      type: 'battle'
    },
    {
      id: 'champion-sinnoh',
      name: 'シンオウチャンピオンリボン',
      description: 'シンオウ地方のポケモンリーグで優勝した証',
      games: ['diamond', 'pearl', 'platinum'],
      generation: 4,
      compatible_pokemon: 'all',
      requirements: 'シンオウ地方のポケモンリーグを制覇する',
      image_url: '/ribbons/champion-sinnoh.png',
      type: 'champion'
    },
    {
      id: 'memory-kalos',
      name: 'カロス思い出リボン',
      description: 'カロス地方での思い出を記念したリボン',
      games: ['x', 'y'],
      generation: 6,
      compatible_pokemon: 'all',
      requirements: 'X・Yでポケモンと過ごす',
      image_url: '/ribbons/memory-kalos.png',
      type: 'memory'
    },
    // 他のリボンデータ...
  ];
};

const fetchGameData = async () => {
  // サンプルデータ
  return [
    {
      id: 'ruby',
      name: 'ルビー',
      generation: 3,
      release_year: 2002,
      transfer_paths: ['emerald', 'diamond', 'platinum', 'black', 'bank', 'home']
    },
    {
      id: 'sapphire',
      name: 'サファイア',
      generation: 3,
      release_year: 2002,
      transfer_paths: ['emerald', 'diamond', 'platinum', 'black', 'bank', 'home']
    },
    {
      id: 'emerald',
      name: 'エメラルド',
      generation: 3,
      release_year: 2004,
      transfer_paths: ['diamond', 'platinum', 'black', 'bank', 'home']
    },
    {
      id: 'diamond',
      name: 'ダイヤモンド',
      generation: 4,
      release_year: 2006,
      transfer_paths: ['black', 'bank', 'home']
    },
    {
      id: 'platinum',
      name: 'プラチナ',
      generation: 4,
      release_year: 2008,
      transfer_paths: ['black', 'bank', 'home']
    },
    {
      id: 'sword',
      name: 'ソード',
      generation: 8,
      release_year: 2019,
      transfer_paths: ['home']
    },
    // 他のゲームデータ...
  ];
};
</script>
