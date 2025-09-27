/**
 * Quote Timeline Component with Fast Refresh Optimization
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD005: Fast Refresh optimization
 * Implements React.memo and optimized rendering patterns
 */

'use client';

import { QuoteErrorBoundary } from '@/components/common/ErrorBoundary';
import { InlineLoadingState, TimelineLoadingState } from '@/components/common/LoadingStates';
import { TimelineEvent, TimelineEventType } from '@/types/timeline';
import {
    AlertCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    FileTextIcon,
    MessageSquareIcon,
    RefreshCwIcon,
    UploadIcon,
    XCircleIcon
} from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

interface QuoteTimelineProps {
  quoteId: string;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface TimelineEventItemProps {
  event: TimelineEvent;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * Timeline Event Icon Component
 * Memoized to prevent unnecessary re-renders
 */
const TimelineEventIcon = memo<{ type: TimelineEventType }>(({ type }) => {
  const iconConfig = useMemo(() => {
    switch (type) {
      case TimelineEventType.QUOTE_CREATED:
        return { icon: FileTextIcon, color: 'text-blue-600 bg-blue-100' };
      case TimelineEventType.QUOTE_UPDATED:
        return { icon: RefreshCwIcon, color: 'text-yellow-600 bg-yellow-100' };
      case TimelineEventType.QUOTE_SENT:
        return { icon: UploadIcon, color: 'text-purple-600 bg-purple-100' };
      case TimelineEventType.QUOTE_ACCEPTED:
        return { icon: CheckCircleIcon, color: 'text-green-600 bg-green-100' };
      case TimelineEventType.QUOTE_REJECTED:
        return { icon: XCircleIcon, color: 'text-red-600 bg-red-100' };
      case TimelineEventType.QUOTE_CONVERTED:
        return { icon: RefreshCwIcon, color: 'text-indigo-600 bg-indigo-100' };
      case TimelineEventType.COMMENT_ADDED:
        return { icon: MessageSquareIcon, color: 'text-gray-600 bg-gray-100' };
      case TimelineEventType.FILE_UPLOADED:
        return { icon: UploadIcon, color: 'text-blue-600 bg-blue-100' };
      case TimelineEventType.STATUS_CHANGED:
        return { icon: AlertCircleIcon, color: 'text-orange-600 bg-orange-100' };
      case TimelineEventType.SYSTEM_EVENT:
      default:
        return { icon: ClockIcon, color: 'text-gray-600 bg-gray-100' };
    }
  }, [type]);

  const Icon = iconConfig.icon;

  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${iconConfig.color}`}>
      <Icon className="w-5 h-5" aria-hidden="true" />
    </div>
  );
});

TimelineEventIcon.displayName = 'TimelineEventIcon';

/**
 * Timeline Event User Avatar Component
 * Memoized for performance
 */
const TimelineUserAvatar = memo<{
  userDisplayName: string;
  userAvatarUrl?: string;
}>(({ userDisplayName, userAvatarUrl }) => {
  const initials = useMemo(() => {
    return userDisplayName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, [userDisplayName]);

  if (userAvatarUrl) {
    return (
      <img
        src={userAvatarUrl}
        alt={userDisplayName}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
      <span className="text-xs font-medium text-gray-600">{initials}</span>
    </div>
  );
});

TimelineUserAvatar.displayName = 'TimelineUserAvatar';

/**
 * Timeline Event Metadata Component
 * Memoized to prevent unnecessary re-renders
 */
const TimelineEventMetadata = memo<{
  metadata?: Record<string, unknown>;
}>(({ metadata }) => {
  const displayMetadata = useMemo(() => {
    if (!metadata || Object.keys(metadata).length === 0) return null;

    // Filter and format relevant metadata
    const relevantKeys = ['previousValue', 'newValue', 'reason', 'fileName', 'fileSize'];
    const filteredMetadata = Object.entries(metadata)
      .filter(([key]) => relevantKeys.includes(key))
      .map(([key, value]) => ({
        key: key.replace(/([A-Z])/g, ' $1').toLowerCase(),
        value: String(value),
      }));

    return filteredMetadata.length > 0 ? filteredMetadata : null;
  }, [metadata]);

  if (!displayMetadata) return null;

  return (
    <div className="mt-2 text-xs text-gray-500 space-y-1">
      {displayMetadata.map(({ key, value }) => (
        <div key={key} className="flex">
          <span className="font-medium capitalize">{key}:</span>
          <span className="ml-1 truncate">{value}</span>
        </div>
      ))}
    </div>
  );
});

TimelineEventMetadata.displayName = 'TimelineEventMetadata';

/**
 * Individual Timeline Event Item Component
 * Memoized to prevent unnecessary re-renders
 */
const TimelineEventItem = memo<TimelineEventItemProps>(({ event, isFirst, isLast }) => {
  const formattedTimestamp = useMemo(() => {
    const date = new Date(event.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }, [event.timestamp]);

  return (
    <div className="flex space-x-4">
      {/* Timeline connector and icon */}
      <div className="flex flex-col items-center">
        <TimelineEventIcon type={event.type} />
        {!isLast && <div className="flex-1 w-0.5 bg-gray-200 mt-2" style={{ minHeight: '2rem' }} />}
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-center space-x-2 mb-1">
          <TimelineUserAvatar 
            userDisplayName={event.userDisplayName}
            userAvatarUrl={event.userAvatarUrl}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {event.userDisplayName}
            </p>
            <p className="text-xs text-gray-500">{formattedTimestamp}</p>
          </div>
        </div>

        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            {event.title}
          </h4>
          {event.description && (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {event.description}
            </p>
          )}
          <TimelineEventMetadata metadata={event.metadata} />
        </div>
      </div>
    </div>
  );
});

TimelineEventItem.displayName = 'TimelineEventItem';

/**
 * Timeline Filter Component
 * Memoized to prevent unnecessary re-renders
 */
const TimelineFilters = memo<{
  selectedTypes: TimelineEventType[];
  onTypesChange: (types: TimelineEventType[]) => void;
}>(({ selectedTypes, onTypesChange }) => {
  const eventTypeOptions = useMemo(() => [
    { value: TimelineEventType.QUOTE_CREATED, label: 'Created' },
    { value: TimelineEventType.QUOTE_UPDATED, label: 'Updated' },
    { value: TimelineEventType.QUOTE_SENT, label: 'Sent' },
    { value: TimelineEventType.QUOTE_ACCEPTED, label: 'Accepted' },
    { value: TimelineEventType.QUOTE_REJECTED, label: 'Rejected' },
    { value: TimelineEventType.QUOTE_CONVERTED, label: 'Converted' },
    { value: TimelineEventType.COMMENT_ADDED, label: 'Comments' },
    { value: TimelineEventType.FILE_UPLOADED, label: 'Files' },
    { value: TimelineEventType.STATUS_CHANGED, label: 'Status Changes' },
    { value: TimelineEventType.SYSTEM_EVENT, label: 'System Events' },
  ], []);

  const handleTypeToggle = useCallback((type: TimelineEventType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  }, [selectedTypes, onTypesChange]);

  const handleSelectAll = useCallback(() => {
    onTypesChange(eventTypeOptions.map(option => option.value));
  }, [eventTypeOptions, onTypesChange]);

  const handleSelectNone = useCallback(() => {
    onTypesChange([]);
  }, [onTypesChange]);

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Filter Events</h3>
        <div className="space-x-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleSelectNone}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {eventTypeOptions.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleTypeToggle(option.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedTypes.includes(option.value)
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
});

TimelineFilters.displayName = 'TimelineFilters';

/**
 * Main Quote Timeline Component
 * Optimized for Fast Refresh compatibility with React.memo
 */
const QuoteTimeline: React.FC<QuoteTimelineProps> = ({
  quoteId,
  className = '',
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}) => {
  // State management
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<TimelineEventType[]>(
    Object.values(TimelineEventType)
  );

  // Memoized filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(event => selectedTypes.includes(event.type));
  }, [events, selectedTypes]);

  // Stable fetch function
  const fetchTimeline = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Mock API call - in real implementation, this would call the timeline service
      const mockEvents: TimelineEvent[] = [
        {
          id: '1',
          type: TimelineEventType.QUOTE_CREATED,
          title: 'Quote created',
          description: 'Quote was created with 3 items',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          userId: 'user1',
          userDisplayName: 'John Doe',
          userAvatarUrl: undefined,
          metadata: { itemCount: 3 },
        },
        {
          id: '2',
          type: TimelineEventType.QUOTE_UPDATED,
          title: 'Quote updated',
          description: 'Updated quote items and pricing',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          userId: 'user1',
          userDisplayName: 'John Doe',
          metadata: { fieldsChanged: ['items', 'total'] },
        },
        {
          id: '3',
          type: TimelineEventType.QUOTE_SENT,
          title: 'Quote sent to customer',
          description: 'Quote was sent via email to customer',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          userId: 'user2',
          userDisplayName: 'Jane Smith',
          metadata: { method: 'email', recipient: 'customer@example.com' },
        },
      ];

      setEvents(mockEvents);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch timeline'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (quoteId) {
      fetchTimeline();
    }
  }, [quoteId, fetchTimeline]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && !loading && !refreshing && quoteId) {
      const interval = setInterval(() => {
        fetchTimeline(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loading, refreshing, quoteId, fetchTimeline]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    fetchTimeline(true);
  }, [fetchTimeline]);

  // Filter change handler
  const handleFilterChange = useCallback((types: TimelineEventType[]) => {
    setSelectedTypes(types);
  }, []);

  // Error handling
  if (error) {
    throw error; // Will be caught by error boundary
  }

  // Loading state
  if (loading) {
    return <TimelineLoadingState className={className} />;
  }

  return (
    <QuoteErrorBoundary operation="preview" quoteId={quoteId}>
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Quote Timeline</h2>
            </div>
            <div className="flex items-center space-x-3">
              {refreshing && <InlineLoadingState message="Refreshing..." size="sm" />}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                aria-label="Refresh timeline"
              >
                <RefreshCwIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <TimelineFilters
            selectedTypes={selectedTypes}
            onTypesChange={handleFilterChange}
          />

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {events.length === 0 
                  ? 'No timeline events found'
                  : 'No events match the selected filters'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredEvents.map((event, index) => (
                <TimelineEventItem
                  key={event.id}
                  event={event}
                  isFirst={index === 0}
                  isLast={index === filteredEvents.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </QuoteErrorBoundary>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default memo(QuoteTimeline);