import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SharePlanModal } from '@/components/molecules/share-plan-modal';
import { LanguageProvider } from '@/i18n';
import { sharePlan } from '@/lib/plans-api';

vi.mock('@/lib/plans-api', () => ({
  sharePlan: vi.fn(),
}));

const writeText = vi.fn();
const originalNavigator = globalThis.navigator;
const mockedSharePlan = vi.mocked(sharePlan);

function renderShareModal(planId: string | null = 'plan-1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SharePlanModal planId={planId} />
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('SharePlanModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSharePlan.mockResolvedValue({ token: 'a'.repeat(43) });
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

  it('generates a public link for the saved plan and copies it', async () => {
    renderShareModal();

    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    expect(await screen.findByText(/share your plan/i)).toBeDefined();
    expect(screen.getByText(/view only/i)).toBeDefined();

    const link = screen.getByLabelText(/shareable link/i) as HTMLInputElement;
    expect(await screen.findByDisplayValue(/\/shared\/a{43}$/)).toBeDefined();
    expect(link.value).toBe(`${window.location.origin}/shared/${'a'.repeat(43)}`);
    expect(mockedSharePlan.mock.calls[0]?.[0]).toBe('plan-1');

    fireEvent.click(screen.getByRole('button', { name: /copy link/i }));
    expect(writeText).toHaveBeenCalledWith(link.value);

    fireEvent.click(screen.getByRole('button', { name: /close detail/i }));
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    expect(await screen.findByDisplayValue(link.value)).toBeDefined();
    expect(mockedSharePlan).toHaveBeenCalledTimes(1);
  });

  it('explains that a plan must be saved before generating a link', async () => {
    renderShareModal(null);

    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    expect(await screen.findByText(/save this plan before generating/i)).toBeDefined();
    expect(mockedSharePlan).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /copy link/i })).toHaveProperty(
      'disabled',
      true,
    );
  });
});
