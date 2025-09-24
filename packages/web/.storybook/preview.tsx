'use client';

import type { Decorator, Preview } from '@storybook/react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import '../src/app/globals.css';
import { Providers } from '../src/app/providers';

const SURFACE_LIGHT = 'hsl(0 0% 100%)';
const SURFACE_DARK = 'hsl(222 24% 10%)';
const ACCENT_SURFACE = 'hsl(37 95% 56%)';

type ThemeContainerProps = {
  theme: string;
  children: ReactNode;
};

const ThemeContainer = ({ theme, children }: ThemeContainerProps) => {
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {children}
    </div>
  );
};

const withGlobalProviders: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? 'light';

  return (
    <Providers>
      <ThemeContainer theme={theme}>
        <Story />
      </ThemeContainer>
    </Providers>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
    docs: {
      autodocs: true,
      toc: { headingSelector: 'h2, h3', disable: false },
    },
    backgrounds: {
      default: 'Surface',
      values: [
        { name: 'Surface', value: SURFACE_LIGHT },
        { name: 'Surface Dark', value: SURFACE_DARK },
        { name: 'Accent', value: ACCENT_SURFACE },
      ],
    },
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },
  },
  decorators: [withGlobalProviders],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Snowva design system theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
