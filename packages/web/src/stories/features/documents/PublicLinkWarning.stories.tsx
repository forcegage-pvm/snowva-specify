import type { Meta, StoryObj } from '@storybook/react';

import { PublicLinkWarning } from '@/features/documents/components/PublicLinkWarning';

const meta: Meta<typeof PublicLinkWarning> = {
  title: 'Features/Documents/PublicLinkWarning',
  component: PublicLinkWarning,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
          The PublicLinkWarning component displays important security information when users generate or copy public share links.
          
          **Accessibility Features:**
          - High contrast warning colors for visibility
          - ARIA alert role for screen reader announcements
          - Clear, descriptive text for security implications
          - Keyboard accessible action buttons
          - Focus management for interactive elements
          
          **Key Features:**
          - Security warning with clear messaging
          - Expiration time display with countdown
          - Link sharing confirmation dialog
          - Auto-dismiss functionality with timer
          - Consistent warning iconography
          - Responsive design for mobile devices
          
          **Performance:**
          - Lightweight component with minimal re-renders
          - Efficient timer management for countdown
          - Optimized icon rendering
        `,
      },
    },
  },
  argTypes: {
    shareLink: {
      description: 'The share link that was generated',
      control: 'text',
    },
    expiresAt: {
      description: 'When the link expires (ISO timestamp)',
      control: 'text',
    },
    onAcknowledge: {
      description: 'Optional callback when user acknowledges the warning',
      action: 'onAcknowledge',
      table: { type: { summary: '() => void' } },
    },
    compact: {
      description: 'Whether to show in compact mode (for inline usage)',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    className: {
      description: 'Additional CSS classes for the warning container',
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default warning with standard expiration
export const Default: Story = {
  args: {
    shareLink: 'https://app.snowva.com/share/abc123def456',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    onAcknowledge: () => console.log('Warning acknowledged'),
  },
};

// Warning with short expiration (24 hours)
export const ShortExpiration: Story = {
  args: {
    shareLink: 'https://app.snowva.com/share/xyz789uvw012',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    onAcknowledge: () => console.log('Short expiration warning acknowledged'),
  },
};

// Warning with very short expiration (1 hour)
export const VeryShortExpiration: Story = {
  args: {
    shareLink: 'https://app.snowva.com/share/urgent123abc',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    onAcknowledge: () => console.log('Very short expiration warning acknowledged'),
  },
};

// Warning with extended expiration (30 days)
export const ExtendedExpiration: Story = {
  args: {
    shareLink: 'https://app.snowva.com/share/extended456def',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    onAcknowledge: () => console.log('Extended expiration warning acknowledged'),
  },
};

// Warning without acknowledge handler (display only)
export const DisplayOnly: Story = {
  args: {
    shareLink: 'https://app.snowva.com/share/confirm789ghi',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    // No onAcknowledge handler - display only mode
  },
};

// Warning with custom styling
export const CustomStyling: Story = {
  args: {
    shareLink: 'https://app.snowva.com/share/custom012jkl',
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
    onAcknowledge: () => console.log('Custom styled warning acknowledged'),
    className: 'border-2 border-red-500 bg-red-50',
  },
};

// Compact mode for inline usage
export const CompactMode: Story = {
  args: {
    shareLink: 'https://app.snowva.com/share/compact123xyz',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    onAcknowledge: () => console.log('Compact warning acknowledged'),
    compact: true,
  },
};

// Accessibility demonstration
export const AccessibilityDemo: Story = {
  args: {
    shareLink: 'https://app.snowva.com/share/access345mno',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    onAcknowledge: () => console.log('Accessibility demo warning acknowledged'),
  },
  parameters: {
    docs: {
      description: {
        story: `
          This story demonstrates all accessibility features:
          - Use Tab to navigate between action buttons
          - Use Enter/Space to activate buttons
          - Screen readers will announce the warning with ARIA alert role
          - High contrast colors ensure visibility
          - Clear, descriptive text explains security implications
          - Focus indicators are clearly visible
          - Text scales properly for users with visual impairments
        `,
      },
    },
  },
};

// Edge case: Very long URL
export const LongUrl: Story = {
  args: {
    shareLink: 'https://app.snowva.com/share/very-long-token-that-might-cause-layout-issues-in-some-circumstances-abc123def456ghi789',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    onAcknowledge: () => console.log('Long URL warning acknowledged'),
  },
};