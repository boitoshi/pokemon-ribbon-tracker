import { describe, it, expect } from 'vitest';
import { isValidMyPokemon } from './myPokemonValidator';

/** 最小限の有効な MyPokemon オブジェクト */
function validEntry(): Record<string, unknown> {
	return {
		id: 'uuid-001',
		pokemonId: 'pikachu',
		nickname: 'ピカ',
		originGame: 'sv',
		currentGame: 'sv',
		level: 50,
		isTransferredToHome: false,
		memo: '',
		createdAt: '2026-01-01T00:00:00.000Z'
	};
}

describe('isValidMyPokemon', () => {
	describe('正常ケース', () => {
		it('必須フィールドがすべて揃っていれば true を返す', () => {
			expect(isValidMyPokemon(validEntry())).toBe(true);
		});

		it('オプショナルフィールド（transferConfirmations など）がなくても true', () => {
			const entry = validEntry();
			// オプショナルフィールドは持っていなくてよい
			expect(isValidMyPokemon(entry)).toBe(true);
		});

		it('level が 0 でも true', () => {
			expect(isValidMyPokemon({ ...validEntry(), level: 0 })).toBe(true);
		});

		it('isTransferredToHome が true でも true', () => {
			expect(isValidMyPokemon({ ...validEntry(), isTransferredToHome: true })).toBe(true);
		});
	});

	describe('異常ケース — null / 非オブジェクト', () => {
		it('null は false', () => {
			expect(isValidMyPokemon(null)).toBe(false);
		});

		it('undefined は false', () => {
			expect(isValidMyPokemon(undefined)).toBe(false);
		});

		it('文字列は false', () => {
			expect(isValidMyPokemon('broken')).toBe(false);
		});

		it('配列は false', () => {
			expect(isValidMyPokemon([])).toBe(false);
		});
	});

	describe('異常ケース — 必須フィールド欠損・型違い', () => {
		it('id がない場合は false', () => {
			const { id: _, ...rest } = validEntry();
			expect(isValidMyPokemon(rest)).toBe(false);
		});

		it('level が文字列の場合は false', () => {
			expect(isValidMyPokemon({ ...validEntry(), level: '50' })).toBe(false);
		});

		it('isTransferredToHome が文字列の場合は false', () => {
			expect(isValidMyPokemon({ ...validEntry(), isTransferredToHome: 'false' })).toBe(false);
		});

		it('pokemonId が null の場合は false', () => {
			expect(isValidMyPokemon({ ...validEntry(), pokemonId: null })).toBe(false);
		});

		it('createdAt がない場合は false', () => {
			const { createdAt: _, ...rest } = validEntry();
			expect(isValidMyPokemon(rest)).toBe(false);
		});
	});
});
