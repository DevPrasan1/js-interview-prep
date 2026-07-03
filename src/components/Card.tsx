import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
  border?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverEffect = false, glass = false, border = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl bg-bg-primary overflow-hidden transition-all duration-300 ${
          border ? 'border border-border-color' : ''
        } ${
          glass ? 'glass-effect' : ''
        } ${
          hoverEffect
            ? 'hover:shadow-lg hover:-translate-y-0.5 hover:border-accent-soft-border'
            : 'shadow-sm'
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
