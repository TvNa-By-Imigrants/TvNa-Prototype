import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module.ts';

const ORIGIN = 'http://localhost:3000';
const POKEAPI_BASE_URL = process.env.POKEAPI_BASE_URL ?? 'https://pokeapi.co/api/v2';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

async function api<T>(
  base: string,
  path: string,
  cookie?: string,
): Promise<{ status: number; body: T }> {
  const res = await fetch(`${base}${path}`, {
    headers: {
      ...(cookie ? { cookie } : {}),
    },
  });
  return {
    status: res.status,
    body: (await res.json()) as T,
  };
}

async function signIn(base: string, email: string, password: string) {
  const res = await fetch(`${base}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN },
    body: JSON.stringify({ email, password }),
  });
  const cookie = (res.headers.getSetCookie?.() ?? [])
    .map((value) => value.split(';')[0])
    .join('; ');
  return { status: res.status, cookie };
}

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  assert(email && password, 'ADMIN_EMAIL and ADMIN_PASSWORD are required');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bodyParser: false, logger: false },
  );
  await app.listen({ port: 0, host: '127.0.0.1' });
  const address = app.getHttpAdapter().getInstance().server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const base = `http://127.0.0.1:${port}`;

  try {
    const anonymous = await api(base, '/api/pokemon/pikachu');
    assert(anonymous.status === 401, 'anonymous pokemon request should be 401');

    const login = await signIn(base, email, password);
    assert(login.status === 200, 'admin sign-in should succeed');

    const found = await api<{ name: string; types: string[] }>(
      base,
      '/api/pokemon/pikachu',
      login.cookie,
    );
    assert(found.body.name === 'pikachu', 'should return pikachu');
    assert(
      found.body.types.includes('electric'),
      'pikachu should be electric',
    );

    const missing = await api(
      base,
      '/api/pokemon/not-a-real-pokemon-xyz',
      login.cookie,
    );
    assert(missing.status === 404, 'missing pokemon should be 404');

    const page = await api<{ count: number; items: unknown[] }>(
      base,
      '/api/pokemon?limit=3&offset=0',
      login.cookie,
    );
    assert(
      page.body.items.length === 3,
      'pokemons should return the requested page size',
    );
    assert(
      page.body.count > 0,
      'pokemons should report a total count',
    );

    console.log(
      `[e2e-pokemon] PASS: ${POKEAPI_BASE_URL} — auth, lookup, 404, pagination`,
    );
  } finally {
    await app.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('[e2e-pokemon] FAIL:', error);
    process.exit(1);
  });
