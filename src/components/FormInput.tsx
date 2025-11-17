'use client';

import { type InputHTMLAttributes } from 'react';

interface LabelProps {
  children: React.ReactNode;
}

export function Label({ children }: LabelProps) {
  return <p className="text-xs font-semibold text-slate-500">{children}</p>;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input(props: InputProps) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 ${
        className ?? ''
      }`}
    />
  );
}

