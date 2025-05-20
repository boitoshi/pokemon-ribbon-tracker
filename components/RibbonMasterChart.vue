<template>
  <div>
    <h2 class="text-xl font-bold mb-4">リボン王チャート</h2>
    
    <div v-if="!pokemon" class="bg-yellow-100 border-yellow-400 border p-4 rounded">
      ポケモンを選択すると、獲得可能なすべてのリボンのチェックリストが表示されます。
    </div>
    
    <div v-else>
      <div class="mb-4 p-4 bg-green-50 rounded flex justify-between items-center">
        <div>
          <p><strong>{{ pokemon.name }}</strong> のリボン王チャート</p>
          <p class="text-sm mt-1">獲得したリボン: {{ checkedRibbons.length }} / {{ allRibbonsForPokemon.length }}</p>
        </div>
        <button 
          @click="clearProgress" 
          class="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
          進捗をリセット
        </button>
      </div>
      
      <!-- 世代ごとのリボンチェックリスト -->
      <div class="space-y-6">
        <div v-for="gen in generations" :key="gen" class="border rounded-lg overflow-hidden">
          <div class="bg-gray-100 p-3 font-bold">第{{ gen }}世代リボン</div>
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="ribbon in getRibbonsByGeneration(gen)" 
                :key="ribbon.id"
                class="flex items-center p-2 hover:bg-gray-50 rounded">
                <input 
                  type="checkbox" 
                  :id="ribbon.id" 
                  :value="ribbon.id" 
                  v-model="checkedRibbons"
                  class="w-5 h-5 mr-3">
                <label :for="ribbon.id" class="flex-1">
                  <div class="font-medium">{{ ribbon.name }}</div>
                  <div class="text-xs text-gray-600">{{ ribbon.requirements }}</div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 進捗まとめ -->
      <div class="mt-6 bg-blue-50 p-4 rounded">
        <h3 class="font-bold mb-2">進捗サマリー</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="gen in generations" :key="`summary-${gen}`" class="text-center p-2 bg-white rounded shadow-sm">
            <div class="text-sm font-medium mb-1">第{{ gen }}世代</div>
            <div class="text-lg font-bold">
              {{ getCompletionByGeneration(gen) }}%
            </div>
          </div>
          <div class="text-center p-2 bg-blue-100 rounded shadow-sm">
            <div class="text-sm font-medium mb-1">総合進捗</div>
            <div class="text-lg font-bold">
              {{ totalCompletion }}%
            </div>
          </div>
        </div>
      </div>
      
      <!-- 認定証セクション -->
      <div v-if="totalCompletion === 100" class="mt-6 border-2 border-yellow-400 p-4 rounded-lg bg-yellow-50">
        <h3 class="text-center text-xl font-bold text-yellow-800 mb-3">🏆 リボン制覇達成！ 🏆</h3>
        <p class="text-center mb-4">おめでとうございます！{{ pokemon.name }}はすべてのリボンを集めました！</p>
        <button 
          @click="generateCertificate" 
          class="block mx-auto px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
          認定証を生成する
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  pokemon: {
    type: Object,
    default: null
  },
  ribbons: {
    type: Array,
    required: true
  }
});

// ローカルストレージからチェック済みリボンを読み込む
const loadCheckedRibbons = () => {
  if (!props.pokemon) return [];
  
  try {
    const savedRibbons = localStorage.getItem(`ribbons_${props.pokemon.id}`);
    return savedRibbons ? JSON.parse(savedRibbons) : [];
  } catch (e) {
    console.error('Failed to load saved ribbons', e);
    return [];
  }
};

const checkedRibbons = ref(loadCheckedRibbons());

// ポケモンが変わったらチェック済みリボンをリロード
watch(() => props.pokemon, () => {
  checkedRibbons.value = loadCheckedRibbons();
}, { immediate: true });

// チェック済みリボンが変わったらローカルストレージに保存
watch(checkedRibbons, (newValue) => {
  if (!props.pokemon) return;
  
  try {
    localStorage.setItem(`ribbons_${props.pokemon.id}`, JSON.stringify(newValue));
  } catch (e) {
    console.error('Failed to save ribbons', e);
  }
}, { deep: true });

// 進捗のリセット
const clearProgress = () => {
  checkedRibbons.value = [];
};

// 利用可能な世代のリスト
const generations = computed(() => {
  const gens = new Set(props.ribbons.map(r => r.generation));
  return [...gens].sort();
});

// 選択されたポケモンが獲得可能なすべてのリボン
const allRibbonsForPokemon = computed(() => {
  if (!props.pokemon) return [];
  
  // 実際のアプリではより複雑なロジックになる
  // ここではサンプルとして全リボンを返す
  return props.ribbons;
});

// 世代ごとのリボンを取得
const getRibbonsByGeneration = (generation) => {
  return allRibbonsForPokemon.value.filter(ribbon => ribbon.generation === generation);
};

// 世代ごとの完了率を計算
const getCompletionByGeneration = (generation) => {
  const genRibbons = getRibbonsByGeneration(generation);
  if (genRibbons.length === 0) return 0;
  
  const checkedGenRibbons = genRibbons.filter(ribbon => 
    checkedRibbons.value.includes(ribbon.id)
  );
  
  return Math.round((checkedGenRibbons.length / genRibbons.length) * 100);
};

// 総合完了率
const totalCompletion = computed(() => {
  if (allRibbonsForPokemon.value.length === 0) return 0;
  
  return Math.round((checkedRibbons.value.length / allRibbonsForPokemon.value.length) * 100);
});

// 認定証の生成
const generateCertificate = () => {
  // ここで認定証を生成するロジックを実装
  // 例: モーダル表示やPDF生成など
  alert(`${props.pokemon.name}のリボン王認定証が生成されました！`);
  
  // 実際のアプリでは認定証コンポーネントを表示する
  // certificateVisible.value = true;
};
</script>
