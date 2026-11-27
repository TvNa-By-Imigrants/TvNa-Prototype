import { describe, expect, it } from 'vitest';
import { createShareUrl } from '@/lib/share-plan';

describe('share-plan', () => {
  it('creates a public URL for the server-generated token', () => {
    expect(createShareUrl('server-token', 'https://example.com')).toBe(
      'https://example.com/shared/server-token',
    );
  });
});
