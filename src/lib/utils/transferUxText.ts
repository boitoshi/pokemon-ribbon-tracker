export interface TransferUxText {
	guideSummary: string;
	irreversibleAlert: string;
	confirmStep1Label: string;
	finalAgreementLabel: string;
}

const DEFAULT_TEXT: TransferUxText = {
	guideSummary: '転送条件を満たしているか確認してから進めてください。',
	irreversibleAlert: 'この転送は不可逆です。実行後は元世代へ戻せません。',
	confirmStep1Label: 'この転送が戻せないことを理解しました',
	finalAgreementLabel: 'この操作が不可逆であることに同意します'
};

export const TRANSFER_UX_TEXT: Record<string, TransferUxText> = {
	'route.gen3_to_gen4': {
		guideSummary: 'パルパーク転送は一方通行です。GBAスロット搭載機で事前に取り逃しを確認してください。',
		irreversibleAlert: 'パルパーク転送は不可逆です。Gen3へは戻せません。',
		confirmStep1Label: 'パルパーク転送が不可逆であることを理解しました',
		finalAgreementLabel: 'このパルパーク転送が不可逆であることに同意します'
	},
	'route.gen4_to_gen5': {
		guideSummary: 'ポケシフター転送は一方通行です。必要な2台構成を満たしてから実施してください。',
		irreversibleAlert: 'ポケシフター転送は不可逆です。Gen4へは戻せません。',
		confirmStep1Label: 'ポケシフター転送が不可逆であることを理解しました',
		finalAgreementLabel: 'このポケシフター転送が不可逆であることに同意します'
	},
	'route.gen5_to_bank': {
		guideSummary: 'バンク移動は一方通行です。実施前にGen5リボンの取り残しがないか確認してください。',
		irreversibleAlert: 'ポケムーバー経由の転送は不可逆です。Gen5へは戻せません。',
		confirmStep1Label: 'ポケムーバー転送が不可逆であることを理解しました',
		finalAgreementLabel: 'このポケムーバー転送が不可逆であることに同意します'
	},
	'route.bank_to_home': {
		guideSummary: 'バンクからHOMEへの引越しは戻せません。最終チェック後に実行してください。',
		irreversibleAlert: 'バンク→HOME引越しは不可逆です。バンクへ戻せません。',
		confirmStep1Label: 'バンク→HOME引越しが不可逆であることを理解しました',
		finalAgreementLabel: 'このバンク→HOME引越しが不可逆であることに同意します'
	},
	'route.gen8_to_gen9': {
		guideSummary: 'HOME連携で双方向移動できるルートです。転送可否は対応図鑑に依存します。',
		irreversibleAlert: 'このルートは双方向移動に対応しています。対応ソフト間で行き来できます。',
		confirmStep1Label: 'このルートが双方向移動に対応していることを確認しました',
		finalAgreementLabel: '対応条件を確認して転送を実行します'
	},
	'route.frlg_switch_to_home': {
		guideSummary: 'Switch版FRLGからHOMEへの連携は一方向です。実行前に取得計画を確定してください。',
		irreversibleAlert: 'Switch版FRLG→HOME連携は不可逆です。元環境へ戻せません。',
		confirmStep1Label: 'Switch版FRLG→HOME連携が不可逆であることを理解しました',
		finalAgreementLabel: 'このSwitch版FRLG→HOME連携が不可逆であることに同意します'
	}
};

export function getTransferUxText(explanationKey: string): TransferUxText {
	return TRANSFER_UX_TEXT[explanationKey] ?? DEFAULT_TEXT;
}
