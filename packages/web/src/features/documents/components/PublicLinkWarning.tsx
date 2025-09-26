'use client';

import React from 'react';
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  ShieldExclamationIcon, 
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';

interface PublicLinkWarningProps {
  /** The share link that was generated */
  shareLink: string;
  /** When the link expires (ISO timestamp) */
  expiresAt: string;
  /** Optional callback when user acknowledges the warning */
  onAcknowledge?: () => void;
  /** Whether to show in compact mode (for inline usage) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function PublicLinkWarning({
  shareLink,
  expiresAt,
  onAcknowledge,
  compact = false,
  className = ''
}: PublicLinkWarningProps) {
  const formatExpiryDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getDaysUntilExpiry = (isoString: string): number => {
    const expiry = new Date(isoString);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysUntilExpiry(expiresAt);
  const isExpiringSoon = daysRemaining <= 7;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm ${className}`}>
        <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="text-amber-800">
          Public link expires in <strong>{daysRemaining} days</strong>
        </span>
        {onAcknowledge && (
          <button
            onClick={onAcknowledge}
            className="ml-auto px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded border border-amber-300 transition-colors"
          >
            Got it
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-amber-800 mb-1">
              Public Share Link Created
            </h4>
            <p className="text-sm text-amber-700">
              Anyone with this link can view and download the document. Share responsibly.
            </p>
          </div>

          <div className="space-y-2 text-xs text-amber-700">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-3 h-3" />
              <span>
                Expires: <strong className={isExpiringSoon ? 'text-red-600' : ''}>{formatExpiryDate(expiresAt)}</strong>
                {isExpiringSoon && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                    {daysRemaining === 0 ? 'Expires today!' : `${daysRemaining} days left`}
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <ShieldExclamationIcon className="w-3 h-3" />
              <span>No password protection • Accessible to anyone with the link</span>
            </div>
            
            <div className="flex items-center gap-2">
              <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              <span>Link access will be logged for audit purposes</span>
            </div>
          </div>

          <div className="bg-white border border-amber-200 rounded p-2 font-mono text-xs text-gray-600 break-all">
            {shareLink}
          </div>

          {onAcknowledge && (
            <div className="flex justify-end">
              <button
                onClick={onAcknowledge}
                className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded border border-amber-700 transition-colors font-medium"
              >
                I understand the risks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicLinkWarning;