'use client';

import type { ComponentType, SVGProps } from 'react';

type TrendDirection = 'up' | 'down' | 'flat';

type DashboardTileProps = {
  title: string;
  metricValue: number;
  format?: 'currency' | 'number' | 'percentage';
  currency?: string;
  deltaPct?: number;
  trendDirection?: TrendDirection;
  target?: number;
  criticalThreshold?: number;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  isLoading?: boolean;
};

export const DashboardTile = (_props: DashboardTileProps) => {
  return null;
};
