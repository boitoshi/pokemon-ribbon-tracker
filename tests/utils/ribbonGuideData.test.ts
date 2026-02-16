import { describe, it, expect } from 'vitest';
import { RIBBON_GUIDES, getRibbonGuide, getRibbonTips } from '~/utils/ribbonGuideData';

describe('RIBBON_GUIDES', () => {
  it('チャンピオンリボン（ホウエン）が定義されていること', () => {
    expect(RIBBON_GUIDES['champion-hoenn']).toBeDefined();
    expect(RIBBON_GUIDES['champion-hoenn'].guide).toContain('ホウエン');
    expect(RIBBON_GUIDES['champion-hoenn'].tips.length).toBeGreaterThan(0);
  });

  it('全エントリが guide と tips を持つこと', () => {
    for (const [key, entry] of Object.entries(RIBBON_GUIDES)) {
      expect(entry.guide, `${key} の guide が空`).toBeTruthy();
      expect(Array.isArray(entry.tips), `${key} の tips が配列でない`).toBe(true);
    }
  });
});

describe('getRibbonGuide', () => {
  it('既知のリボンIDでガイドテキストを返す', () => {
    const guide = getRibbonGuide('champion-hoenn');
    expect(guide).toContain('ホウエン');
  });

  it('未知のリボンIDでデフォルトメッセージを返す', () => {
    const guide = getRibbonGuide('nonexistent');
    expect(guide).toBe('このリボンの詳細なガイドはまだ作成中です。');
  });
});

describe('getRibbonTips', () => {
  it('既知のリボンIDでヒント配列を返す', () => {
    const tips = getRibbonTips('champion-hoenn');
    expect(tips).not.toBeNull();
    expect(tips!.length).toBeGreaterThan(0);
  });

  it('未知のリボンIDで null を返す', () => {
    const tips = getRibbonTips('nonexistent');
    expect(tips).toBeNull();
  });
});
