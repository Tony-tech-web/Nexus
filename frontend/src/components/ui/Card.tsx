import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, glass = true }) => {
  return (
    <div className={cn(
      "rounded-2xl border transition-all duration-300",
      glass ? "bg-slate-900/40 backdrop-blur-xl border-slate-800/50 hover:border-slate-700/50 shadow-2xl shadow-black/20" : "bg-slate-900 border-slate-800",
      className
    )}>
      {children}
    </div>
  );
};
