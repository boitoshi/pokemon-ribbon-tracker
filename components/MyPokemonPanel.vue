<template>
  <div class="bg-white border rounded-lg shadow-sm mb-4 md:mb-8">
    <!-- ヘッダー（クリックで開閉） -->
    <button
      class="w-full flex justify-between items-center p-3 md:p-4 hover:bg-gray-50"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-2">
        <h3 class="font-bold text-sm md:text-base">マイポケモン</h3>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {{ store.myPokemonList.length }}
        </span>
      </div>
      <span class="text-gray-400 text-sm">{{ isOpen ? '▲' : '▼' }}</span>
    </button>

    <!-- パネル本体 -->
    <div v-if="isOpen" class="px-3 pb-3 md:px-4 md:pb-4">
      <!-- マイポケモン未登録 & ポケモン未選択 -->
      <div
        v-if="store.myPokemonList.length === 0 && !store.selectedPokemon"
        class="text-center py-4 text-gray-500 text-sm"
      >
        ポケモンを検索・選択して「マイポケモンに登録」してね
      </div>

      <!-- マイポケモン一覧 -->
      <div
        v-if="store.myPokemonList.length > 0"
        class="flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-3"
      >
        <div
          v-for="mp in store.myPokemonList"
          :key="mp.id"
          class="flex-shrink-0 w-36 md:w-auto border rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors"
          :class="{ 'ring-2 ring-blue-500 bg-blue-50': store.activeMyPokemonId === mp.id }"
          @click="store.switchMyPokemon(mp.id)"
        >
          <div class="flex items-center gap-2">
            <img
              v-if="getPokemonImage(mp.pokemonId)"
              :src="getPokemonImage(mp.pokemonId)"
              :alt="getDisplayName(mp)"
              class="w-10 h-10 object-contain"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm truncate">{{ getDisplayName(mp) }}</div>
              <div class="text-xs text-gray-500 truncate">{{ getGameDisplayName(mp.originGame) }}</div>
              <div class="text-xs text-blue-600">{{ getProgress(mp.id) }}%</div>
            </div>
          </div>
          <!-- 編集・削除ボタン -->
          <div class="flex gap-1 mt-1">
            <button
              class="text-xs text-gray-400 hover:text-blue-500 px-1"
              @click.stop="startEdit(mp)"
            >
              編集
            </button>
            <button
              class="text-xs text-gray-400 hover:text-red-500 px-1"
              @click.stop="confirmRemove(mp.id)"
            >
              削除
            </button>
          </div>
        </div>
      </div>

      <!-- 登録ボタン（ポケモン選択中のみ表示） -->
      <div v-if="store.selectedPokemon && !showForm" class="mt-3">
        <button
          class="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          @click="openRegisterForm"
        >
          {{ store.selectedPokemon.name }} をマイポケモンに登録
        </button>
      </div>

      <!-- 登録/編集フォーム -->
      <div v-if="showForm" class="mt-3 border rounded-lg p-3 bg-gray-50">
        <h4 class="font-medium text-sm mb-2">
          {{ editingId ? 'マイポケモンを編集' : 'マイポケモンに登録' }}
        </h4>
        <div class="space-y-2">
          <div>
            <label class="block text-xs text-gray-600 mb-0.5">ニックネーム（任意）</label>
            <input
              v-model="form.nickname"
              type="text"
              placeholder="ニックネーム"
              class="w-full px-2 py-1.5 border rounded text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-0.5">出身ゲーム</label>
            <select v-model="form.originGame" class="w-full px-2 py-1.5 border rounded text-sm bg-white">
              <option value="">選択してください</option>
              <option v-for="game in store.games" :key="game.id" :value="game.id">
                {{ game.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-0.5">メモ（任意）</label>
            <textarea
              v-model="form.memo"
              placeholder="メモ"
              rows="2"
              class="w-full px-2 py-1.5 border rounded text-sm"
            ></textarea>
          </div>
          <div class="flex gap-2">
            <button
              class="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              @click="submitForm"
            >
              {{ editingId ? '更新' : '登録' }}
            </button>
            <button
              class="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300"
              @click="cancelForm"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { getGameName } from '~/utils/gameNames';
import type { MyPokemon } from '~/types';

const store = useRibbonProgressStore();

/** パネルの開閉状態（デスクトップはデフォルト開き） */
const isOpen = ref(true);
const showForm = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  nickname: '',
  originGame: '',
  memo: '',
});

/** ポケモンの画像URLを取得 */
const getPokemonImage = (pokemonId: string): string | undefined => {
  const detail = store.pokemonList.find((p) => p.id === pokemonId);
  return detail?.image;
};

/** 表示名（ニックネーム優先、なければポケモン名） */
const getDisplayName = (mp: MyPokemon): string => {
  if (mp.nickname) return mp.nickname;
  const detail = store.pokemonList.find((p) => p.id === mp.pokemonId);
  return detail?.name ?? mp.pokemonId;
};

/** ゲーム表示名 */
const getGameDisplayName = (gameId: string): string => {
  if (!gameId) return '未設定';
  return getGameName(gameId);
};

/** マイポケモンの進捗率を取得 */
const getProgress = (myPokemonId: string): number => {
  if (store.ribbons.length === 0) return 0;
  const checked = store.progress[myPokemonId]?.length ?? 0;
  return Math.round((checked / store.ribbons.length) * 100);
};

/** 登録フォームを開く */
const openRegisterForm = (): void => {
  editingId.value = null;
  form.nickname = '';
  form.originGame = '';
  form.memo = '';
  showForm.value = true;
};

/** 編集フォームを開く */
const startEdit = (mp: MyPokemon): void => {
  editingId.value = mp.id;
  form.nickname = mp.nickname;
  form.originGame = mp.originGame;
  form.memo = mp.memo;
  showForm.value = true;
};

/** フォーム送信 */
const submitForm = (): void => {
  if (editingId.value) {
    // 編集
    store.updateMyPokemon(editingId.value, {
      nickname: form.nickname,
      originGame: form.originGame,
      memo: form.memo,
    });
  } else if (store.selectedPokemon) {
    // 新規登録
    const mp = store.addMyPokemon({
      pokemonId: store.selectedPokemon.id,
      nickname: form.nickname,
      originGame: form.originGame,
      memo: form.memo,
    });
    // 登録後すぐにアクティブにする
    store.switchMyPokemon(mp.id);
  }
  cancelForm();
};

/** フォームをキャンセル */
const cancelForm = (): void => {
  showForm.value = false;
  editingId.value = null;
};

/** マイポケモンを削除（確認付き） */
const confirmRemove = (id: string): void => {
  if (confirm('このマイポケモンを削除しますか？関連する進捗データも削除されます。')) {
    store.removeMyPokemon(id);
  }
};
</script>
