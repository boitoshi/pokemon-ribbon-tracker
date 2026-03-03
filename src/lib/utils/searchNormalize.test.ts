import { describe, it, expect } from 'vitest';
import { normalizeForSearch } from './searchNormalize';

describe('normalizeForSearch', () => {
	describe('ひらがな → カタカナ変換', () => {
		it('ひらがなをカタカナに変換する', () => {
			expect(normalizeForSearch('ぴかちゅう')).toBe('ピカチュウ');
		});

		it('混在（ひらがな+カタカナ）でもカタカナに統一される', () => {
			expect(normalizeForSearch('ぴかチュウ')).toBe('ピカチュウ');
		});

		it('カタカナはそのまま（大文字化しない）', () => {
			expect(normalizeForSearch('ピカチュウ')).toBe('ピカチュウ');
		});

		it('小文字ひらがな（っ ゃ ゅ ょ）もカタカナ小文字に変換される', () => {
			expect(normalizeForSearch('きゃっちゅう')).toBe('キャッチュウ');
		});
	});

	describe('英字の大文字小文字統一', () => {
		it('大文字英字を小文字に変換する', () => {
			expect(normalizeForSearch('PIKACHU')).toBe('pikachu');
		});

		it('混在の英字を小文字に統一する', () => {
			expect(normalizeForSearch('PiKaChU')).toBe('pikachu');
		});
	});

	describe('検索マッチング互換性', () => {
		it('「ぴかちゅう」と「ピカチュウ」が一致する', () => {
			const query = normalizeForSearch('ぴかちゅう');
			const name = normalizeForSearch('ピカチュウ');
			expect(name.includes(query)).toBe(true);
		});

		it('「ふしぎだね」と「フシギダネ」が一致する', () => {
			const query = normalizeForSearch('ふしぎだね');
			const name = normalizeForSearch('フシギダネ');
			expect(name.includes(query)).toBe(true);
		});

		it('部分一致も正規化後に機能する', () => {
			const query = normalizeForSearch('ぴか');
			const name = normalizeForSearch('ピカチュウ');
			expect(name.includes(query)).toBe(true);
		});

		it('一致しないものはマッチしない', () => {
			const query = normalizeForSearch('ヒトカゲ');
			const name = normalizeForSearch('ピカチュウ');
			expect(name.includes(query)).toBe(false);
		});
	});

	describe('エッジケース', () => {
		it('空文字は空文字を返す', () => {
			expect(normalizeForSearch('')).toBe('');
		});

		it('スペースのみは空文字にならない（トリムしない）', () => {
			expect(normalizeForSearch('  ')).toBe('  ');
		});

		it('数字は変換されない', () => {
			expect(normalizeForSearch('123')).toBe('123');
		});
	});
});
