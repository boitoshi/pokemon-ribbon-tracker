<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-center">ポケモンリボン制覇支援ツール</h1>

    <!-- ポケモン検索セクション -->
    <div class="mb-8">
      <div v-if="isLoading" class="py-16 text-center">
        <div class="inline-block animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <p class="mt-2 text-gray-500">リボンデータを読み込み中...</p>
      </div>
      <div v-else-if="error" class="py-8 text-center bg-red-50 rounded-lg">
        <p class="text-red-600">データの読み込みに失敗しました: {{ error }}</p>
        <button
          class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          @click="loadData"
        >
          再試行
        </button>
      </div>
      <PokemonSearch
        v-else
        :all-pokemon="store.pokemonList"
        :selected-pokemon="store.selectedPokemon"
        @select-pokemon="store.selectPokemon"
      />
    </div>

    <!-- 選択されたポケモン情報 -->
    <div v-if="store.selectedPokemon" class="mb-8">
      <PokemonDetails :pokemon="store.selectedPokemon" />
    </div>

    <!-- メインタブ -->
    <div class="mb-8">
      <div class="flex border-b flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['px-4 py-2 mr-2', activeTab === tab.id ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700']"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- タブコンテンツ -->
      <div class="mt-4">
        <div v-if="activeTab === 'ribbons'">
          <RibbonFilter @filter-change="applyFilters" />
          <RibbonsList
            :pokemon="store.selectedPokemon"
            :ribbons="filteredRibbons"
            @select-ribbon="selectRibbon"
          />
        </div>

        <RibbonChart
          v-if="activeTab === 'chart'"
          :pokemon="store.selectedPokemon"
          :ribbons="store.ribbons"
          :games="store.games"
        />

        <RibbonMasterChart
          v-if="activeTab === 'master'"
          :pokemon="store.selectedPokemon"
          :ribbons="store.ribbons"
        />

        <div v-if="activeTab === 'guide'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-1">
            <h3 class="text-lg font-bold mb-3">リボンリスト</h3>
            <div class="border rounded overflow-y-auto max-h-96">
              <div
                v-for="ribbon in store.ribbons"
                :key="ribbon.id"
                :class="['p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0',
                         selectedRibbon?.id === ribbon.id ? 'bg-blue-50' : '']"
                @click="selectRibbon(ribbon)"
              >
                <div class="font-medium">{{ ribbon.name }}</div>
                <div class="text-xs text-gray-600">第{{ ribbon.generation }}世代</div>
              </div>
            </div>
          </div>
          <div class="md:col-span-2">
            <RibbonGuide :selected-ribbon="selectedRibbon" />
          </div>
        </div>

        <TransferGuide v-if="activeTab === 'transfer'" />
      </div>
    </div>

    <!-- お役立ち情報セクション -->
    <HelpfulResources />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { usePokemonData } from '~/utils/dataFetcher';
import type { Ribbon } from '~/types';

const store = useRibbonProgressStore();
const { isLoading, error, loadAll } = usePokemonData();

const activeTab = ref('ribbons');
const selectedRibbon = ref<Ribbon | null>(null);
const filters = ref({
  generation: null as number | null,
  type: null as string | null,
  status: null as string | null,
  search: '',
});

const tabs = [
  { id: 'ribbons', label: 'リボン一覧' },
  { id: 'chart', label: 'リボン取得チャート' },
  { id: 'master', label: 'リボン王チャート' },
  { id: 'guide', label: '獲得ガイド' },
  { id: 'transfer', label: '転送方法' },
] as const;

const selectRibbon = (ribbon: Ribbon) => {
  selectedRibbon.value = ribbon;
  if (activeTab.value !== 'guide') {
    activeTab.value = 'guide';
  }
};

const applyFilters = (newFilters: typeof filters.value) => {
  filters.value = { ...newFilters };
};

const filteredRibbons = computed(() => {
  let result = store.ribbons;

  if (filters.value.generation) {
    result = result.filter((r) => r.generation === filters.value.generation);
  }

  if (filters.value.type) {
    result = result.filter((r) => {
      const t = filters.value.type;
      if (t === 'champion') return r.id.includes('champion');
      if (t === 'contest') return r.id.includes('contest');
      if (t === 'battle') return r.id.includes('tower');
      if (t === 'memory') return r.id.includes('memory');
      if (t === 'event') return r.id.includes('event');
      return false;
    });
  }

  if (filters.value.search) {
    const q = filters.value.search.toLowerCase();
    result = result.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }

  return result;
});

const loadData = async () => {
  try {
    const { pokemonData, ribbonData, gameData } = await loadAll();
    store.setPokemonList(pokemonData);
    store.setRibbons(ribbonData);
    store.setGames(gameData);
    console.log(`✅ ${pokemonData.length}匹 / ${ribbonData.length}リボン / ${gameData.length}ゲーム`);
  } catch {
    // error は usePokemonData 内で管理される
  }
};

onMounted(loadData);
</script>
