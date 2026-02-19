<template>
  <div>
    <!-- ポケモン未選択時 -->
    <div v-if="!store.selectedPokemon" class="py-8 text-center bg-gray-50 rounded-lg">
      <p class="text-gray-500 text-sm">ポケモンを選択すると取得ロードマップが表示されます</p>
    </div>

    <div v-else>
      <!-- ヘッダー: 取得可能数サマリー -->
      <div class="mb-4 p-3 bg-white border rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <div>
            <span class="text-sm text-gray-500">取得可能なリボン</span>
            <span class="ml-2 text-lg font-bold text-blue-700">{{ groups.totalObtainable }}個</span>
            <span class="text-xs text-gray-400 ml-1">/ {{ store.ribbons.length }}個全体</span>
          </div>
          <div class="text-right text-xs text-gray-500">
            <span v-if="groups.ineligible.length > 0">取得不可: {{ groups.ineligible.length }}個</span>
          </div>
        </div>
        <!-- 進捗バー: 取得可能数を分母に -->
        <div class="flex items-center gap-2">
          <div class="flex-1 bg-gray-200 rounded-full h-2.5">
            <div
              class="bg-blue-500 h-2.5 rounded-full transition-all"
              :style="`width: ${obtainedPercentage}%`"
            ></div>
          </div>
          <span class="text-xs font-medium text-blue-700 flex-shrink-0">
            {{ groups.obtained }} / {{ groups.totalObtainable }} ({{ obtainedPercentage }}%)
          </span>
        </div>
      </div>

      <!-- Phase 1: レベル制限 (最優先) -->
      <PhaseSection
        v-if="groups.phase1.length > 0"
        title="先に取ること — レベル制限あり"
        :count="groups.phase1.length"
        :obtained-count="countObtained(groups.phase1)"
        color="red"
        note="このフェーズのリボンはレベルが上がると参加できなくなります。最優先で取得してください。"
        :default-open="true"
      >
        <RibbonChartRow
          v-for="ribbon in groups.phase1"
          :key="ribbon.id"
          :ribbon="ribbon"
          :is-checked="store.currentCheckedRibbons.includes(ribbon.id)"
          @toggle="toggleRibbon(ribbon.id)"
        />
      </PhaseSection>

      <!-- Phase 2: コンテスト -->
      <PhaseSection
        v-if="groups.phase2.length > 0"
        title="コンテスト"
        :count="groups.phase2.length"
        :obtained-count="countObtained(groups.phase2)"
        color="yellow"
        note="対応ゲーム: ルビー・サファイア・エメラルド"
        :default-open="true"
      >
        <RibbonChartRow
          v-for="ribbon in groups.phase2"
          :key="ribbon.id"
          :ribbon="ribbon"
          :is-checked="store.currentCheckedRibbons.includes(ribbon.id)"
          @toggle="toggleRibbon(ribbon.id)"
        />
      </PhaseSection>

      <!-- Phase 3: ストーリー/バトル/その他 -->
      <PhaseSection
        v-if="groups.phase3.length > 0"
        title="ストーリー・バトル・その他"
        :count="groups.phase3.length"
        :obtained-count="countObtained(groups.phase3)"
        color="green"
        :default-open="true"
      >
        <RibbonChartRow
          v-for="ribbon in groups.phase3"
          :key="ribbon.id"
          :ribbon="ribbon"
          :is-checked="store.currentCheckedRibbons.includes(ribbon.id)"
          @toggle="toggleRibbon(ribbon.id)"
        />
      </PhaseSection>

      <!-- 取得不可セクション (デフォルト折りたたみ) -->
      <PhaseSection
        v-if="groups.ineligible.length > 0"
        title="このポケモンでは取得不可"
        :count="groups.ineligible.length"
        :obtained-count="0"
        color="gray"
        :default-open="false"
      >
        <div
          v-for="item in groups.ineligible"
          :key="item.ribbon.id"
          class="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 border-b last:border-b-0"
        >
          <span class="w-5 h-5 flex-shrink-0 text-center">✗</span>
          <span class="flex-1">{{ item.ribbon.name }}</span>
          <span class="text-xs bg-gray-100 px-2 py-0.5 rounded">{{ item.reason }}</span>
        </div>
      </PhaseSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { canPokemonGetRibbon, getAcquisitionPhase } from '~/utils/ribbonEligibility';
import type { Ribbon } from '~/types';

const store = useRibbonProgressStore();

interface RibbonGroup {
  phase1: Ribbon[];
  phase2: Ribbon[];
  phase3: Ribbon[];
  ineligible: { ribbon: Ribbon; reason: string }[];
  totalObtainable: number;
  obtained: number;
}

/** リボンをフェーズ別に分類する */
const groups = computed((): RibbonGroup => {
  const phase1: Ribbon[] = [];
  const phase2: Ribbon[] = [];
  const phase3: Ribbon[] = [];
  const ineligible: { ribbon: Ribbon; reason: string }[] = [];

  const detail = store.selectedPokemon
    ? store.pokemonList.find((p) => p.id === store.selectedPokemon!.id)
    : undefined;

  for (const ribbon of store.ribbons) {
    const result = detail
      ? canPokemonGetRibbon(detail, ribbon, store.activeMyPokemon ?? undefined)
      : { eligible: true };

    if (!result.eligible) {
      ineligible.push({ ribbon, reason: result.reason ?? '取得不可' });
      continue;
    }

    const phase = getAcquisitionPhase(ribbon);
    if (phase === 1) phase1.push(ribbon);
    else if (phase === 2) phase2.push(ribbon);
    else phase3.push(ribbon);
  }

  const totalObtainable = phase1.length + phase2.length + phase3.length;

  return {
    phase1,
    phase2,
    phase3,
    ineligible,
    totalObtainable,
    obtained: store.currentCheckedRibbons.length,
  };
});

/** 取得済みリボン数の割合（取得可能数を分母） */
const obtainedPercentage = computed(() => {
  if (groups.value.totalObtainable === 0) return 0;
  return Math.round((groups.value.obtained / groups.value.totalObtainable) * 100);
});

/** リボン配列中の取得済み数 */
const countObtained = (ribbons: Ribbon[]): number =>
  ribbons.filter((r) => store.currentCheckedRibbons.includes(r.id)).length;

/** リボンの取得状態をトグル */
const toggleRibbon = (ribbonId: string): void => {
  if (!store.selectedPokemon) return;
  store.toggleRibbon(store.selectedPokemon.id, ribbonId);
};
</script>
