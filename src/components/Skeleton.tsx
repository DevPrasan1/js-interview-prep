import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  height?: string;
  width?: string;
}

export function Skeleton({ className = '', variant = 'rect', height, width }: SkeletonProps) {
  const baseClass = 'bg-bg-tertiary animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded w-3/4 my-1.5',
    rect: 'rounded-xl',
    circle: 'rounded-full',
  }[variant];

  const style: React.CSSProperties = {
    height: height,
    width: width,
  };

  return (
    <div
      className={`${baseClass} ${variantClasses} ${className}`}
      style={style}
    />
  );
}

// Preset: Card Skeleton
export function CardSkeleton() {
  return (
    <div className="border border-border-color bg-bg-primary p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton variant="circle" width="36px" height="36px" />
        <Skeleton variant="rect" width="60px" height="20px" className="rounded-full" />
      </div>
      <Skeleton variant="text" className="w-5/6 h-5" />
      <Skeleton variant="text" className="w-2/3 h-4" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="rect" width="50px" height="18px" className="rounded-full" />
        <Skeleton variant="rect" width="65px" height="18px" className="rounded-full" />
      </div>
    </div>
  );
}

// Preset: Question List Item Skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border border-border-color bg-bg-primary rounded-xl">
      <div className="space-y-2 flex-1 mr-4">
        <Skeleton variant="text" className="h-4.5 w-1/3" />
        <div className="flex gap-2">
          <Skeleton variant="rect" width="40px" height="16px" className="rounded-full" />
          <Skeleton variant="rect" width="50px" height="16px" className="rounded-full" />
        </div>
      </div>
      <Skeleton variant="rect" width="24px" height="24px" className="rounded-md" />
    </div>
  );
}
