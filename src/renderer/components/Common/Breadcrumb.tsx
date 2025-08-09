import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHomeIcon?: boolean;
  className?: string;
  onNavigate?: (path: string) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  showHomeIcon = true,
  className = '',
  onNavigate,
}) => {
  const handleClick = (item: BreadcrumbItem) => {
    if (item.path && !item.isActive && onNavigate) {
      onNavigate(item.path);
    }
  };

  const defaultSeparator = (
    <ChevronRight size={14} className="breadcrumb-separator" />
  );

  return (
    <nav
      className={`breadcrumb ${className}`}
      aria-label="パンくず"
      role="navigation"
    >
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = item.path && !item.isActive;

          return (
            <li
              key={`${item.path || item.label}-${index}`}
              className="breadcrumb-item"
            >
              {isClickable ? (
                <button
                  type="button"
                  className="breadcrumb-link"
                  onClick={() => handleClick(item)}
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {index === 0 && showHomeIcon && (
                    <Home size={14} className="breadcrumb-home-icon" />
                  )}
                  <span className="breadcrumb-label">{item.label}</span>
                </button>
              ) : (
                <span
                  className={`breadcrumb-current ${item.isActive ? 'active' : ''}`}
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {index === 0 && showHomeIcon && (
                    <Home size={14} className="breadcrumb-home-icon" />
                  )}
                  <span className="breadcrumb-label">{item.label}</span>
                </span>
              )}

              {!isLast && (
                <span
                  className="breadcrumb-separator-wrapper"
                  aria-hidden="true"
                >
                  {separator || defaultSeparator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
