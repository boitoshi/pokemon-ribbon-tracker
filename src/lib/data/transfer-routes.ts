import type { Hardware, TransferRoute } from '$lib/types';

export const TRANSFER_ROUTES: TransferRoute[] = [
	{
		id: 'gen3-to-gen4',
		fromGeneration: 3,
		toGeneration: 4,
		methodName: 'パルパーク',
		hardwareRequired: ['ds_lite'],
		hardwareNote: 'DS / DS Lite のみ対応。DSi / 3DS は GBAスロットがないため不可。',
		softwareRequired: ['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen'],
		dailyLimit: 6,
		restrictions: [
			'転送は一方通行（Gen3には戻せない）',
			'1日6匹まで',
			'DSのスロット2にGBAカートリッジを挿入する',
			'パルパークに到着後、ミニゲームで捕獲する必要はない（自動で手持ちに来る）'
		]
	},
	{
		id: 'gen4-to-gen5',
		fromGeneration: 4,
		toGeneration: 5,
		methodName: 'ポケシフター',
		hardwareRequired: ['ds_lite', 'dsi'],
		hardwareNote: 'DSが2台必要。送り元（Gen4）と受け先（Gen5）で1台ずつ使用。',
		softwareRequired: ['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'],
		restrictions: [
			'転送は一方通行',
			'ポケシフター施設をストーリーで解放する必要あり',
			'ポケシフター森でミニゲームをクリアして捕獲する',
			'6匹まで一度に転送可能'
		]
	},
	{
		id: 'gen5-to-bank',
		fromGeneration: 5,
		toGeneration: 6,
		methodName: 'ポケモンバンク',
		hardwareRequired: ['3ds'],
		softwareRequired: ['black', 'white', 'black2', 'white2'],
		restrictions: [
			'転送は一方通行',
			'ポケムーバー（無料）でGen5ソフトからバンクに移動',
			'バンクからGen6/7ソフトへ転送、またはHOMEへ引越し'
		],
		isDeprecated: true,
		deprecationNote:
			'ポケモンバンクは2023年3月でニンテンドーeショップ販売終了。既存DL済みの3DSのみ利用可。早急に転送することを強く推奨。'
	},
	{
		id: 'bank-to-home',
		fromGeneration: 7,
		toGeneration: 8,
		methodName: 'ポケモンHOME（バンクから引越し）',
		hardwareRequired: ['3ds', 'switch'],
		softwareRequired: [],
		restrictions: [
			'ポケモンHOMEのスマホ版またはSwitch版が必要',
			'バンクとHOMEを連携させる',
			'引越し後はバンクに戻せない',
			'HOME Premiumプランでより多くのポケモンを預けられる'
		]
	},
	{
		id: 'gen8-to-gen9',
		fromGeneration: 8,
		toGeneration: 9,
		methodName: 'ポケモンHOME',
		hardwareRequired: ['switch'],
		softwareRequired: ['sword', 'shield', 'legends_arceus'],
		restrictions: [
			'HOME経由で双方向転送可能（Gen9→HOMEも可）',
			'一部のポケモンはGen9に転送不可（図鑑未登録種）'
		]
	},
	{
		id: 'frlg-switch-to-home',
		fromGeneration: 3,
		toGeneration: 8,
		methodName: 'ポケモンHOME直接連携（Switch版FRLG）',
		hardwareRequired: ['switch'] as Hardware[],
		softwareRequired: ['firered_switch', 'leafgreen_switch'],
		restrictions: [
			'ポケモンHOMEプレミアムプランが必要な場合あり',
			'Switch版ファイアレッドまたはリーフグリーンが必要',
		],
	},
];
