import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    DocumentTimeline,
    type DocumentTimelineEvent,
    type DocumentTimelineFilters,
} from '@/features/shared/components/DocumentTimeline';

const buildEvents = (): DocumentTimelineEvent[] => [
  {
    eventId: 'evt-3',
    timestamp: '2024-09-05T09:45:00Z',
    eventType: 'email',
    actor: 'Jenny Smith',
    summary: 'Statement emailed to finance team',
    details: 'Sent via automated notification workflow.',
  },
  {
    eventId: 'evt-2',
    timestamp: '2024-09-02T14:10:00Z',
    eventType: 'status-change',
    actor: 'David Singh',
    summary: 'Invoice INV-2001 marked as Finalized',
    details: 'Locked edits and queued payment reminder.',
  },
  {
    eventId: 'evt-1',
    timestamp: '2024-09-01T08:00:00Z',
    eventType: 'created',
    actor: 'Melissa Jacobs',
    summary: 'Quote QTE-502 created for Holdsport Retail',
    details: 'Generated from seasonal pricing template.',
  },
];

describe('DocumentTimeline', () => {
  it('renders document events in reverse chronological order with actor details', () => {
    const events = buildEvents();

    render(
      <DocumentTimeline
        entityId="INV-2001"
        entityType="Invoice"
        events={events}
      />,
    );

    const timeline = screen.getByTestId('document-timeline');
    expect(timeline).toHaveAttribute('role', 'list');

    const renderedEvents = screen.getAllByTestId('document-timeline-event');
    expect(renderedEvents).toHaveLength(3);
    expect(renderedEvents[0]).toHaveTextContent('Statement emailed to finance team');
    expect(renderedEvents[0]).toHaveAttribute('data-timestamp', '2024-09-05T09:45:00Z');
    expect(renderedEvents[1]).toHaveTextContent('Invoice INV-2001 marked as Finalized');
    expect(renderedEvents[2]).toHaveTextContent('Quote QTE-502 created for Holdsport Retail');
    expect(renderedEvents[2]).toHaveAttribute('aria-label', expect.stringContaining('created'));
  });

  it('surfaces filter controls and calls onFilterChange when a filter chip toggles', () => {
    const events = buildEvents();
    const filters: DocumentTimelineFilters = {
      eventTypes: ['email', 'status-change', 'created'],
      actors: [],
    };
    const handleFilterChange = jest.fn();

    render(
      <DocumentTimeline
        entityId="INV-2001"
        entityType="Invoice"
        events={events}
        filters={filters}
        onFilterChange={handleFilterChange}
      />,
    );

    const filterChip = screen.getByRole('checkbox', { name: /Email events/i });
    fireEvent.click(filterChip);

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ eventTypes: expect.not.arrayContaining(['email']) }),
    );
  });

  it('provides accessible roles for each timeline event', () => {
    render(
      <DocumentTimeline
        entityId="INV-2001"
        entityType="Invoice"
        events={buildEvents()}
      />,
    );

    const list = screen.getByRole('list', { name: /Invoice timeline/i });
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    items.forEach((item) => {
      expect(item).toHaveAttribute('tabindex', '0');
    });
  });
});
