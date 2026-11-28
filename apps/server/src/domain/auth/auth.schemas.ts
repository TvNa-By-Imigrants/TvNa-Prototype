import {
  LoginInputSchema as ContractLoginInputSchema,
  type LoginInput as ContractLoginInput,
} from '@repo/contracts';

export const LoginInputSchema = ContractLoginInputSchema;
export type LoginInputSchema = ContractLoginInput;
export type LoginInput = ContractLoginInput;

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly roles: string[];
  readonly permissions: string[];
}
