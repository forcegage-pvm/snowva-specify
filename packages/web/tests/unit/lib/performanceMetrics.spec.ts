import { jest } from '@jest/globals';

import {
    recordNavigationMetric,
    registerPerformanceMetricListener,
    startListLoadTimer,
} from '@/lib/metrics/performanceMetrics';

describe('performanceMetrics', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('marks list load metrics as warn when exceeding the 2s SLA', () => {
    const listener = jest.fn();
    const unsubscribe = registerPerformanceMetricListener(listener);

    const nowSpy = jest.spyOn(performance, 'now');
    nowSpy.mockReturnValueOnce(10_000);
    nowSpy.mockReturnValueOnce(12_250);

    const timer = startListLoadTimer('Customer directory');
    const metric = timer.end({ itemCount: 150 });

    expect(metric).toBeDefined();
    expect(metric?.status).toBe('warn');
    expect(metric?.thresholdMs).toBe(2_000);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'list-load',
        label: 'Customer directory',
        durationMs: 2_250,
        itemCount: 150,
        status: 'warn',
      }),
    );

    unsubscribe();
  });

  it('records navigation metrics as pass when under 500ms', () => {
    const listener = jest.fn();
    const unsubscribe = registerPerformanceMetricListener(listener);

    const metric = recordNavigationMetric({
      name: 'quote-to-invoice',
      durationMs: 420,
      metadata: { route: '/sales/quote/preview' },
    });

    expect(metric.status).toBe('pass');
    expect(metric.thresholdMs).toBe(500);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'navigation',
        name: 'quote-to-invoice',
        durationMs: 420,
        status: 'pass',
      }),
    );

    unsubscribe();
  });
});
