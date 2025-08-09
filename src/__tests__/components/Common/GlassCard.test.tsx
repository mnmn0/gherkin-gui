import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlassCard from '../../../renderer/components/Common/GlassCard';

describe('GlassCard', () => {
  test('基本的なレンダリング', () => {
    render(
      <GlassCard>
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  test('デフォルトクラスが適用される', () => {
    const { container } = render(
      <GlassCard>
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-card', 'glass-card--md');
  });

  test('サイズプロップが正しく適用される', () => {
    const { container } = render(
      <GlassCard size="lg">
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-card--lg');
  });

  test('ブラーレベルが正しく適用される', () => {
    const { container } = render(
      <GlassCard blur="heavy">
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-card--blur-heavy');
  });

  test('ボーダーなしオプション', () => {
    const { container } = render(
      <GlassCard border={false}>
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-card--no-border');
  });

  test('シャドウなしオプション', () => {
    const { container } = render(
      <GlassCard shadow={false}>
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-card--no-shadow');
  });

  test('ホバー効果オプション', () => {
    const { container } = render(
      <GlassCard hover>
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-card--hoverable');
  });

  test('インタラクティブモードでクリックイベント', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    const { container } = render(
      <GlassCard interactive onClick={handleClick}>
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-card--interactive');
    expect(card).toHaveAttribute('tabIndex', '0');

    await user.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('パディングなしオプション', () => {
    const { container } = render(
      <GlassCard padding={false}>
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-card--no-padding');
    expect(card.children[0]).not.toHaveClass('glass-card__content');
  });

  test('フォールバックモード', () => {
    const { container } = render(
      <GlassCard fallback>
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-card--fallback');
  });

  test('カスタムクラス名', () => {
    const { container } = render(
      <GlassCard className="custom-class">
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  test('ARIAプロパティが正しく設定される', () => {
    const { container } = render(
      <GlassCard aria-label="カスタムラベル" role="button">
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('aria-label', 'カスタムラベル');
    expect(card).toHaveAttribute('role', 'button');
  });

  test('CSSカスタムプロパティが正しく設定される', () => {
    const { container } = render(
      <GlassCard opacity={0.5} blur="light">
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.getPropertyValue('--glass-opacity')).toBe('0.5');
    expect(card.style.getPropertyValue('--glass-blur')).toBe('8px');
  });

  test('キーボードフォーカスがインタラクティブ要素で動作する', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    const { container } = render(
      <GlassCard interactive onClick={handleClick}>
        <p>テストコンテンツ</p>
      </GlassCard>,
    );

    const card = container.firstChild as HTMLElement;

    await user.tab();
    expect(card).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
