import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SharePlanModal } from '@/components/molecules/share-plan-modal';
import { LanguageProvider } from '@/i18n';
import type { PlanStopItem } from '@/lib/plan-context';

const stop: PlanStopItem = {
  placeId: 'coconut-park-cafe',
  name: 'Coconut Park Cafe',
  area: 'Chamkar Mon',
  image: 'https://example.com/cafe.webp',
  tags: [],
};

const writeText = vi.fn();
const originalNavigator = globalThis.navigator;

describe('SharePlanModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('tvna-language', 'en');
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { ...originalNavigator, clipboard: { writeText } },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  });

  it('shows a unique link, a view-only permission indicator, and copies it', async () => {
    render(
      <LanguageProvider>
        <SharePlanModal stops={[stop]} />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    expect(await screen.findByText(/share your plan/i)).toBeDefined();
    expect(screen.getByText(/view only/i)).toBeDefined();

    const link = screen.getByLabelText(/shareable link/i) as HTMLInputElement;
    expect(link.value).toContain('/shared/');

    fireEvent.click(screen.getByRole('button', { name: /copy link/i }));
    expect(writeText).toHaveBeenCalledWith(link.value);
  });
});
