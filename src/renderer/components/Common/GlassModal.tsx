import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GlassEffectProps, ComponentSize } from '../../types/theme';
import GlassCard from './GlassCard';
import './GlassModal.css';

interface GlassModalProps extends GlassEffectProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ComponentSize;
  backdrop?: 'blur' | 'dark' | 'light';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  title?: string;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  backdrop = 'blur',
  closeOnBackdrop = true,
  closeOnEscape = true,
  title,
  showCloseButton = true,
  className = '',
  contentClassName = '',
  blur = 'medium',
  opacity = 0.9,
  border = true,
  shadow = true,
  fallback = false,
  ...ariaProps
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // フォーカス管理
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousActiveElementRef.current?.focus();
    }
  }, [isOpen]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // ボディスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // フォーカストラップ
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  const getSizeClass = () => {
    const sizeMap = {
      sm: 'glass-modal--sm',
      md: 'glass-modal--md',
      lg: 'glass-modal--lg',
      xl: 'glass-modal--xl',
    };
    return sizeMap[size];
  };

  const getBackdropClass = () => {
    const backdropMap = {
      blur: 'glass-modal__backdrop--blur',
      dark: 'glass-modal__backdrop--dark',
      light: 'glass-modal__backdrop--light',
    };
    return backdropMap[backdrop];
  };

  if (!isOpen) return null;

  const modal = (
    <div
      className={`glass-modal ${className}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : ariaProps['aria-labelledby']}
      aria-describedby={ariaProps['aria-describedby']}
    >
      <div className={`glass-modal__backdrop ${getBackdropClass()}`} />
      
      <div className="glass-modal__container">
        <div
          ref={modalRef}
          className={`glass-modal__content ${getSizeClass()} ${contentClassName}`}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <GlassCard
            blur={blur}
            opacity={opacity}
            border={border}
            shadow={shadow}
            fallback={fallback}
            padding={false}
            size="lg"
          >
            {(title || showCloseButton) && (
              <div className="glass-modal__header">
                {title && (
                  <h2 id="modal-title" className="glass-modal__title">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    className="glass-modal__close"
                    onClick={onClose}
                    aria-label="モーダルを閉じる"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            <div className="glass-modal__body">
              {children}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default GlassModal;