'use client';

import type { ChangeEvent, FC } from 'react';
import { useMemo } from 'react';

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

const formatEventTypeLabel = (eventType: string) =>
  `${eventType
    .split(/[-_]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')} events`;

const formatTimestamp = (timestamp: string) =>
  new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));

export const DocumentTimeline: FC<DocumentTimelineProps> = ({
  entityId,
  entityType,
  events,
  filters,
  onFilterChange,
}) => {
  const availableEventTypes = useMemo(
    () => Array.from(new Set(events.map((event) => event.eventType))),
    [events],
  );

  const availableActors = useMemo(
    () => Array.from(new Set(events.map((event) => event.actor))),
    [events],
  );

  const appliedFilters: DocumentTimelineFilters = {
    eventTypes: filters?.eventTypes ?? availableEventTypes,
    actors: filters?.actors ?? [],
  };

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (left, right) =>
          new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
      ),
    [events],
  );

  const filteredEvents = useMemo(
    () =>
      sortedEvents.filter((event) => {
        const eventTypeMatch =
          appliedFilters.eventTypes.length === 0 ||
          appliedFilters.eventTypes.includes(event.eventType);

        const actorMatch =
          appliedFilters.actors.length === 0 ||
          appliedFilters.actors.includes(event.actor);

        return eventTypeMatch && actorMatch;
      }),
    [sortedEvents, appliedFilters.eventTypes, appliedFilters.actors],
  );

  const handleEventTypeToggle = (eventType: string) => (
    changeEvent: ChangeEvent<HTMLInputElement>,
  ) => {
    if (!onFilterChange) {
      return;
    }

    const isChecked = changeEvent.target.checked;
    const nextEventTypes = isChecked
      ? Array.from(new Set([...appliedFilters.eventTypes, eventType]))
      : appliedFilters.eventTypes.filter((value) => value !== eventType);

    onFilterChange({
      ...appliedFilters,
      eventTypes: nextEventTypes,
    });
  };

  const handleActorChange = (changeEvent: ChangeEvent<HTMLSelectElement>) => {
    if (!onFilterChange) {
      return;
    }

    const { value } = changeEvent.target;
    onFilterChange({
      ...appliedFilters,
      actors: value === 'all' ? [] : [value],
    });
  };

  const actorFilterValue =
    appliedFilters.actors.length === 1 ? appliedFilters.actors[0] : 'all';

  return (
    <section
      className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{entityType} timeline</h2>
          <p className="text-sm text-slate-500">Tracking updates for {entityId}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {availableEventTypes.length > 0 ? (
            <fieldset className="flex flex-wrap gap-2" aria-label="Event filters">
              {availableEventTypes.map((eventType) => {
                const checkboxId = `timeline-filter-${eventType}`;
                const label = formatEventTypeLabel(eventType);
                const checked = appliedFilters.eventTypes.includes(eventType);

                return (
                  <label
                    key={eventType}
                    htmlFor={checkboxId}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    <input
                      id={checkboxId}
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      checked={checked}
                      onChange={handleEventTypeToggle(eventType)}
                      aria-label={label}
                    />
                    {label}
                  </label>
                );
              })}
            </fieldset>
          ) : null}

          {availableActors.length > 1 ? (
            <div className="flex flex-col gap-1 text-xs">
              <label
                htmlFor="timeline-actor-filter"
                className="font-semibold uppercase tracking-wide text-slate-500"
              >
                Filter actors
              </label>
              <select
                id="timeline-actor-filter"
                value={actorFilterValue}
                onChange={handleActorChange}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              >
                <option value="all">All actors</option>
                {availableActors.map((actor) => (
                  <option key={actor} value={actor}>
                    {actor}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </header>

      <ol
        data-testid="document-timeline"
        role="list"
        aria-label={`${entityType} timeline`}
        className="space-y-4"
      >
        {filteredEvents.map((event) => {
          const formattedTimestamp = formatTimestamp(event.timestamp);
          const eventLabel = `${event.eventType} event on ${formattedTimestamp} by ${event.actor}`;

          return (
            <li
              key={event.eventId}
              role="listitem"
              tabIndex={0}
              data-testid="document-timeline-event"
              data-timestamp={event.timestamp}
              aria-label={eventLabel}
              className="relative rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                    {event.eventType}
                  </span>
                  <span>{formattedTimestamp}</span>
                </div>
                <span className="text-xs text-slate-500">{event.actor}</span>
              </div>
              <p className="mt-2 font-semibold text-slate-900">{event.summary}</p>
              {event.details ? (
                <p className="mt-1 text-sm text-slate-600">{event.details}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
