import { describe, it, expect } from 'vitest';
import { GAME_NAMES, getGameName } from '~/utils/gameNames';

describe('GAME_NAMES', () => {
  it('25エントリが定義されていること', () => {
    expect(Object.keys(GAME_NAMES)).toHaveLength(25);
  });

  it('lets_go が含まれること', () => {
    expect(GAME_NAMES.lets_go).toBe('レッツゴー');
  });
});

describe('getGameName', () => {
  it('既知のゲームIDで日本語名を返す', () => {
    expect(getGameName('ruby')).toBe('ルビー');
    expect(getGameName('emerald')).toBe('エメラルド');
    expect(getGameName('sword')).toBe('ソード');
  });

  it('未知のゲームIDはそのまま返す', () => {
    expect(getGameName('unknown_game')).toBe('unknown_game');
  });
});
