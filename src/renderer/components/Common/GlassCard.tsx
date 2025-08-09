import React from 'react';
import { GlassEffectProps, ComponentSize } from '../../types/theme';
import './GlassCard.css';

interface GlassCardProps extends GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  size?: ComponentSize;
  hover?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  padding?: boolean;
  'aria-label'?: string;
  role?: string;
  tabIndex?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  blur = 'medium',
  opacity = 0.7,
  border = true,
  shadow = true,
  fallback = false,
  size = 'md',
  hover = false,
  interactive = false,
  onClick,
  padding = true,
  ...ariaProps
}) => {
  const blurMap = {
    light: 8,
    medium: 16,
    heavy: 32,
  };

  const classes = [
    'glass-card',
    `glass-card--${size}`,
    blur !== 'medium' && `glass-card--blur-${blur}`,
    !border && 'glass-card--no-border',
    !shadow && 'glass-card--no-shadow',
    hover && 'glass-card--hoverable',
    interactive && 'glass-card--interactive',
    !padding && 'glass-card--no-padding',
    fallback && 'glass-card--fallback',
    className,
  ].filter(Boolean).join(' ');

  const style = {
    '--glass-opacity': opacity,
    '--glass-blur': `${blurMap[blur]}px`,
  } as React.CSSProperties;

  const cardProps = {
    className: classes,
    style,
    onClick: interactive ? onClick : undefined,
    tabIndex: interactive ? (ariaProps.tabIndex ?? 0) : undefined,
    ...ariaProps,
  };

  return (
    <div {...cardProps}>
      {padding ? (
        <div className="glass-card__content">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default GlassCard;