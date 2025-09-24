import { defineConfig } from 'cypress';

export const VIEWPORT_PRESETS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
} as const;

export type ViewportPresetName = keyof typeof VIEWPORT_PRESETS;
export type ViewportPreset = (typeof VIEWPORT_PRESETS)[ViewportPresetName];

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'http://localhost:3000',
    specPattern: 'tests/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'tests/e2e/support/e2e.ts',
    viewportWidth: VIEWPORT_PRESETS.desktop.width,
    viewportHeight: VIEWPORT_PRESETS.desktop.height,
    env: {
      viewports: VIEWPORT_PRESETS,
      playwrightProjects: Object.entries(VIEWPORT_PRESETS).map(([name, viewport]) => ({
        name,
        use: { viewport },
      })),
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
