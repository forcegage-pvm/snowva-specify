/// <reference types="cypress" />

import '@testing-library/cypress/add-commands';

import type {
    ViewportPreset,
    ViewportPresetName,
} from '../../../cypress.config';

const VIEWPORT_PRESETS: Record<ViewportPresetName, ViewportPreset> =
  Cypress.env('viewports') ?? {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 1024, height: 768 },
    mobile: { width: 390, height: 844 },
  };

Cypress.Commands.add('viewportPreset', (preset: ViewportPresetName) => {
  const config = VIEWPORT_PRESETS[preset];

  if (!config) {
    throw new Error(`Unknown viewport preset: ${preset}`);
  }

  cy.viewport(config.width, config.height);
});

export { VIEWPORT_PRESETS };

declare global {
  namespace Cypress {
    interface Chainable {
      viewportPreset(preset: ViewportPresetName): Chainable<void>;
    }
  }
}
