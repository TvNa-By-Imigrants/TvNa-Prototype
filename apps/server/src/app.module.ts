import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DrizzleModule } from '@nest-native/drizzle';
import { AuthModule } from '@thallesp/nestjs-better-auth';

import { schema } from './db/schema.ts';
import { createDatabase, pool, type AppDatabase } from './database.ts';
import { auth } from './auth.ts';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.ts';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.ts';
import { SessionRevocationInterceptor } from './common/interceptors/session-revocation.interceptor.ts';
import { HealthModule } from './modules/health/health.module.ts';
import { AppAuthModule } from './modules/auth/auth.module.ts';
import { PingModule } from './modules/ping/ping.module.ts';
import { UsersModule } from './modules/users/users.module.ts';
import { MeModule } from './modules/me/me.module.ts';
import { PokemonModule } from './modules/pokemon/pokemon.module.ts';

@Module({
  imports: [
    DrizzleModule.forRoot<AppDatabase>({
      schema,
      connection: createDatabase(),
      shutdown: () => pool.end(),
    }),
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: '2mb' },
        urlencoded: { limit: '2mb', extended: true },
        rawBody: true,
      },
    }),
    HealthModule,
    AppAuthModule,
    PingModule,
    UsersModule,
    MeModule,
    PokemonModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SessionRevocationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
