import type { Store } from '../store/store';
import type { AuthUser, Organization, User } from '../types';
import { ApiError } from '../utils/ApiError';
import { createId } from '../utils/id';
import { signToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
import { recordAudit } from './audit.service';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  organizationName: string;
  email: string;
  password: string;
  name?: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

function toAuthUser(store: Store, user: User): AuthUser {
  const org = store.data.organizations.find((o) => o.id === user.organizationId);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: org?.name ?? 'Unknown Organization',
  };
}

function issue(store: Store, user: User): AuthResult {
  const authUser = toAuthUser(store, user);
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  });
  return { token, user: authUser };
}

export function login(store: Store, input: LoginInput): AuthResult {
  const email = input.email.trim().toLowerCase();
  const user = store.data.users.find((u) => u.email.toLowerCase() === email);
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  return issue(store, user);
}

export function register(store: Store, input: RegisterInput): AuthResult {
  const email = input.email.trim().toLowerCase();
  if (store.data.users.some((u) => u.email.toLowerCase() === email)) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const now = new Date().toISOString();
  const organization: Organization = {
    id: createId('org'),
    name: input.organizationName.trim(),
    plan: 'Basic',
    createdAt: now,
  };

  const user: User = {
    id: createId('user'),
    email,
    name: input.name?.trim() || input.organizationName.trim(),
    role: 'Business Owner',
    organizationId: organization.id,
    passwordHash: hashPassword(input.password),
    createdAt: now,
  };

  store.data.organizations.push(organization);
  store.data.users.push(user);
  store.data.customers.unshift({
    id: createId('cust'),
    name: organization.name,
    plan: 'Basic',
    status: 'Active',
    usagePercentage: 0,
    renewalDate: 'May 30, 2026',
    email,
  });
  recordAudit(
    store,
    { who: `${organization.name} (Business Owner)`, role: 'Business Owner' },
    `Registered new organization: ${organization.name}`
  );
  store.persist();

  return issue(store, user);
}
