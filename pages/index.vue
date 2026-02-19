<template>
  <div class="container mx-auto px-2 md:px-4 py-3 md:py-8">
    <h1 class="text-xl md:text-3xl font-bold mb-3 md:mb-6 text-center">
      ポケモンリボン制覇支援ツール
    </h1>

    <!-- データ読み込み中 -->
    <div v-if="isLoading" class="py-16 text-center">
      <div class="inline-block animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      <p class="mt-2 text-gray-500">リボンデータを読み込み中...</p>
    </div>

    <!-- エラー -->
    <div v-else-if="error" class="py-8 text-center bg-red-50 rounded-lg">
      <p class="text-red-600">データの読み込みに失敗しました: {{ error }}</p>
      <button
        class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
        @click="loadData"
      >
        再試行
      </button>
    </div>

    <!-- メインコンテンツ -->
    <div v-else class="lg:flex lg:gap-6">
      <!-- 左カラム: 検索 + ポケモン情報 + マイポケモン -->
      <div class="lg:w-80 xl:w-96 lg:flex-shrink-0 lg:sticky lg:top-4 lg:self-start">
        <!-- ポケモン検索 -->
        <div class="mb-4">
          <PokemonSearch
            :all-pokemon="store.pokemonList"
            :selected-pokemon="store.selectedPokemon"
            @select-pokemon="store.selectPokemon"
          />
        </div>

        <!-- オンボーディング（ポケモン未選択 & マイポケモン未登録時） -->
        <div
          v-if="!store.selectedPokemon && store.myPokemonList.length === 0"
          class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
        >
          <p class="text-sm text-blue-800 font-medium mb-2">ポケモンのリボンコンプリートを効率よく管理・計画しよう</p>
          <ol class="text-xs text-blue-700 space-y-1">
            <li>① ポケモンを検索して選択</li>
            <li>② マイポケモンに登録</li>
            <li>③ リボンをチェックして進捗管理</li>
          </ol>
        </div>

        <!-- 選択されたポケモン情報 -->
        <div v-if="store.selectedPokemon" class="mb-4">
          <PokemonDetails :pokemon="store.selectedPokemon" />
        </div>

        <!-- マイポケモンパネル -->
        <MyPokemonPanel />
      </div>

      <!-- 右カラム: リボン管理タブ -->
      <div class="lg:flex-1 mt-4 lg:mt-0">
        <!-- タブ -->
        <div class="mb-4">
          <div class="flex border-b overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['px-3 py-1.5 mr-1 text-sm md:px-4 md:py-2 md:mr-2 md:text-base whitespace-nowrap', activeTab === tab.id ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700']"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="mt-2 md:mt-4">
            <RibbonManager v-if="activeTab === 'ribbon-manager'" />
            <TransferGuide v-if="activeTab === 'transfer'" />
          </div>
        </div>
      </div>
    </div>

    <!-- お役立ち情報 -->
    <HelpfulResources />

    <!-- トースト通知 -->
    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { usePokemonData } from '~/utils/dataFetcher';

const store = useRibbonProgressStore();
const { isLoading, error, loadAll } = usePokemonData();

const activeTab = ref('ribbon-manager');

const tabs = [
  { id: 'ribbon-manager', label: 'リボン管理' },
  { id: 'transfer', label: '転送ガイド' },
] as const;

const loadData = async () => {
  try {
    const { pokemonData, ribbonData, gameData } = await loadAll();
    store.setPokemonList(pokemonData);
    store.setRibbons(ribbonData);
    store.setGames(gameData);
    store.loadMyPokemonList();
    console.log(`✅ ${pokemonData.length}匹 / ${ribbonData.length}リボン / ${gameData.length}ゲーム`);
  } catch {
    // error は usePokemonData 内で管理される
  }
};

onMounted(loadData);
</script>
