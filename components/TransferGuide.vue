<script setup lang="ts"></script>

<template>
  <div class="bg-white border rounded-lg p-2 md:p-4 shadow-sm">
    <h3 class="text-base md:text-lg font-bold mb-2 md:mb-4">転送ガイド &amp; 取得戦略</h3>

    <!-- 第3世代 取得戦略ガイド -->
    <div class="mb-4 md:mb-6">
      <h4 class="font-semibold text-sm md:text-base mb-2 text-gray-800">第3世代 リボン取得推奨順序</h4>
      <div class="space-y-2">
        <!-- Step 1 -->
        <div class="flex gap-3 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">1</div>
          <div>
            <p class="font-medium text-sm text-red-800">【最優先】レベル制限ありのリボン</p>
            <p class="text-xs text-red-700 mt-0.5">
              <strong>ウィニングリボン</strong>（バトルタワー Lv.50チャレンジ）は
              <strong>Lv.50以下のポケモンのみ参加可能</strong>です。
              チャンピオンリボンなどを先に取得してポケモンのレベルが51以上になると、この部門には出場できなくなります。
              Lv.50以内に収めた個体を用意するか、育成途中に先取りしましょう。
            </p>
          </div>
        </div>
        <!-- Step 2 -->
        <div class="flex gap-3 p-2 md:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold flex items-center justify-center">2</div>
          <div>
            <p class="font-medium text-sm text-yellow-800">コンテストリボン（全20種）</p>
            <p class="text-xs text-yellow-700 mt-0.5">
              クール・ビューティ・キュート・スマート・タフの5部門 × ノーマル〜マスターランク。
              R/S/E のみ取得可能。レベル制限はありませんが、コンテスト用のコンディション（特定のポフィン/ポロック）を
              事前に準備しておくとスムーズです。
            </p>
          </div>
        </div>
        <!-- Step 3 -->
        <div class="flex gap-3 p-2 md:p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">3</div>
          <div>
            <p class="font-medium text-sm text-blue-800">チャンピオンリボン・その他</p>
            <p class="text-xs text-blue-700 mt-0.5">
              チャンピオンリボン（殿堂入り）、ビクトリーリボン（バトルタワー オープン）、
              がんばリボン（努力値MAX後 NPCに話す）、アーティストリボン（コンテスト美術館掲載）、
              ナショナルリボン・アースリボン（コロシアム/XD 専用）。
            </p>
          </div>
        </div>
      </div>
      <p class="mt-2 text-xs text-gray-500">
        ※チャンピオンリボンは殿堂入り時に<strong>手持ち全員</strong>に付与されます。
        まとめてリボンを取りたいポケモンを全員手持ちに入れて挑戦しましょう。
      </p>
    </div>

    <hr class="mb-4 border-gray-200" />

    <!-- 世代以降のリボン管理について -->
    <div class="mb-4 md:mb-6 p-3 bg-gray-50 rounded-lg border">
      <h4 class="font-semibold text-sm md:text-base mb-1 text-gray-800">複数世代にわたるリボン管理</h4>
      <p class="text-xs text-gray-700 mb-2">
        Gen 3 でリボンを取り切ったら、転送して次の世代のリボンを取りに行きます。
        「リボン管理」タブの <strong>フィルター → 世代</strong> で表示する世代を切り替えると、
        今いる世代で取れるリボンだけを確認できます。
      </p>
      <div class="text-xs text-gray-600 space-y-0.5">
        <p>• <strong>第3世代</strong> → 第4世代へはパルパーク（DS + GBAスロット必須）</p>
        <p>• <strong>第4世代</strong> → 第5世代へはポケシフター（DS 2台必須）</p>
        <p>• <strong>第5世代以降</strong> → ポケモンバンク / ポケモンHOME 経由</p>
      </div>
    </div>

    <!-- 転送方法詳細 -->
    <div class="mb-3 md:mb-4">
      <p class="mb-1 text-xs text-gray-500">
        ※一度転送したポケモンは元の世代に戻すことができません。
      </p>
    </div>

    <div class="space-y-3 md:space-y-6">
      <!-- 第3→第4世代 -->
      <div class="border-l-4 border-green-500 pl-2 md:pl-3">
        <h4 class="font-medium text-sm md:text-base text-green-800">第3世代 → 第4世代</h4>
        <div class="mt-1 md:mt-2 text-gray-700 text-sm md:text-base">
          <p><span class="font-medium">転送方法:</span> パルパークを使用</p>
          <ol class="mt-0.5 md:mt-1 pl-3 md:pl-5 list-decimal text-sm">
            <li>GBAソフト（ルビー/サファイア/エメラルド/ファイアレッド/リーフグリーン）と、DSソフト（ダイヤモンド/パール/プラチナ）を準備</li>
            <li>DSかDSliteが必要（DSiでは不可）</li>
            <li>DSのスロット2にGBAソフトを挿入、スロット1にDSソフトを挿入</li>
            <li>DSソフトでメニューの「パルパーク」を選択</li>
            <li>1日6匹までポケモンを転送可能</li>
          </ol>
        </div>
      </div>

      <!-- 第4→第5世代 -->
      <div class="border-l-4 border-blue-500 pl-2 md:pl-3">
        <h4 class="font-medium text-sm md:text-base text-blue-800">第4世代 → 第5世代</h4>
        <div class="mt-1 md:mt-2 text-gray-700 text-sm md:text-base">
          <p><span class="font-medium">転送方法:</span> ポケシフターを使用</p>
          <ol class="mt-0.5 md:mt-1 pl-3 md:pl-5 list-decimal text-sm">
            <li>2台のDSを用意</li>
            <li>第4世代ソフト（ダイヤモンド/パール/プラチナ/ハートゴールド/ソウルシルバー）と第5世代ソフト（ブラック/ホワイト/ブラック2/ホワイト2）を準備</li>
            <li>第5世代ソフトでポケシフター施設を解放（ゲームを進めるとアクセス可能）</li>
            <li>1回の転送につき最大6匹のポケモンを転送可能</li>
            <li>転送したポケモンは「ポケシフター森」でミニゲームをクリアして捕まえる必要あり</li>
          </ol>
        </div>
      </div>

      <!-- 第5→第6世代以降 -->
      <div class="border-l-4 border-red-500 pl-2 md:pl-3">
        <h4 class="font-medium text-sm md:text-base text-red-800">第5世代 → 第6世代以降</h4>
        <div class="mt-1 md:mt-2 text-gray-700 text-sm md:text-base">
          <p><span class="font-medium">転送方法:</span> ポケモンバンク + ポケモンHOMEを使用</p>
          <ol class="mt-0.5 md:mt-1 pl-3 md:pl-5 list-decimal text-sm">
            <li>ポケモンバンクがダウンロード済みの3DSが必要</li>
            <li>ポケモンバンクで第5世代のポケモンを預ける</li>
            <li>ポケモンバンクから第6・7世代ソフトへ転送、または</li>
            <li>ポケモンHOME（Switch版/スマホ版）に引越し後、HOME経由で第8世代以降へ転送</li>
          </ol>
          <p class="mt-2 text-sm text-red-600">
            注意: ポケモンバンクは新規でダウンロードはできません。また今後のサービス終了が予定されています。早めの転送をお勧めします。
          </p>
        </div>
      </div>
    </div>

    <div class="mt-4 md:mt-6 bg-yellow-50 p-2 md:p-3 rounded-lg">
      <h4 class="font-medium text-amber-800 text-sm md:text-base mb-1 md:mb-2">転送時の注意点</h4>
      <ul class="list-disc pl-3 md:pl-5 text-gray-700 text-sm md:text-base">
        <li>特定の技や状態異常がある場合、転送できないことがあります</li>
        <li>持ち物は転送前に外しておくことをおすすめします</li>
        <li>ニックネームに特殊な文字が含まれる場合、転送後に変更される可能性があります</li>
        <li>特定のフォルムや特別なポケモンは転送できない場合があります</li>
      </ul>
    </div>
  </div>
</template>
