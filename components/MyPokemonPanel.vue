<template>
  <div class="bg-white rounded-lg shadow p-2 md:p-4">
    <div class="flex items-center justify-between mb-2 md:mb-3">
      <h2 class="text-base md:text-lg font-bold">マイポケモン</h2>
      <button
        class="text-xs px-2 py-1 rounded"
        :class="isListExpanded ? 'bg-gray-200' : 'bg-blue-100 text-blue-700'"
        @click="isListExpanded = !isListExpanded"
      >
        {{ isListExpanded ? '閉じる' : `一覧 (${store.myPokemonList.length})` }}
      </button>
    </div>

    <!-- 登録ボタン（ポケモン選択済みかつマイポケモン未アクティブ時） -->
    <div v-if="store.selectedPokemon && !store.activeMyPokemonId && !showRegisterForm" class="mb-2">
      <button
        class="w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
        @click="openRegisterForm"
      >
        {{ store.selectedPokemon.name }} をマイポケモンに登録
      </button>
    </div>

    <!-- 登録フォーム -->
    <div v-if="showRegisterForm" class="mb-3 p-3 bg-gray-50 rounded-lg border">
      <h3 class="text-sm font-bold mb-2">マイポケモン登録</h3>
      <div class="space-y-2">
        <div>
          <label class="block text-xs text-gray-600 mb-0.5">ニックネーム</label>
          <input
            v-model="formNickname"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
            :placeholder="store.selectedPokemon?.name ?? ''"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-0.5">出身ゲーム</label>
          <select v-model="formOriginGame" class="w-full px-2 py-1 border rounded text-sm">
            <option value="">未設定</option>
            <option v-for="game in store.games" :key="game.id" :value="game.id">
              {{ game.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-0.5">メモ</label>
          <input
            v-model="formMemo"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
            placeholder="自由にメモ"
          />
        </div>
        <div class="flex gap-2">
          <button
            class="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
            @click="registerPokemon"
          >
            登録
          </button>
          <button
            class="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300 transition"
            @click="closeRegisterForm"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>

    <!-- 編集フォーム -->
    <div v-if="editingMyPokemonId" class="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
      <h3 class="text-sm font-bold mb-2">マイポケモン編集</h3>
      <div class="space-y-2">
        <div>
          <label class="block text-xs text-gray-600 mb-0.5">ニックネーム</label>
          <input
            v-model="editNickname"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-0.5">出身ゲーム</label>
          <select v-model="editOriginGame" class="w-full px-2 py-1 border rounded text-sm">
            <option value="">未設定</option>
            <option v-for="game in store.games" :key="game.id" :value="game.id">
              {{ game.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-0.5">メモ</label>
          <input
            v-model="editMemo"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
          />
        </div>
        <div class="flex gap-2">
          <button
            class="flex-1 px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition"
            @click="saveEdit"
          >
            保存
          </button>
          <button
            class="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300 transition"
            @click="cancelEdit"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>

    <!-- マイポケモン一覧 -->
    <div v-if="isListExpanded && store.myPokemonList.length > 0" class="space-y-1">
      <div
        v-for="myPoke in myPokemonWithDetails"
        :key="myPoke.id"
        :class="[
          'flex items-center p-2 rounded cursor-pointer transition',
          store.activeMyPokemonId === myPoke.id
            ? 'bg-blue-100 border border-blue-300'
            : 'hover:bg-gray-50 border border-transparent',
        ]"
        @click="store.selectMyPokemon(myPoke.id)"
      >
        <div class="w-8 h-8 mr-2 flex-shrink-0">
          <img
            v-if="myPoke.imageUrl"
            :src="myPoke.imageUrl"
            :alt="myPoke.displayName"
            class="w-full h-full object-contain"
          />
          <div v-else class="w-full h-full bg-gray-200 rounded-full"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm truncate">{{ myPoke.displayName }}</div>
          <div class="text-xs text-gray-500 truncate">
            {{ myPoke.speciesName }}
            <span v-if="myPoke.originGameName"> / {{ myPoke.originGameName }}</span>
          </div>
        </div>
        <div class="flex gap-1 ml-1 flex-shrink-0">
          <button
            class="p-1 text-gray-400 hover:text-blue-500 transition"
            title="編集"
            @click.stop="startEdit(myPoke.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            class="p-1 text-gray-400 hover:text-red-500 transition"
            title="削除"
            @click.stop="confirmRemove(myPoke.id, myPoke.displayName)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="isListExpanded && store.myPokemonList.length === 0" class="text-center py-3">
      <p class="text-sm text-gray-500">まだマイポケモンが登録されていません</p>
      <p class="text-xs text-gray-400 mt-1">ポケモンを検索して登録してみましょう</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { getGameName } from '~/utils/gameNames';

const store = useRibbonProgressStore();

/** 一覧の展開状態 */
const isListExpanded = ref(false);

/** 登録フォームの表示状態 */
const showRegisterForm = ref(false);

/** 登録フォームの入力値 */
const formNickname = ref('');
const formOriginGame = ref('');
const formMemo = ref('');

/** 編集中のマイポケモンID */
const editingMyPokemonId = ref<string | null>(null);
const editNickname = ref('');
const editOriginGame = ref('');
const editMemo = ref('');

/** マイポケモン一覧に種族情報を付与したビュー */
interface MyPokemonView {
  id: string;
  displayName: string;
  speciesName: string;
  imageUrl: string | undefined;
  originGameName: string;
}

const myPokemonWithDetails = computed((): MyPokemonView[] => {
  return store.myPokemonList.map((mp) => {
    const detail = store.pokemonList.find((p) => p.id === mp.pokemonId);
    return {
      id: mp.id,
      displayName: mp.nickname || detail?.name || mp.pokemonId,
      speciesName: detail?.name || mp.pokemonId,
      imageUrl: detail?.image,
      originGameName: mp.originGame ? getGameName(mp.originGame) : '',
    };
  });
});

/** 登録フォームを開く */
const openRegisterForm = (): void => {
  formNickname.value = '';
  formOriginGame.value = '';
  formMemo.value = '';
  showRegisterForm.value = true;
};

/** 登録フォームを閉じる */
const closeRegisterForm = (): void => {
  showRegisterForm.value = false;
};

/** ポケモンを登録して即座にアクティブにする */
const registerPokemon = (): void => {
  if (!store.selectedPokemon) return;
  const myPokemon = store.registerMyPokemon(
    store.selectedPokemon.id,
    formNickname.value,
    formOriginGame.value,
    formMemo.value
  );
  store.selectMyPokemon(myPokemon.id);
  showRegisterForm.value = false;
  isListExpanded.value = true;
};

/** 編集フォームを開く */
const startEdit = (myPokemonId: string): void => {
  const mp = store.myPokemonList.find((p) => p.id === myPokemonId);
  if (!mp) return;
  editingMyPokemonId.value = myPokemonId;
  editNickname.value = mp.nickname;
  editOriginGame.value = mp.originGame;
  editMemo.value = mp.memo;
};

/** 編集を保存 */
const saveEdit = (): void => {
  if (!editingMyPokemonId.value) return;
  store.updateMyPokemon(editingMyPokemonId.value, {
    nickname: editNickname.value,
    originGame: editOriginGame.value,
    memo: editMemo.value,
  });
  editingMyPokemonId.value = null;
};

/** 編集をキャンセル */
const cancelEdit = (): void => {
  editingMyPokemonId.value = null;
};

/** 削除確認 */
const confirmRemove = (myPokemonId: string, displayName: string): void => {
  const ok = confirm(`「${displayName}」を削除しますか？進捗データも削除されます。`);
  if (ok) {
    store.removeMyPokemon(myPokemonId);
  }
};
</script>
