import path from 'path';

import type { StorybookConfig } from '@storybook/react-webpack5';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  webpackFinal: async (config) => {
    config.module?.rules?.push({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              require.resolve('next/babel'),
              require.resolve('@babel/preset-typescript'),
            ],
          },
        },
      ],
    });

    if (!config.resolve) {
      config.resolve = {};
    }

    if (!config.resolve.extensions) {
      config.resolve.extensions = ['.mjs', '.js', '.jsx', '.json'];
    }

    if (!config.resolve.extensions.includes('.ts')) {
      config.resolve.extensions.push('.ts');
    }

    if (!config.resolve.extensions.includes('.tsx')) {
      config.resolve.extensions.push('.tsx');
    }

    const existingPlugins = config.resolve.plugins ?? [];
    existingPlugins.push(
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, '../tsconfig.json'),
      }),
    );
    config.resolve.plugins = existingPlugins;

    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      'next/navigation': path.resolve(__dirname, './mocks/nextNavigation.ts'),
    };

    return config;
  },
};

export default config;
