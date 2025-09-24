'use client';

import type { FC } from 'react';

export type DocumentTimelineEvent = {
  eventId: string;
  timestamp: string;
  eventType: string;
  actor: string;
  summary: string;
  details?: string;
};

export type DocumentTimelineFilters = {
  eventTypes: string[];
  actors: string[];
};

type DocumentTimelineProps = {
  entityId: string;
  entityType: string;
  events: DocumentTimelineEvent[];
  filters?: DocumentTimelineFilters;
  onFilterChange?: (filters: DocumentTimelineFilters) => void;
};

export const DocumentTimeline: FC<DocumentTimelineProps> = () => {
  return null;
};
