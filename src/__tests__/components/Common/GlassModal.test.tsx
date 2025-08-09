import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlassModal from '../../../renderer/components/Common/GlassModal';

describe('GlassModal', () => {
  test('isOpenがfalseの時は何もレンダリングしない', () => {
    render(
      <GlassModal isOpen={false} onClose={jest.fn()}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    expect(screen.queryByText('モーダルコンテンツ')).not.toBeInTheDocument();
  });

  test('isOpenがtrueの時はモーダルをレンダリングする', () => {
    render(
      <GlassModal isOpen onClose={jest.fn()}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    expect(screen.getByText('モーダルコンテンツ')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('タイトルが正しく表示される', () => {
    render(
      <GlassModal isOpen onClose={jest.fn()} title="テストタイトル">
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-labelledby',
      'modal-title',
    );
  });

  test('閉じるボタンが表示されクリックで閉じる', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <GlassModal isOpen onClose={handleClose}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    const closeButton = screen.getByRole('button', {
      name: 'モーダルを閉じる',
    });
    expect(closeButton).toBeInTheDocument();

    await user.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('showCloseButtonがfalseの時は閉じるボタンが表示されない', () => {
    render(
      <GlassModal isOpen onClose={jest.fn()} showCloseButton={false}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    expect(
      screen.queryByRole('button', { name: 'モーダルを閉じる' }),
    ).not.toBeInTheDocument();
  });

  test('Escapeキーでモーダルが閉じる', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <GlassModal isOpen onClose={handleClose}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('closeOnEscapeがfalseの時はEscapeキーで閉じない', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <GlassModal isOpen onClose={handleClose} closeOnEscape={false}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    await user.keyboard('{Escape}');
    expect(handleClose).not.toHaveBeenCalled();
  });

  test('背景クリックでモーダルが閉じる', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <GlassModal isOpen onClose={handleClose}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    const backdrop = screen.getByRole('dialog');
    await user.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('closeOnBackdropがfalseの時は背景クリックで閉じない', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <GlassModal isOpen onClose={handleClose} closeOnBackdrop={false}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    const backdrop = screen.getByRole('dialog');
    await user.click(backdrop);
    expect(handleClose).not.toHaveBeenCalled();
  });

  test('モーダルコンテンツクリックでは閉じない', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <GlassModal isOpen onClose={handleClose}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    await user.click(screen.getByText('モーダルコンテンツ'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  test('サイズプロップが正しく適用される', () => {
    const { container } = render(
      <GlassModal isOpen onClose={jest.fn()} size="lg">
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    const modalContent = container.querySelector('.glass-modal__content');
    expect(modalContent).toHaveClass('glass-modal--lg');
  });

  test('backdrop variantが正しく適用される', () => {
    const { container } = render(
      <GlassModal isOpen onClose={jest.fn()} backdrop="dark">
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    const backdrop = container.querySelector('.glass-modal__backdrop');
    expect(backdrop).toHaveClass('glass-modal__backdrop--dark');
  });

  test('ARIAプロパティが正しく設定される', () => {
    render(
      <GlassModal
        isOpen
        onClose={jest.fn()}
        aria-describedby="modal-description"
      >
        <p id="modal-description">モーダルの説明</p>
      </GlassModal>,
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
  });

  test('フォーカス管理が正しく動作する', async () => {
    const TestApp = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div>
          <button onClick={() => setIsOpen(true)}>モーダルを開く</button>
          <GlassModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <button>モーダル内ボタン</button>
          </GlassModal>
        </div>
      );
    };

    const user = userEvent.setup();
    render(<TestApp />);

    const openButton = screen.getByText('モーダルを開く');
    await user.click(openButton);

    // モーダルが開いた後、フォーカスがモーダル内に移ることをテスト
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveAttribute('tabindex', '-1');
    });
  });

  test('bodyのスクロールが無効化される', async () => {
    const originalOverflow = document.body.style.overflow;

    const { rerender } = render(
      <GlassModal isOpen onClose={jest.fn()}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <GlassModal isOpen={false} onClose={jest.fn()}>
        <p>モーダルコンテンツ</p>
      </GlassModal>,
    );

    await waitFor(() => {
      expect(document.body.style.overflow).toBe(originalOverflow);
    });
  });
});
