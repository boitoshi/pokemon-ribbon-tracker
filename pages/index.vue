<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-center">ポケモンリボン制覇支援ツール</h1>
    
    <!-- ポケモン検索セクション -->
    <div class="mb-8">
      <div v-if="isLoading" class="py-16 text-center">
        <div class="inline-block animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <p class="mt-2 text-gray-500">リボンデータを読み込み中...</p>
      </div>
      <PokemonSearch 
        v-else 
        :allPokemon="pokemonList"
        :selectedPokemon="selectedPokemon"
        @select-pokemon="selectPokemon" />
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
import { usePokemonData } from '~/utils/dataFetcher';

// データフェッチャーを初期化
const { 
  pokemonList, 
  ribbonList, 
  gameList, 
  isLoading,
  error,
  fetchPokemonList, 
  fetchRibbonList, 
  fetchGameList
} = usePokemonData();

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
  try {
    // GitHub リポジトリから各種データを非同期に取得
    const [pokemonData, ribbonData, gameData] = await Promise.all([
      fetchPokemonList(),
      fetchRibbonList(),
      fetchGameList()
    ]);

    // 取得したデータを状態にセット
    ribbons.value = ribbonData;
    games.value = gameData;

    console.log('✅ データの読み込みが完了しました');
    console.log(`📊 ${pokemonData.length}匹のポケモンデータ`);
    console.log(`🎀 ${ribbonData.length}個のリボンデータ`);
    console.log(`🎮 ${gameData.length}個のゲームデータ`);
  } catch (err) {
    console.error('❌ データの読み込みエラー:', err);
    // エラー表示などの処理
  }
});
</script>
