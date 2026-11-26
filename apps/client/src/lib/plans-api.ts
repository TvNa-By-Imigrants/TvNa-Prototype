import {
  planInputSchema,
  planSchema,
  plansListSchema,
  type Plan,
  type PlanInput,
  type PlansList,
} from '@repo/contracts';
import { apiRequest } from './api';

function parsePlanResponse(response: unknown): Plan {
  const parsed = planSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error('The server returned an unexpected plan payload');
  }
  return parsed.data;
}

function parsePlanInput(input: PlanInput): PlanInput {
  const parsed = planInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Invalid plan data');
  }
  return parsed.data;
}

export async function fetchPlans(): Promise<PlansList> {
  const response = await apiRequest<unknown>('/api/v1/plans');
  const parsed = plansListSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error('The server returned an unexpected plans payload');
  }
  return parsed.data;
}

export async function fetchPlanById(id: string): Promise<Plan> {
  const response = await apiRequest<{ plan: unknown }>(
    `/api/v1/plans/${encodeURIComponent(id)}`,
  );
  return parsePlanResponse(response?.plan);
}

export async function createPlan(input: PlanInput): Promise<Plan> {
  const response = await apiRequest<{ plan: unknown }>('/api/v1/plans', {
    method: 'POST',
    body: parsePlanInput(input),
  });
  return parsePlanResponse(response?.plan);
}

export async function updatePlan(
  id: string,
  input: PlanInput,
): Promise<Plan> {
  const response = await apiRequest<{ plan: unknown }>(
    `/api/v1/plans/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: parsePlanInput(input),
    },
  );
  return parsePlanResponse(response?.plan);
}

export async function deletePlan(id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/plans/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
