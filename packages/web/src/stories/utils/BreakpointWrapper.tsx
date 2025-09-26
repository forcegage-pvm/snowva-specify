'use client';

import type { ReactNode } from 'react';

export const BREAKPOINT_WIDTHS = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINT_WIDTHS;

export type BreakpointArgs = {
  breakpoint: BreakpointKey;
};

type BreakpointContainerProps = {
  breakpoint?: BreakpointKey;
  align?: 'start' | 'center';
  children: ReactNode;
};

export const breakpointArgType = {
  options: Object.keys(BREAKPOINT_WIDTHS),
  control: { type: 'radio' as const },
} as const;

export const BreakpointContainer = ({
  breakpoint = 'desktop',
  align = 'center',
  children,
}: BreakpointContainerProps) => {
  const width = BREAKPOINT_WIDTHS[breakpoint] ?? BREAKPOINT_WIDTHS.desktop;
  const alignClass = align === 'start' ? 'justify-start' : 'justify-center';

  return (
    <div className={`flex w-full bg-slate-100/60 p-6 ${alignClass}`}>
      <div
        className="w-full max-w-full rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm"
        style={{ width }}
      >
        {children}
      </div>
    </div>
  );
};
