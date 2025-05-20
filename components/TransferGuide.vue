<template>
  <div class="bg-white border rounded-lg p-4 shadow-sm">
    <h3 class="text-lg font-bold mb-4">ポケモン転送ガイド</h3>
    
    <div class="mb-6">
      <p class="mb-2">リボンコレクションを続けるには、ポケモンを各世代間で転送する必要があります。</p>
      <p class="text-sm text-gray-600">※一度転送したポケモンは元の世代に戻すことができません。</p>
    </div>
    
    <div class="space-y-6">
      <!-- 第3→第4世代 -->
      <div class="border-l-4 border-green-500 pl-3">
        <h4 class="font-medium text-green-800">第3世代 → 第4世代</h4>
        <div class="mt-2 text-gray-700">
          <p><span class="font-medium">転送方法:</span> パルパークを使用</p>
          <ol class="mt-1 pl-5 list-decimal">
            <li>GBAソフト（ルビー/サファイア/エメラルド/ファイアレッド/リーフグリーン）と、DSソフト（ダイヤモンド/パール/プラチナ）を準備</li>
            <li>DSのスロット2にGBAソフトを挿入、スロット1にDSソフトを挿入</li>
            <li>DSソフトでメニューの「パルパーク」を選択</li>
            <li>1日6匹までポケモンを転送可能</li>
          </ol>
        </div>
      </div>
      
      <!-- 第4→第5世代 -->
      <div class="border-l-4 border-blue-500 pl-3">
        <h4 class="font-medium text-blue-800">第4世代 → 第5世代</h4>
        <div class="mt-2 text-gray-700">
          <p><span class="font-medium">転送方法:</span> ポケシフターを使用</p>
          <ol class="mt-1 pl-5 list-decimal">
            <li>2台のDSを用意</li>
            <li>第4世代ソフト（ダイヤモンド/パール/プラチナ/ハートゴールド/ソウルシルバー）と第5世代ソフト（ブラック/ホワイト/ブラック2/ホワイト2）を準備</li>
            <li>第5世代ソフトでポケシフター施設を解放（ゲームを進めるとアクセス可能）</li>
            <li>1回の転送につき最大6匹のポケモンを転送可能</li>
            <li>転送したポケモンは「ポケシフター森」でミニゲームをクリアして捕まえる必要あり</li>
          </ol>
        </div>
      </div>
      
      <!-- 第5→第6世代以降 -->
      <div class="border-l-4 border-red-500 pl-3">
        <h4 class="font-medium text-red-800">第5世代 → 第6世代以降</h4>
        <div class="mt-2 text-gray-700">
          <p><span class="font-medium">転送方法:</span> ポケモンバンク + ポケモンHOMEを使用</p>
          <ol class="mt-1 pl-5 list-decimal">
            <li>3DSでポケモンバンクをダウンロード（有料サービス）</li>
            <li>ポケモンバンクで第5世代のポケモンを預ける</li>
            <li>ポケモンバンクから第6・7世代ソフトへ転送、または</li>
            <li>ポケモンHOME（Switch/モバイルアプリ）を使ってバンクから第8世代以降へ転送</li>
          </ol>
          <p class="mt-2 text-sm text-red-600">注意: ポケモンバンクは2023年3月からは無料で利用可能ですが、今後のサービス終了が予定されています。早めの転送をお勧めします。</p>
        </div>
      </div>
    </div>
    
    <div class="mt-6 bg-yellow-50 p-3 rounded-lg">
      <h4 class="font-medium text-amber-800 mb-2">転送時の注意点</h4>
      <ul class="list-disc pl-5 text-gray-700">
        <li>特定の技や状態異常がある場合、転送できないことがあります</li>
        <li>持ち物は転送前に外しておくことをおすすめします</li>
        <li>ニックネームに特殊な文字が含まれる場合、転送後に変更される可能性があります</li>
        <li>特定のフォルムや特別なポケモンは転送できない場合があります</li>
      </ul>
    </div>
  </div>
</template>
