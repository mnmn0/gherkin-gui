import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  className = '',
}) => {
  const spinnerClass = `loading-spinner ${size} ${color} ${className}`.trim();

  return (
    <div className="loading-container">
      <div className={spinnerClass} />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};
