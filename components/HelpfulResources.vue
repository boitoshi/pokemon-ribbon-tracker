<template>
  <div class="bg-white border rounded-lg p-4 shadow-sm">
    <h3 class="text-lg font-bold mb-3">お役立ち情報</h3>
    
    <div class="space-y-4">
      <div v-for="(resource, index) in resources" :key="index" class="border-b pb-3 last:border-b-0 last:pb-0">
        <h4 class="font-medium text-blue-800">{{ resource.title }}</h4>
        <p class="mt-1 text-gray-700">{{ resource.description }}</p>
        <div class="mt-2">
          <a 
            v-if="resource.link" 
            :href="resource.link" 
            target="_blank" 
            class="text-blue-600 hover:underline inline-block text-sm">
            詳細を見る →
          </a>
          <p v-else class="text-xs text-gray-500">
            このツール内で確認できます
          </p>
        </div>
      </div>
    </div>
    
    <div class="mt-6">
      <h4 class="font-medium mb-2">リボンコレクターコミュニティ</h4>
      <div class="grid grid-cols-2 gap-3">
        <a 
          href="https://www.reddit.com/r/pokemonribbons/" 
          target="_blank"
          class="flex items-center p-2 border rounded hover:bg-gray-50">
          <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-2 text-white text-xs">
            r/
          </div>
          <div>
            <div class="font-medium">Reddit</div>
            <div class="text-xs text-gray-600">r/pokemonribbons</div>
          </div>
        </a>
        <a 
          href="https://discord.gg/ribbons" 
          target="_blank"
          class="flex items-center p-2 border rounded hover:bg-gray-50">
          <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-2 text-white text-xs">
            D
          </div>
          <div>
            <div class="font-medium">Discord</div>
            <div class="text-xs text-gray-600">Ribbon Collectors</div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// リソースデータ
const resources = ref([
  {
    title: 'リボンマスターロードマップ',
    description: 'どの順番で世代を進めれば効率良くリボンを集められるかのガイド',
    link: ''
  },
  {
    title: 'バトルタワーリボン攻略',
    description: '各世代のバトル施設でリボンを獲得するためのパーティ構成とテクニック',
    link: 'https://example.com/battle-tower-guide'
  },
  {
    title: 'コンテストリボン最短攻略',
    description: '各世代のコンテストで効率的にリボンを獲得するためのガイド',
    link: 'https://example.com/contest-guide'
  },
  {
    title: '世代間転送完全ガイド',
    description: 'ポケモンを第3世代から最新世代まで転送するステップバイステップ解説',
    link: ''
  },
  {
    title: 'レアリボン獲得方法',
    description: '希少なイベント限定リボンや特殊なリボンの獲得方法',
    link: 'https://example.com/rare-ribbons'
  }
]);
</script>
