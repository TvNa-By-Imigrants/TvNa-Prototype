import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it, vi } from 'vitest';
import { PlansService } from '../../../../src/modules/plans/plans.service.ts';
import { runEffectResult } from '../../../support/effect-test.ts';

const dialect = new PgDialect();

describe('PlansService ownership', () => {
  it('scopes plan reads to the authenticated owner', async () => {
    const db = { execute: vi.fn().mockResolvedValue({ rows: [] }) };
    const service = new PlansService(db as never);

    const result = await runEffectResult(service.getById('user-1', 'plan-1'));
    const query = dialect.sqlToQuery(db.execute.mock.calls[0]![0]!);

    expect(result).toMatchObject({
      _tag: 'Failure',
      failure: { code: 'NOT_FOUND', statusCode: 404 },
    });
    expect(query.sql).toContain('where p.user_id = $1 and p.id = $2');
    expect(query.params).toEqual(['user-1', 'plan-1']);
  });

  it('scopes plan deletion to the authenticated owner', async () => {
    const db = { execute: vi.fn().mockResolvedValue({ rows: [] }) };
    const service = new PlansService(db as never);

    const result = await runEffectResult(service.delete('user-1', 'plan-1'));
    const query = dialect.sqlToQuery(db.execute.mock.calls[0]![0]!);

    expect(result).toMatchObject({
      _tag: 'Failure',
      failure: { code: 'NOT_FOUND', statusCode: 404 },
    });
    expect(query.sql).toContain('where id = $1 and user_id = $2');
    expect(query.params).toEqual(['plan-1', 'user-1']);
  });
});
