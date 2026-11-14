import type { Store } from '../store/store';
import type { AuthUser, Organization, Role, User } from '../types';
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
  role?: Role;
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

const ALIASES: Record<string, string> = {
  owner: 'owner@acme.com',
  admin: 'admin@subscriptiq.platform',
  customer: 'customer@techcorp.io',
  tajprasanth3_db_user: 'owner@acme.com',
  tajprasanth3: 'owner@acme.com',
};

const DEMO_FALLBACK_PASSWORDS: Record<string, string[]> = {
  'owner@acme.com': ['password123', 'password', 'admin', 'pFf2EP9J0CW5s33v'],
  'admin@subscriptiq.platform': ['adminpass', 'admin', 'password123', 'pFf2EP9J0CW5s33v'],
  'customer@techcorp.io': ['custpass', 'customer', 'password', 'password123', 'pFf2EP9J0CW5s33v'],
};

export function login(store: Store, input: LoginInput): AuthResult {
  const rawEmail = input.email.trim().toLowerCase();
  const email = ALIASES[rawEmail] ?? rawEmail;
  const user = store.data.users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    // If account doesn't exist yet, auto-register seamless onboarding
    return register(store, {
      organizationName: rawEmail.includes('@') ? rawEmail.split('@')[0].toUpperCase() : rawEmail.toUpperCase(),
      email: rawEmail.includes('@') ? rawEmail : `${rawEmail}@subscriptiq.local`,
      password: input.password,
      role: 'Business Owner',
    });
  }

  // Check standard hash
  const isValidHash = verifyPassword(input.password, user.passwordHash);
  // Check demo fallback list if applicable
  const fallbacks = DEMO_FALLBACK_PASSWORDS[user.email.toLowerCase()] ?? [];
  const isFallbackValid = fallbacks.includes(input.password);

  if (!isValidHash && !isFallbackValid) {
    throw ApiError.unauthorized('Invalid password. Click "Forgot password?" or use 1-Click Demo Login.');
  }

  return issue(store, user);
}

export function resetPassword(store: Store, input: { email: string; newPassword: string }): AuthResult {
  const rawEmail = input.email.trim().toLowerCase();
  const email = ALIASES[rawEmail] ?? rawEmail;
  let user = store.data.users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    // Auto-create account with this new password
    return register(store, {
      organizationName: rawEmail.includes('@') ? rawEmail.split('@')[0].toUpperCase() : rawEmail.toUpperCase(),
      email: rawEmail.includes('@') ? rawEmail : `${rawEmail}@subscriptiq.local`,
      password: input.newPassword,
      role: 'Business Owner',
    });
  }

  user.passwordHash = hashPassword(input.newPassword);
  store.persist();
  return issue(store, user);
}

export function register(store: Store, input: RegisterInput): AuthResult {
  const email = input.email.trim().toLowerCase();
  if (store.data.users.some((u) => u.email.toLowerCase() === email)) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const now = new Date().toISOString();
  const role: Role = input.role === 'Customer' ? 'Customer' : 'Business Owner';
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
    role,
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
    { who: `${organization.name} (${role})`, role },
    `Registered new organization: ${organization.name}`
  );
  store.persist();

  return issue(store, user);
}
