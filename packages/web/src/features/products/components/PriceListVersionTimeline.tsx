'use client';

import type { FC } from 'react';

export type PriceListVersion = {
  versionId: string;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Archived';
  effectiveDate: string;
  changedBy?: string;
  notes?: string;
  archivedReason?: string;
};

type PriceListVersionTimelineProps = {
  versions: PriceListVersion[];
  currentVersionId?: string;
  onVersionSelect?: (versionId: string) => void;
};

export const PriceListVersionTimeline: FC<PriceListVersionTimelineProps> = () => {
  return null;
};
