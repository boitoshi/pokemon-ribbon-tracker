import { defineComponent, ref, computed, mergeProps, useSSRContext, reactive, unref } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr, ssrRenderComponent } from "vue/server-renderer";
import { defineStore } from "pinia";
import { _ as _export_sfc } from "../server.mjs";
import "ofetch";
import "#internal/nuxt/paths";
import "/Users/akabros/Documents/code/pokemon-ribbon-tracker/node_modules/hookable/dist/index.mjs";
import "/Users/akabros/Documents/code/pokemon-ribbon-tracker/node_modules/unctx/dist/index.mjs";
import "/Users/akabros/Documents/code/pokemon-ribbon-tracker/node_modules/h3/dist/index.mjs";
import "/Users/akabros/Documents/code/pokemon-ribbon-tracker/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/akabros/Documents/code/pokemon-ribbon-tracker/node_modules/radix3/dist/index.mjs";
import "/Users/akabros/Documents/code/pokemon-ribbon-tracker/node_modules/ufo/dist/index.mjs";
import "/Users/akabros/Documents/code/pokemon-ribbon-tracker/node_modules/klona/dist/index.mjs";
const toPokemon = (detail) => ({
  id: detail.id,
  number: String(detail.dexNumber).padStart(3, "0"),
  name: detail.name,
  imageUrl: detail.image,
  types: detail.types
});
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "PokemonSearch",
  __ssrInlineRender: true,
  props: {
    allPokemon: {},
    selectedPokemon: {}
  },
  emits: ["select-pokemon"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const searchQuery = ref("");
    const results = computed(() => {
      const query = searchQuery.value.trim();
      if (!query) return [];
      return props.allPokemon.filter((p) => p.name.includes(query)).map(toPokemon);
    });
    const isLoading2 = computed(() => false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "pokemon-search p-4 bg-white rounded-lg shadow" }, _attrs))}><div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2"> ポケモンを検索してね～💖 </label><div class="relative"><input${ssrRenderAttr("value", searchQuery.value)} type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="ピカチュウ、ヒトカゲなど...">`);
      if (isLoading2.value) {
        _push(`<div class="absolute right-3 top-2.5"><span class="animate-spin">🔄</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (results.value.length > 0) {
        _push(`<div class="mt-2 max-h-80 overflow-y-auto"><!--[-->`);
        ssrRenderList(results.value, (pokemon) => {
          _push(`<div class="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"><div class="w-10 h-10 mr-3">`);
          if (pokemon.imageUrl) {
            _push(`<img${ssrRenderAttr("src", pokemon.imageUrl)}${ssrRenderAttr("alt", pokemon.name)} class="w-full h-full object-contain">`);
          } else {
            _push(`<div class="w-full h-full bg-gray-200 rounded-full"></div>`);
          }
          _push(`</div><div><div class="font-medium">${ssrInterpolate(pokemon.name)}</div><div class="text-xs text-gray-500">${ssrInterpolate(pokemon.number)}</div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (searchQuery.value && !isLoading2.value) {
        _push(`<div class="text-center py-4"><p class="text-gray-500">ポケモンが見つからないよ～😢</p><p class="text-sm text-gray-400">別の名前で検索してみてね！</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PokemonSearch.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "PokemonDetails",
  __ssrInlineRender: true,
  props: {
    pokemon: {}
  },
  setup(__props) {
    const props = __props;
    const ribbonPercentage = computed(() => {
      if (!props.pokemon) return 0;
      const obtainedCount = props.pokemon.ribbons.filter((r) => r.obtained).length;
      return Math.round(obtainedCount / props.pokemon.ribbons.length * 100);
    });
    const getTypeClass = (type) => {
      const typeClasses = {
        ノーマル: "bg-gray-400",
        ほのお: "bg-red-500",
        みず: "bg-blue-500",
        でんき: "bg-yellow-400",
        くさ: "bg-green-500",
        こおり: "bg-blue-300",
        かくとう: "bg-red-700",
        どく: "bg-purple-500",
        じめん: "bg-yellow-700",
        ひこう: "bg-blue-400",
        エスパー: "bg-pink-400",
        むし: "bg-lime-500",
        いわ: "bg-yellow-600",
        ゴースト: "bg-purple-700",
        ドラゴン: "bg-indigo-600",
        あく: "bg-gray-700",
        はがね: "bg-gray-500",
        フェアリー: "bg-pink-300"
      };
      return typeClasses[type] || "bg-gray-400";
    };
    return (_ctx, _push, _parent, _attrs) => {
      if (_ctx.pokemon) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "pokemon-details bg-white p-4 rounded-lg shadow" }, _attrs))}><div class="flex items-center mb-4"><div class="mr-4"><img${ssrRenderAttr("src", _ctx.pokemon.imageUrl)}${ssrRenderAttr("alt", _ctx.pokemon.name)} class="w-24 h-24 object-contain"></div><div><h2 class="text-xl font-bold">${ssrInterpolate(_ctx.pokemon.name)}</h2><p class="text-gray-600">#${ssrInterpolate(_ctx.pokemon.number)}</p><div class="flex mt-1 gap-2"><!--[-->`);
        ssrRenderList(_ctx.pokemon.types, (type) => {
          _push(`<span class="${ssrRenderClass([getTypeClass(type), "px-2 py-1 text-xs rounded text-white"])}">${ssrInterpolate(type)}</span>`);
        });
        _push(`<!--]--></div></div></div><div class="mt-4"><h3 class="font-bold text-lg mb-2">リボン取得状況</h3><div class="grid grid-cols-2 md:grid-cols-3 gap-2"><!--[-->`);
        ssrRenderList(_ctx.pokemon.ribbons, (ribbon) => {
          _push(`<div class="${ssrRenderClass([{ "bg-green-50 border-green-200": ribbon.obtained }, "p-2 border rounded flex items-center"])}"><div class="w-6 h-6 mr-2 flex-shrink-0">`);
          if (ribbon.obtained) {
            _push(`<span class="text-green-500">✓</span>`);
          } else {
            _push(`<span class="text-gray-300">○</span>`);
          }
          _push(`</div><span class="text-sm">${ssrInterpolate(ribbon.name)}</span></div>`);
        });
        _push(`<!--]--></div></div><div class="mt-4 bg-gray-50 p-3 rounded-lg"><div class="flex justify-between items-center"><span class="font-medium">リボン獲得率</span><span class="font-bold">${ssrInterpolate(ribbonPercentage.value)}%</span></div><div class="w-full bg-gray-200 rounded-full h-2 mt-1"><div class="bg-blue-500 h-2 rounded-full" style="${ssrRenderStyle(`width: ${ribbonPercentage.value}%`)}"></div></div></div></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-8 text-center bg-gray-50 rounded-lg" }, _attrs))}><p class="text-gray-500">ポケモンを選択してください😊</p></div>`);
      }
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PokemonDetails.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "RibbonFilter",
  __ssrInlineRender: true,
  emits: ["filter-change"],
  setup(__props, { emit: __emit }) {
    const activeFilters = reactive({
      generation: null,
      type: null,
      status: null
    });
    const searchQuery = ref("");
    const ribbonTypes = [
      { id: "champion", name: "チャンピオン" },
      { id: "contest", name: "コンテスト" },
      { id: "battle", name: "バトル施設" },
      { id: "memory", name: "思い出" },
      { id: "event", name: "イベント" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mb-4 p-4 bg-gray-50 rounded-lg" }, _attrs))}><h3 class="font-bold mb-2">リボンフィルター</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">世代</label><div class="flex flex-wrap gap-2"><button class="${ssrRenderClass([
        "px-2 py-1 text-xs rounded",
        !activeFilters.generation ? "bg-blue-500 text-white" : "bg-gray-200"
      ])}"> すべて </button><!--[-->`);
      ssrRenderList([3, 4, 5, 6, 7, 8], (gen) => {
        _push(`<button class="${ssrRenderClass([
          "px-2 py-1 text-xs rounded",
          activeFilters.generation === gen ? "bg-blue-500 text-white" : "bg-gray-200"
        ])}"> 第${ssrInterpolate(gen)}世代 </button>`);
      });
      _push(`<!--]--></div></div><div><label class="block text-sm font-medium text-gray-700 mb-1">リボンタイプ</label><div class="flex flex-wrap gap-2"><button class="${ssrRenderClass([
        "px-2 py-1 text-xs rounded",
        !activeFilters.type ? "bg-blue-500 text-white" : "bg-gray-200"
      ])}"> すべて </button><!--[-->`);
      ssrRenderList(ribbonTypes, (type) => {
        _push(`<button class="${ssrRenderClass([
          "px-2 py-1 text-xs rounded",
          activeFilters.type === type.id ? "bg-blue-500 text-white" : "bg-gray-200"
        ])}">${ssrInterpolate(type.name)}</button>`);
      });
      _push(`<!--]--></div></div><div><label class="block text-sm font-medium text-gray-700 mb-1">取得状況</label><div class="flex flex-wrap gap-2"><button class="${ssrRenderClass([
        "px-2 py-1 text-xs rounded",
        !activeFilters.status ? "bg-blue-500 text-white" : "bg-gray-200"
      ])}"> すべて </button><button class="${ssrRenderClass([
        "px-2 py-1 text-xs rounded",
        activeFilters.status === "obtained" ? "bg-blue-500 text-white" : "bg-gray-200"
      ])}"> 取得済み </button><button class="${ssrRenderClass([
        "px-2 py-1 text-xs rounded",
        activeFilters.status === "not-obtained" ? "bg-blue-500 text-white" : "bg-gray-200"
      ])}"> 未取得 </button></div></div></div><div class="mt-3"><label class="block text-sm font-medium text-gray-700 mb-1">リボン名検索</label><input${ssrRenderAttr("value", searchQuery.value)} type="text" placeholder="リボン名を入力..." class="w-full px-3 py-2 border rounded-md"></div><div class="mt-3 text-right"><button class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"> フィルターをリセット </button></div></div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RibbonFilter.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "RibbonsList",
  __ssrInlineRender: true,
  props: {
    ribbons: {},
    pokemon: {}
  },
  emits: ["select-ribbon"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const isPokemonCompatible = (_ribbon) => {
      if (!props.pokemon) return true;
      return true;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="flex justify-between items-center mb-4"><h2 class="text-xl font-bold">リボン一覧</h2><p class="text-gray-600 text-sm">${ssrInterpolate(_ctx.ribbons.length)}個のリボン</p></div>`);
      if (_ctx.ribbons.length === 0) {
        _push(`<div class="bg-gray-50 rounded-lg p-8 text-center"><p class="text-gray-500">条件に一致するリボンがありません😢</p><p class="mt-2 text-sm text-gray-400">フィルターを変更してみてください</p></div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
        ssrRenderList(_ctx.ribbons, (ribbon) => {
          _push(`<div class="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"><div class="flex p-3"><div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">`);
          if (ribbon.image_url) {
            _push(`<img${ssrRenderAttr("src", ribbon.image_url)}${ssrRenderAttr("alt", ribbon.name)} class="w-9 h-9">`);
          } else {
            _push(`<span class="text-2xl">🎀</span>`);
          }
          _push(`</div><div class="flex-1"><h3 class="font-bold text-blue-800">${ssrInterpolate(ribbon.name)}</h3><p class="text-sm text-gray-600 line-clamp-2">${ssrInterpolate(ribbon.description)}</p><div class="mt-1 flex flex-wrap gap-1"><span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"> 第${ssrInterpolate(ribbon.generation)}世代 </span>`);
          if (isPokemonCompatible()) {
            _push(`<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded"> 取得可能 </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RibbonsList.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const STORAGE_PREFIX = "ribbon_progress_";
const useRibbonProgressStore = defineStore("ribbonProgress", {
  state: () => ({
    /** 選択中のポケモン */
    selectedPokemon: null,
    /** 全リボンデータ */
    ribbons: [],
    /** 全ゲームデータ */
    games: [],
    /** 全ポケモン一覧 */
    pokemonList: [],
    /** データ読み込み中フラグ */
    isLoading: false,
    /** エラーメッセージ */
    error: null,
    /** ポケモンIDごとの取得済みリボンIDセット: { [pokemonId]: Set<ribbonId> } */
    progress: {}
  }),
  getters: {
    /** 現在選択中のポケモンの取得済みリボンID一覧 */
    currentCheckedRibbons(state) {
      if (!state.selectedPokemon) return [];
      return state.progress[state.selectedPokemon.id] ?? [];
    },
    /** 現在選択中のポケモンの総合完了率 */
    totalCompletion(state) {
      var _a;
      if (!state.selectedPokemon || state.ribbons.length === 0) return 0;
      const checked = ((_a = state.progress[state.selectedPokemon.id]) == null ? void 0 : _a.length) ?? 0;
      return Math.round(checked / state.ribbons.length * 100);
    }
  },
  actions: {
    /** localStorage からポケモンの進捗を読み込む */
    loadProgress(pokemonId) {
      try {
        const saved = localStorage.getItem(`${STORAGE_PREFIX}${pokemonId}`);
        this.progress[pokemonId] = saved ? JSON.parse(saved) : [];
      } catch {
        this.progress[pokemonId] = [];
      }
    },
    /** リボンの取得済み状態をトグル */
    toggleRibbon(pokemonId, ribbonId) {
      if (!this.progress[pokemonId]) {
        this.progress[pokemonId] = [];
      }
      const idx = this.progress[pokemonId].indexOf(ribbonId);
      if (idx === -1) {
        this.progress[pokemonId].push(ribbonId);
      } else {
        this.progress[pokemonId].splice(idx, 1);
      }
      this.saveProgress(pokemonId);
    },
    /** リボン一覧を v-model の配列でまとめて更新 */
    setCheckedRibbons(pokemonId, ribbonIds) {
      this.progress[pokemonId] = [...ribbonIds];
      this.saveProgress(pokemonId);
    },
    /** 進捗をリセット */
    clearProgress(pokemonId) {
      this.progress[pokemonId] = [];
      localStorage.removeItem(`${STORAGE_PREFIX}${pokemonId}`);
    },
    /** localStorage に保存 */
    saveProgress(pokemonId) {
      try {
        localStorage.setItem(
          `${STORAGE_PREFIX}${pokemonId}`,
          JSON.stringify(this.progress[pokemonId])
        );
      } catch {
        console.error("進捗の保存に失敗しました");
      }
    },
    /** ポケモンを選択し進捗をロード */
    selectPokemon(pokemon) {
      this.selectedPokemon = pokemon;
      this.loadProgress(pokemon.id);
    },
    /** リボンデータをセット */
    setRibbons(ribbons) {
      this.ribbons = ribbons;
    },
    /** ゲームデータをセット */
    setGames(games) {
      this.games = games;
    },
    /** ポケモン一覧をセット */
    setPokemonList(list) {
      this.pokemonList = list;
    }
  }
});
const GAME_NAMES = {
  ruby: "ルビー",
  sapphire: "サファイア",
  emerald: "エメラルド",
  diamond: "ダイヤモンド",
  pearl: "パール",
  platinum: "プラチナ",
  heartgold: "ハートゴールド",
  soulsilver: "ソウルシルバー",
  black: "ブラック",
  white: "ホワイト",
  black2: "ブラック2",
  white2: "ホワイト2",
  x: "X",
  y: "Y",
  oras: "オメガルビー・アルファサファイア",
  sun: "サン",
  moon: "ムーン",
  usum: "ウルトラサン・ウルトラムーン",
  lets_go: "レッツゴー",
  sword: "ソード",
  shield: "シールド"
};
const getGameName = (gameId) => GAME_NAMES[gameId] ?? gameId;
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "RibbonChart",
  __ssrInlineRender: true,
  props: {
    pokemon: {},
    ribbons: {},
    games: {}
  },
  setup(__props) {
    const props = __props;
    const store = useRibbonProgressStore();
    const isRibbonObtained = (ribbonId) => store.currentCheckedRibbons.includes(ribbonId);
    const gameRibbonsMap = computed(() => {
      const map = {};
      props.games.forEach((game) => {
        if (!map[game.generation]) {
          map[game.generation] = {};
        }
        const gameRibbons = props.ribbons.filter(
          (ribbon) => ribbon.games && ribbon.games.includes(game.id)
        );
        map[game.generation][game.id] = {
          name: getGameName(game.id),
          ribbons: gameRibbons
        };
      });
      return map;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h2 class="text-xl font-bold mb-4">リボン取得チャート</h2>`);
      if (!_ctx.pokemon) {
        _push(`<div class="bg-yellow-100 border-yellow-400 border p-4 rounded"><p>ポケモンを選択すると、世代別のリボン取得状況が表示されます。</p></div>`);
      } else {
        _push(`<div><div class="mb-4 p-4 bg-green-50 rounded"><h3 class="font-medium">${ssrInterpolate(_ctx.pokemon.name)}のリボンチャート</h3></div><div class="space-y-6"><!--[-->`);
        ssrRenderList(gameRibbonsMap.value, (gameGroup, generation) => {
          _push(`<div class="border rounded-lg overflow-hidden"><div class="bg-gray-100 p-3 font-medium">第${ssrInterpolate(generation)}世代</div><!--[-->`);
          ssrRenderList(gameGroup, (gameData, game) => {
            _push(`<div class="border-b last:border-b-0"><div class="px-4 py-3 bg-gray-50 flex justify-between items-center"><h4 class="font-medium">${ssrInterpolate(unref(getGameName)(String(game)))}</h4><span class="text-sm text-gray-600">${ssrInterpolate(gameData.ribbons.length)}個のリボン</span></div><div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"><!--[-->`);
            ssrRenderList(gameData.ribbons, (ribbon) => {
              _push(`<div class="flex items-center p-2 bg-white border rounded"><div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0"><span class="text-sm">🎀</span></div><div class="flex-1 text-sm"><div class="font-medium">${ssrInterpolate(ribbon.name)}</div><div class="text-xs text-gray-500 line-clamp-1">${ssrInterpolate(ribbon.description)}</div></div><div class="ml-2 w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">`);
              if (isRibbonObtained(ribbon.id)) {
                _push(`<span class="text-green-800">✓</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div>`);
            });
            _push(`<!--]--></div></div>`);
          });
          _push(`<!--]--></div>`);
        });
        _push(`<!--]--></div><div class="mt-6 p-4 bg-blue-50 rounded-lg"><h3 class="font-medium mb-2">世代間移行経路</h3><div class="text-sm space-y-1"><p>第3世代 → 第4世代: パルパーク</p><p>第4世代 → 第5世代: ポケシフター</p><p>第5世代 → 第6世代: ポケムーバー → ポケバンク</p><p>第6世代 → 第7世代: ポケバンク</p><p>第7世代 → 第8世代: ポケバンク → ポケモンHOME</p></div></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RibbonChart.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "RibbonMasterChart",
  __ssrInlineRender: true,
  props: {
    pokemon: {},
    ribbons: {}
  },
  setup(__props) {
    const props = __props;
    const store = useRibbonProgressStore();
    const generations = computed(() => {
      const gens = new Set(props.ribbons.map((r) => r.generation));
      return [...gens].sort((a, b) => a - b);
    });
    const getRibbonsByGeneration = (generation) => {
      return props.ribbons.filter((r) => r.generation === generation);
    };
    const getCompletionByGeneration = (generation) => {
      const genRibbons = getRibbonsByGeneration(generation);
      if (genRibbons.length === 0) return 0;
      const checked = genRibbons.filter((r) => store.currentCheckedRibbons.includes(r.id)).length;
      return Math.round(checked / genRibbons.length * 100);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h2 class="text-xl font-bold mb-4">リボン王チャート</h2>`);
      if (!_ctx.pokemon) {
        _push(`<div class="bg-yellow-100 border-yellow-400 border p-4 rounded"> ポケモンを選択すると、獲得可能なすべてのリボンのチェックリストが表示されます。 </div>`);
      } else {
        _push(`<div><div class="mb-4 p-4 bg-green-50 rounded flex justify-between items-center"><div><p><strong>${ssrInterpolate(_ctx.pokemon.name)}</strong> のリボン王チャート </p><p class="text-sm mt-1"> 獲得したリボン: ${ssrInterpolate(unref(store).currentCheckedRibbons.length)} / ${ssrInterpolate(_ctx.ribbons.length)}</p></div><button class="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"> 進捗をリセット </button></div><div class="space-y-6"><!--[-->`);
        ssrRenderList(generations.value, (gen) => {
          _push(`<div class="border rounded-lg overflow-hidden"><div class="bg-gray-100 p-3 font-bold">第${ssrInterpolate(gen)}世代リボン</div><div class="p-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><!--[-->`);
          ssrRenderList(getRibbonsByGeneration(gen), (ribbon) => {
            _push(`<div class="flex items-center p-2 hover:bg-gray-50 rounded"><input${ssrRenderAttr("id", ribbon.id)} type="checkbox"${ssrIncludeBooleanAttr(unref(store).currentCheckedRibbons.includes(ribbon.id)) ? " checked" : ""} class="w-5 h-5 mr-3"><label${ssrRenderAttr("for", ribbon.id)} class="flex-1 cursor-pointer"><div class="font-medium">${ssrInterpolate(ribbon.name)}</div><div class="text-xs text-gray-600">${ssrInterpolate(ribbon.requirements)}</div></label></div>`);
          });
          _push(`<!--]--></div></div></div>`);
        });
        _push(`<!--]--></div><div class="mt-6 bg-blue-50 p-4 rounded"><h3 class="font-bold mb-2">進捗サマリー</h3><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"><!--[-->`);
        ssrRenderList(generations.value, (gen) => {
          _push(`<div class="text-center p-2 bg-white rounded shadow-sm"><div class="text-sm font-medium mb-1">第${ssrInterpolate(gen)}世代</div><div class="text-lg font-bold">${ssrInterpolate(getCompletionByGeneration(gen))}%</div></div>`);
        });
        _push(`<!--]--><div class="text-center p-2 bg-blue-100 rounded shadow-sm"><div class="text-sm font-medium mb-1">総合進捗</div><div class="text-lg font-bold">${ssrInterpolate(unref(store).totalCompletion)}%</div></div></div></div>`);
        if (unref(store).totalCompletion === 100) {
          _push(`<div class="mt-6 border-2 border-yellow-400 p-4 rounded-lg bg-yellow-50"><h3 class="text-center text-xl font-bold text-yellow-800 mb-3">🏆 リボン制覇達成！ 🏆</h3><p class="text-center mb-4"> おめでとうございます！${ssrInterpolate(_ctx.pokemon.name)}はすべてのリボンを集めました！ </p><button class="block mx-auto px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"> 認定証を生成する </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RibbonMasterChart.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const RIBBON_GUIDES = {
  // ── チャンピオンリボン ──
  "champion-hoenn": {
    guide: "ホウエン地方（ルビー・サファイア・エメラルド）でポケモンリーグを倒し、殿堂入りをすることで獲得できます。手持ちのポケモン全員がリボンを獲得します。",
    tips: [
      "ストーリーを進めながら普通にリーグを倒せば獲得可能です。",
      "手持ちのポケモン全員がリボンを獲得するので、これから長期的にリボン集めをしたいポケモンを育成してから挑戦するとよいでしょう。"
    ]
  },
  "champion-sinnoh": {
    guide: "シンオウ地方（ダイヤモンド・パール・プラチナ）でポケモンリーグを倒し、殿堂入りをすることで獲得できます。",
    tips: [
      "シロナのガブリアスが強敵です。こおりタイプの技を用意しましょう。",
      "手持ち全員にリボンが付与されます。"
    ]
  },
  "champion-unova": {
    guide: "イッシュ地方（ブラック・ホワイト・ブラック2・ホワイト2）でポケモンリーグを倒し、殿堂入りをすることで獲得できます。",
    tips: [
      "BW2では強化四天王に再挑戦する必要はありません。初回クリアで獲得できます。"
    ]
  },
  "champion-kalos": {
    guide: "カロス地方（X・Y）でポケモンリーグを倒し、殿堂入りをすることで獲得できます。",
    tips: ["学習装置が全体共有になったため、レベル上げが容易です。"]
  },
  "champion-alola": {
    guide: "アローラ地方（サン・ムーン・ウルトラサン・ウルトラムーン）でポケモンリーグを倒し、初代チャンピオンになることで獲得できます。",
    tips: [
      "USUMではネクロズマ戦後にリーグへ挑戦できます。",
      "リーグ防衛戦ではなく、初回挑戦で獲得可能です。"
    ]
  },
  "champion-galar": {
    guide: "ガラル地方（ソード・シールド）でチャンピオンカップを制覇することで獲得できます。",
    tips: [
      "ダンデのリザードンが強敵です。いわタイプの技が有効です。",
      "ダイマックスを活用しましょう。"
    ]
  },
  // ── コンテストリボン ──
  "contest-master-cute": {
    guide: "ルビー・サファイア・エメラルドのコンテスト「かわいさ」部門のノーマル、スーパー、ハイパー、マスターランクですべて優勝する必要があります。各ランクのコンテストは各町のコンテスト会場で開催されています。",
    tips: [
      "ポフィンやポロックでかわいさを上げておくと有利になります。",
      "かわいさを上げる技を揃えておくと勝ちやすくなります。",
      "マスターランクは最低でもかわいさ170以上あると安定します。"
    ]
  },
  "contest-master-cool": {
    guide: "コンテスト「かっこよさ」部門の全ランクで優勝する必要があります。",
    tips: [
      "かっこよさを上げるポロックを作成し、コンディションを最大にしましょう。",
      "かっこよさ系の技を4つ揃えると高得点が狙えます。"
    ]
  },
  "contest-master-beauty": {
    guide: "コンテスト「うつくしさ」部門の全ランクで優勝する必要があります。",
    tips: [
      "うつくしさを上げるポロックでコンディションを上げましょう。",
      "ミロカロスなど元々うつくしさが高いポケモンだと有利です。"
    ]
  },
  "contest-master-smart": {
    guide: "コンテスト「かしこさ」部門の全ランクで優勝する必要があります。",
    tips: [
      "かしこさを上げるポロックを活用しましょう。",
      "コンボ技を狙うと高得点を取りやすくなります。"
    ]
  },
  "contest-master-tough": {
    guide: "コンテスト「たくましさ」部門の全ランクで優勝する必要があります。",
    tips: [
      "たくましさを上げるポロックでコンディションを最大にしましょう。",
      "たくましさ系の技でコンボを狙いましょう。"
    ]
  },
  // ── バトル施設リボン ──
  "battle-tower": {
    guide: "バトルタワーで一定の連勝数を達成することで獲得できます。世代によって必要な連勝数が異なります。",
    tips: [
      "対戦向けの育成（努力値・性格・技構成）をしっかり行いましょう。",
      "相性補完の良いパーティを組むことが重要です。"
    ]
  },
  "battle-champion": {
    guide: "ソード・シールドのバトルタワーでマスターボール級に到達することで獲得できます。",
    tips: [
      "レンタルチームを使うことも可能です。",
      "ダイマックスの使いどころが重要です。"
    ]
  },
  // ── 思い出・イベント系リボン ──
  alert: {
    guide: "第4世代（ダイヤモンド・パール・プラチナ・ハートゴールド・ソウルシルバー）で、曜日・時間帯に応じてリボンをもらえます。月曜日に入手可能です。",
    tips: [
      "ナギサシティ（DPPt）またはアサギシティ（HGSS）のリボンシンジケートで入手できます。",
      "曜日ごとに異なるリボンが入手可能なので、毎日チェックしましょう。"
    ]
  },
  shock: {
    guide: "第4世代で火曜日にリボンシンジケートで入手できるリボンです。",
    tips: ["DSの内部時計を確認して正しい曜日に訪れましょう。"]
  },
  downcast: {
    guide: "第4世代で水曜日にリボンシンジケートで入手できるリボンです。",
    tips: ["DSの内部時計を確認して正しい曜日に訪れましょう。"]
  },
  careless: {
    guide: "第4世代で木曜日にリボンシンジケートで入手できるリボンです。",
    tips: ["DSの内部時計を確認して正しい曜日に訪れましょう。"]
  },
  relax: {
    guide: "第4世代で金曜日にリボンシンジケートで入手できるリボンです。",
    tips: ["DSの内部時計を確認して正しい曜日に訪れましょう。"]
  },
  snooze: {
    guide: "第4世代で土曜日にリボンシンジケートで入手できるリボンです。",
    tips: ["DSの内部時計を確認して正しい曜日に訪れましょう。"]
  },
  smile: {
    guide: "第4世代で日曜日にリボンシンジケートで入手できるリボンです。",
    tips: ["DSの内部時計を確認して正しい曜日に訪れましょう。"]
  },
  footprint: {
    guide: "第4世代でなつき度が最大のポケモンに対して、足跡博士がリボンをくれます。",
    tips: [
      "なつき度を上げるには、一緒に歩く・やすらぎのすずを持たせる・マッサージを利用するなどの方法があります。",
      "213ばんどうろ（DPPt）にいる足跡博士に話しかけましょう。"
    ]
  },
  effort: {
    guide: "努力値（基礎ポイント）を最大（510）まで振ったポケモンに与えられるリボンです。",
    tips: [
      "どの努力値配分でも合計510になれば獲得できます。",
      "パワー系アイテムやポケルスを利用すると効率的です。"
    ]
  },
  "best-friends": {
    guide: "ソード・シールドでなかよし度を最大にすることで獲得できます。",
    tips: [
      "ポケモンキャンプでカレーを作ったり、遊んだりするとなかよし度が上がります。",
      "やすらぎのすずを持たせて歩くのも効果的です。"
    ]
  }
};
const getRibbonGuide = (ribbonId) => {
  var _a;
  return ((_a = RIBBON_GUIDES[ribbonId]) == null ? void 0 : _a.guide) ?? "このリボンの詳細なガイドはまだ作成中です。";
};
const getRibbonTips = (ribbonId) => {
  var _a;
  return ((_a = RIBBON_GUIDES[ribbonId]) == null ? void 0 : _a.tips) ?? null;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "RibbonGuide",
  __ssrInlineRender: true,
  props: {
    selectedRibbon: {}
  },
  setup(__props) {
    const formatGames = (games) => {
      if (!games) return "";
      return games.map((game) => getGameName(game)).join("、");
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white border rounded-lg p-4 shadow-sm" }, _attrs))}><h3 class="text-lg font-bold mb-3">リボン獲得ガイド</h3>`);
      if (!_ctx.selectedRibbon) {
        _push(`<div class="text-gray-500 text-center py-8"> 左のリストからリボンを選択すると、詳細な獲得方法が表示されます </div>`);
      } else {
        _push(`<div><div class="flex items-start mb-4"><div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">`);
        if (_ctx.selectedRibbon.image_url) {
          _push(`<img${ssrRenderAttr("src", _ctx.selectedRibbon.image_url)}${ssrRenderAttr("alt", _ctx.selectedRibbon.name)} class="w-12 h-12">`);
        } else {
          _push(`<span class="text-3xl">🎀</span>`);
        }
        _push(`</div><div><h4 class="text-xl font-bold">${ssrInterpolate(_ctx.selectedRibbon.name)}</h4><p class="text-gray-600">${ssrInterpolate(_ctx.selectedRibbon.description)}</p><div class="mt-1 text-xs"><span class="inline-block bg-gray-200 rounded px-2 py-0.5">第${ssrInterpolate(_ctx.selectedRibbon.generation)}世代</span><span class="inline-block ml-1 bg-gray-200 rounded px-2 py-0.5">${ssrInterpolate(formatGames(_ctx.selectedRibbon.games))}</span></div></div></div><hr class="my-4"><div class="mb-4"><h5 class="font-medium mb-2">獲得条件</h5><p class="text-gray-700">${ssrInterpolate(_ctx.selectedRibbon.requirements)}</p></div><div class="mb-4"><h5 class="font-medium mb-2">詳細な獲得方法</h5><div class="bg-gray-50 p-3 rounded text-gray-700">${ssrInterpolate(unref(getRibbonGuide)(_ctx.selectedRibbon.id))}</div></div>`);
        if (unref(getRibbonTips)(_ctx.selectedRibbon.id)) {
          _push(`<div class="mb-4"><h5 class="font-medium mb-2">獲得のコツ</h5><ul class="list-disc pl-5 text-gray-700"><!--[-->`);
          ssrRenderList(unref(getRibbonTips)(_ctx.selectedRibbon.id), (tip, index) => {
            _push(`<li class="mb-1">${ssrInterpolate(tip)}</li>`);
          });
          _push(`<!--]--></ul></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-4 text-sm text-gray-500"><p>最終更新: ${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleDateString("ja-JP"))}</p></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RibbonGuide.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white border rounded-lg p-4 shadow-sm" }, _attrs))}><h3 class="text-lg font-bold mb-4">ポケモン転送ガイド</h3><div class="mb-6"><p class="mb-2"> リボンコレクションを続けるには、ポケモンを各世代間で転送する必要があります。 </p><p class="text-sm text-gray-600">※一度転送したポケモンは元の世代に戻すことができません。</p></div><div class="space-y-6"><div class="border-l-4 border-green-500 pl-3"><h4 class="font-medium text-green-800">第3世代 → 第4世代</h4><div class="mt-2 text-gray-700"><p><span class="font-medium">転送方法:</span> パルパークを使用</p><ol class="mt-1 pl-5 list-decimal"><li> GBAソフト（ルビー/サファイア/エメラルド/ファイアレッド/リーフグリーン）と、DSソフト（ダイヤモンド/パール/プラチナ）を準備 </li><li>DSかDSliteが必要（DSiでは不可）</li><li>DSのスロット2にGBAソフトを挿入、スロット1にDSソフトを挿入</li><li>DSソフトでメニューの「パルパーク」を選択</li><li>1日6匹までポケモンを転送可能</li></ol></div></div><div class="border-l-4 border-blue-500 pl-3"><h4 class="font-medium text-blue-800">第4世代 → 第5世代</h4><div class="mt-2 text-gray-700"><p><span class="font-medium">転送方法:</span> ポケシフターを使用</p><ol class="mt-1 pl-5 list-decimal"><li>2台のDSを用意</li><li> 第4世代ソフト（ダイヤモンド/パール/プラチナ/ハートゴールド/ソウルシルバー）と第5世代ソフト（ブラック/ホワイト/ブラック2/ホワイト2）を準備 </li><li>第5世代ソフトでポケシフター施設を解放（ゲームを進めるとアクセス可能）</li><li>1回の転送につき最大6匹のポケモンを転送可能</li><li>転送したポケモンは「ポケシフター森」でミニゲームをクリアして捕まえる必要あり</li></ol></div></div><div class="border-l-4 border-red-500 pl-3"><h4 class="font-medium text-red-800">第5世代 → 第6世代以降</h4><div class="mt-2 text-gray-700"><p><span class="font-medium">転送方法:</span> ポケモンバンク + ポケモンHOMEを使用</p><ol class="mt-1 pl-5 list-decimal"><li>ポケモンバンクがダウンロード済みの3DSが必要</li><li>ポケモンバンクで第5世代のポケモンを預ける</li><li>ポケモンバンクから第6・7世代ソフトへ転送、または</li><li>ポケモンHOME（Switch版/スマホ版）に引越し後、HOME経由で第8世代以降へ転送</li></ol><p class="mt-2 text-sm text-red-600"> 注意: ポケモンバンクは新規でダウンロードはできません。また今後のサービス終了が予定されています。早めの転送をお勧めします。 </p></div></div></div><div class="mt-6 bg-yellow-50 p-3 rounded-lg"><h4 class="font-medium text-amber-800 mb-2">転送時の注意点</h4><ul class="list-disc pl-5 text-gray-700"><li>特定の技や状態異常がある場合、転送できないことがあります</li><li>持ち物は転送前に外しておくことをおすすめします</li><li>ニックネームに特殊な文字が含まれる場合、転送後に変更される可能性があります</li><li>特定のフォルムや特別なポケモンは転送できない場合があります</li></ul></div></div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TransferGuide.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "HelpfulResources",
  __ssrInlineRender: true,
  setup(__props) {
    const resources = ref([
      {
        title: "リボンマスターロードマップ",
        description: "どの順番で世代を進めれば効率良くリボンを集められるかのガイド",
        link: ""
      },
      {
        title: "バトルタワーリボン攻略",
        description: "各世代のバトル施設でリボンを獲得するためのパーティ構成とテクニック",
        link: ""
      },
      {
        title: "コンテストリボン最短攻略",
        description: "各世代のコンテストで効率的にリボンを獲得するためのガイド",
        link: ""
      },
      {
        title: "世代間転送完全ガイド",
        description: "ポケモンを第3世代から最新世代まで転送するステップバイステップ解説",
        link: ""
      },
      {
        title: "レアリボン獲得方法",
        description: "希少なイベント限定リボンや特殊なリボンの獲得方法",
        link: ""
      }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white border rounded-lg p-4 shadow-sm" }, _attrs))}><h3 class="text-lg font-bold mb-3">お役立ち情報</h3><div class="space-y-4"><!--[-->`);
      ssrRenderList(resources.value, (resource, index) => {
        _push(`<div class="border-b pb-3 last:border-b-0 last:pb-0"><h4 class="font-medium text-blue-800">${ssrInterpolate(resource.title)}</h4><p class="mt-1 text-gray-700">${ssrInterpolate(resource.description)}</p><div class="mt-2">`);
        if (resource.link) {
          _push(`<a${ssrRenderAttr("href", resource.link)} target="_blank" class="text-blue-600 hover:underline inline-block text-sm"> 詳細を見る → </a>`);
        } else {
          _push(`<p class="text-xs text-gray-500">このツール内で確認できます</p>`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div><div class="mt-6"><h4 class="font-medium mb-2">リボンコレクターコミュニティ</h4><div class="grid grid-cols-2 gap-3"><a href="https://www.reddit.com/r/pokemonribbons/" target="_blank" class="flex items-center p-2 border rounded hover:bg-gray-50"><div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-2 text-white text-xs"> r/ </div><div><div class="font-medium">Reddit</div><div class="text-xs text-gray-600">r/pokemonribbons</div></div></a><a href="https://discord.gg/ribbons" target="_blank" class="flex items-center p-2 border rounded hover:bg-gray-50"><div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-2 text-white text-xs"> D </div><div><div class="font-medium">Discord</div><div class="text-xs text-gray-600">Ribbon Collectors</div></div></a></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HelpfulResources.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const REPO_URL = "https://raw.githubusercontent.com/boitoshi/pokemon-data/main";
const isLoading = ref(false);
const error = ref(null);
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  return response.json();
}
async function fetchPokemonList() {
  try {
    return await fetchJson(`${REPO_URL}/pokemon.json`);
  } catch (err) {
    console.warn("ポケモンデータ取得に失敗しました。ダミーデータを使用します。", err);
    return getDummyPokemon();
  }
}
async function fetchRibbonList() {
  try {
    return await fetchJson(`${REPO_URL}/ribbons.json`);
  } catch (err) {
    console.warn("リボンデータ取得に失敗しました。ダミーデータを使用します。", err);
    return getDummyRibbons();
  }
}
async function fetchGameList() {
  try {
    return await fetchJson(`${REPO_URL}/games.json`);
  } catch (err) {
    console.warn("ゲームデータ取得に失敗しました。ダミーデータを使用します。", err);
    return getDummyGames();
  }
}
const usePokemonData = () => {
  const loadAll = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const [pokemonData, ribbonData, gameData] = await Promise.all([
        fetchPokemonList(),
        fetchRibbonList(),
        fetchGameList()
      ]);
      return { pokemonData, ribbonData, gameData };
    } catch (err) {
      error.value = err instanceof Error ? err.message : "不明なエラーが発生しました";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  return { isLoading, error, loadAll };
};
function getDummyPokemon() {
  return [
    {
      id: "pikachu",
      dexNumber: 25,
      name: "ピカチュウ",
      types: ["でんき"],
      generation: 1,
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
      category: "ねずみポケモン",
      height: 40,
      weight: 60,
      abilities: ["せいでんき", "ひらいしん"]
    },
    {
      id: "eevee",
      dexNumber: 133,
      name: "イーブイ",
      types: ["ノーマル"],
      generation: 1,
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
      category: "しんかポケモン",
      height: 30,
      weight: 65,
      abilities: ["にげあし", "てきおうりょく"]
    },
    {
      id: "absol",
      dexNumber: 359,
      name: "アブソル",
      types: ["あく"],
      generation: 3,
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/359.png",
      category: "わざわいポケモン",
      height: 120,
      weight: 470,
      abilities: ["プレッシャー", "きょううん"]
    }
  ];
}
function getDummyRibbons() {
  return [
    {
      id: "champion-hoenn",
      name: "チャンピオンリボン（ホウエン）",
      description: "ホウエン地方のポケモンリーグで優勝した証",
      generation: 3,
      games: ["ruby", "sapphire", "emerald"],
      category: "チャンピオン",
      requirements: "ホウエンリーグを制覇する",
      image_url: "/ribbons/champion-hoenn.png"
    },
    {
      id: "contest-master-cute",
      name: "コンテストマスターリボン（かわいさ）",
      description: "かわいさコンテストのマスターランクで優勝した証",
      generation: 3,
      games: ["ruby", "sapphire", "emerald"],
      category: "コンテスト",
      requirements: "かわいさコンテストをマスターランクで優勝する",
      image_url: "/ribbons/contest-master-cute.png"
    },
    {
      id: "alert",
      name: "アラートリボン",
      description: "常に周囲に注意を払っている証",
      generation: 4,
      games: ["diamond", "pearl", "platinum", "heartgold", "soulsilver"],
      category: "特性",
      requirements: "ダイヤモンド・パール・プラチナ・HG・SSで入手",
      image_url: "/ribbons/alert.png"
    }
  ];
}
function getDummyGames() {
  return [
    { id: "ruby", name: "ポケットモンスター ルビー", shortName: "ルビー", generation: 3, releaseDate: "2002-11-21", platform: "GBA" },
    { id: "sapphire", name: "ポケットモンスター サファイア", shortName: "サファイア", generation: 3, releaseDate: "2002-11-21", platform: "GBA" },
    { id: "emerald", name: "ポケットモンスター エメラルド", shortName: "エメラルド", generation: 3, releaseDate: "2004-09-16", platform: "GBA" },
    { id: "diamond", name: "ポケットモンスター ダイヤモンド", shortName: "ダイヤモンド", generation: 4, releaseDate: "2006-09-28", platform: "DS" },
    { id: "pearl", name: "ポケットモンスター パール", shortName: "パール", generation: 4, releaseDate: "2006-09-28", platform: "DS" }
  ];
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const store = useRibbonProgressStore();
    const { isLoading: isLoading2, error: error2 } = usePokemonData();
    const activeTab = ref("ribbons");
    const selectedRibbon = ref(null);
    const filters = ref({
      generation: null,
      type: null,
      status: null,
      search: ""
    });
    const tabs = [
      { id: "ribbons", label: "リボン一覧" },
      { id: "chart", label: "リボン取得チャート" },
      { id: "master", label: "リボン王チャート" },
      { id: "guide", label: "獲得ガイド" },
      { id: "transfer", label: "転送方法" }
    ];
    const selectRibbon = (ribbon) => {
      selectedRibbon.value = ribbon;
      if (activeTab.value !== "guide") {
        activeTab.value = "guide";
      }
    };
    const applyFilters = (newFilters) => {
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
          if (t === "champion") return r.id.includes("champion");
          if (t === "contest") return r.id.includes("contest");
          if (t === "battle") return r.id.includes("tower");
          if (t === "memory") return r.id.includes("memory");
          if (t === "event") return r.id.includes("event");
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
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PokemonSearch = _sfc_main$9;
      const _component_PokemonDetails = _sfc_main$8;
      const _component_RibbonFilter = _sfc_main$7;
      const _component_RibbonsList = _sfc_main$6;
      const _component_RibbonChart = _sfc_main$5;
      const _component_RibbonMasterChart = _sfc_main$4;
      const _component_RibbonGuide = _sfc_main$3;
      const _component_TransferGuide = __nuxt_component_7;
      const _component_HelpfulResources = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8" }, _attrs))}><h1 class="text-3xl font-bold mb-6 text-center">ポケモンリボン制覇支援ツール</h1><div class="mb-8">`);
      if (unref(isLoading2)) {
        _push(`<div class="py-16 text-center"><div class="inline-block animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div><p class="mt-2 text-gray-500">リボンデータを読み込み中...</p></div>`);
      } else if (unref(error2)) {
        _push(`<div class="py-8 text-center bg-red-50 rounded-lg"><p class="text-red-600">データの読み込みに失敗しました: ${ssrInterpolate(unref(error2))}</p><button class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"> 再試行 </button></div>`);
      } else {
        _push(ssrRenderComponent(_component_PokemonSearch, {
          "all-pokemon": unref(store).pokemonList,
          "selected-pokemon": unref(store).selectedPokemon,
          onSelectPokemon: unref(store).selectPokemon
        }, null, _parent));
      }
      _push(`</div>`);
      if (unref(store).selectedPokemon) {
        _push(`<div class="mb-8">`);
        _push(ssrRenderComponent(_component_PokemonDetails, {
          pokemon: unref(store).selectedPokemon
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mb-8"><div class="flex border-b flex-wrap"><!--[-->`);
      ssrRenderList(tabs, (tab) => {
        _push(`<button class="${ssrRenderClass(["px-4 py-2 mr-2", activeTab.value === tab.id ? "bg-blue-500 text-white rounded-t" : "text-gray-700"])}">${ssrInterpolate(tab.label)}</button>`);
      });
      _push(`<!--]--></div><div class="mt-4">`);
      if (activeTab.value === "ribbons") {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_RibbonFilter, { onFilterChange: applyFilters }, null, _parent));
        _push(ssrRenderComponent(_component_RibbonsList, {
          pokemon: unref(store).selectedPokemon,
          ribbons: filteredRibbons.value,
          onSelectRibbon: selectRibbon
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "chart") {
        _push(ssrRenderComponent(_component_RibbonChart, {
          pokemon: unref(store).selectedPokemon,
          ribbons: unref(store).ribbons,
          games: unref(store).games
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "master") {
        _push(ssrRenderComponent(_component_RibbonMasterChart, {
          pokemon: unref(store).selectedPokemon,
          ribbons: unref(store).ribbons
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "guide") {
        _push(`<div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="md:col-span-1"><h3 class="text-lg font-bold mb-3">リボンリスト</h3><div class="border rounded overflow-y-auto max-h-96"><!--[-->`);
        ssrRenderList(unref(store).ribbons, (ribbon) => {
          var _a;
          _push(`<div class="${ssrRenderClass([
            "p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0",
            ((_a = selectedRibbon.value) == null ? void 0 : _a.id) === ribbon.id ? "bg-blue-50" : ""
          ])}"><div class="font-medium">${ssrInterpolate(ribbon.name)}</div><div class="text-xs text-gray-600">第${ssrInterpolate(ribbon.generation)}世代</div></div>`);
        });
        _push(`<!--]--></div></div><div class="md:col-span-2">`);
        _push(ssrRenderComponent(_component_RibbonGuide, { "selected-ribbon": selectedRibbon.value }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "transfer") {
        _push(ssrRenderComponent(_component_TransferGuide, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      _push(ssrRenderComponent(_component_HelpfulResources, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-DKBN8Ich.js.map
