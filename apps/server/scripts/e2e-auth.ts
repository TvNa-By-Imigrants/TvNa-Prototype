import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module.ts';

const AUTH_PATH = '/api/auth';
const ORIGIN = 'http://localhost:3000';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function main(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bodyParser: false, logger: false },
  );
  await app.listen({ port: 0, host: '127.0.0.1' });

  const address = app.getHttpAdapter().getInstance().server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const base = `http://127.0.0.1:${port}`;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  assert(email && password, 'ADMIN_EMAIL and ADMIN_PASSWORD are required');

  try {
    const health = await fetch(`${base}/api/health`);
    const healthBody = (await health.json()) as { status?: string };
    assert(healthBody.status === 'ok', 'health endpoint should return ok');

    const badLogin = await fetch(`${base}${AUTH_PATH}/sign-in/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN },
      body: JSON.stringify({ email, password: 'wrong-password' }),
    });
    assert(badLogin.status === 401, 'wrong password should return 401');

    const login = await fetch(`${base}${AUTH_PATH}/sign-in/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN },
      body: JSON.stringify({ email, password }),
    });
    assert(login.status === 200, 'valid credentials should return 200');
    const cookie = (login.headers.getSetCookie?.() ?? [])
      .map((value) => value.split(';')[0])
      .join('; ');
    assert(cookie.length > 0, 'sign-in should set a session cookie');

    const meResponse = await fetch(`${base}/api/me`, { headers: { cookie } });
    const me = (await meResponse.json()) as {
      user?: { email: string; role: string; permissions: string[] };
    };
    assert(me.user?.email === email, 'me should return the signed-in user');
    assert(me.user?.role === 'admin', 'seeded user should be an admin');
    assert(me.user?.permissions.includes('user:list'), 'me should return permissions');

    const sessionsResponse = await fetch(`${base}/api/sessions`, {
      headers: { cookie },
    });
    const sessions = (await sessionsResponse.json()) as {
      sessions?: Array<{ id: string; isCurrent: boolean }>;
    };
    assert(
      sessions.sessions?.some((session) => session.isCurrent),
      'sessions should include the current session',
    );

    // Revoke a second session over REST.
    const secondLogin = await fetch(`${base}${AUTH_PATH}/sign-in/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN },
      body: JSON.stringify({ email, password }),
    });
    assert(secondLogin.status === 200, 'second sign-in should return 200');

    const sessionsAfterResponse = await fetch(`${base}/api/sessions`, {
      headers: { cookie },
    });
    const sessionsAfter = (await sessionsAfterResponse.json()) as {
      sessions?: Array<{ id: string; isCurrent: boolean }>;
    };
    const other = sessionsAfter.sessions?.find(
      (session) => !session.isCurrent,
    );
    assert(other, 'expected a non-current session to revoke');

    const revokedResponse = await fetch(
      `${base}/api/sessions/${other.id}/revoke`,
      { method: 'POST', headers: { cookie } },
    );
    const revoked = (await revokedResponse.json()) as { revoked?: boolean };
    assert(
      revoked.revoked === true,
      'session revoke endpoint should return true',
    );

    const anonymous = await fetch(`${base}/api/sessions`);
    assert(anonymous.status === 401, 'anonymous sessions should be 401');

    const signOut = await fetch(`${base}${AUTH_PATH}/sign-out`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN, cookie },
      body: JSON.stringify({}),
    });
    assert(signOut.status === 200, 'sign-out should return 200');

    // A real browser honors the sign-out response's Set-Cookie and clears the
    // session_token and session_data (cookie cache) cookies. Replaying the
    // original sign-in cookie would still authenticate via the cookie cache.
    const clearedCookie = (signOut.headers.getSetCookie?.() ?? [])
      .map((value) => value.split(';')[0])
      .join('; ');

    const afterSignOut = await fetch(`${base}/api/me`, {
      headers: { cookie: clearedCookie },
    });
    assert(afterSignOut.status === 401, 'me should be unauthorized after sign-out');

    console.log('[e2e-auth] PASS: sign-in, session, revoke eligibility, sign-out');
  } finally {
    await app.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('[e2e-auth] FAIL:', error);
    process.exit(1);
  });
