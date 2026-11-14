import { z } from 'zod';

const roleEnum = z.enum(['Business Owner', 'Super Admin', 'Customer']);
const subscriptionStatusEnum = z.enum([
  'plan_selected',
  'active',
  'renewal_due',
  'past_due',
  'cancelled',
]);
const customerStatusEnum = z.enum(['Active', 'Near limit', 'Suspended', 'Pending']);

export const idParamSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  role: roleEnum.optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  newPassword: z.string().min(4, 'New password must be at least 4 characters'),
});

export const registerSchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required'),
  email: z.string().email('A valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2).optional(),
  mobile: z.string().optional(),
  role: z.enum(['Business Owner', 'Customer']).optional(),
});

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  price: z.coerce.number().min(0, 'Price must be zero or greater'),
  currency: z.string().min(1).default('₹'),
  billingInterval: z.enum(['month', 'year']).default('month'),
  description: z.string().min(1, 'Description is required'),
  badge: z.string().optional(),
  apiLimit: z.string().min(1, 'API limit is required'),
  storageLimit: z.string().min(1, 'Storage limit is required'),
  features: z.array(z.string()).default([]),
  isCurrent: z.boolean().optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

export const changePlanSchema = z.object({
  plan: z.string().min(1, 'Plan tier is required'),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
});

export const updateSubscriptionStatusSchema = z.object({
  status: subscriptionStatusEnum,
});

export const ingestEventSchema = z.object({
  id: z.string().min(1, 'Event id is required'),
  customer: z.string().min(1, 'Customer is required'),
  resource: z.string().min(1, 'Resource is required'),
  quantity: z.union([z.number(), z.string()]).optional(),
  timestamp: z.string().optional(),
});

export const simulateIngestionSchema = z.object({
  duplicate: z.boolean().optional().default(false),
  count: z.coerce.number().int().min(1).max(100).optional().default(1),
});

export const usageEventsQuerySchema = paginationSchema.extend({
  tab: z.enum(['all', 'accepted', 'duplicate', 'rejected']).optional().default('all'),
  search: z.string().optional().default(''),
});

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  email: z.string().email('A valid email is required'),
  mobile: z.string().optional(),
  plan: z.string().min(1, 'Plan tier is required'),
  status: customerStatusEnum.default('Active'),
  usagePercentage: z.coerce.number().min(0).max(100).optional(),
  renewalDate: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const updateCustomerStatusSchema = z.object({
  status: customerStatusEnum,
});

export const updateAlertRulesSchema = z.object({
  firstAlertPercentage: z.coerce.number().min(1).max(100),
  secondAlertPercentage: z.coerce.number().min(1).max(150),
  actionOnExceed: z.enum(['notify_only', 'charge_overage', 'block_usage']),
});

export const testAlertSchema = z.object({
  message: z.string().min(1).max(280).optional(),
});

export const customersQuerySchema = paginationSchema.extend({
  search: z.string().optional().default(''),
  status: customerStatusEnum.optional(),
});

export const invoicesQuerySchema = paginationSchema.extend({
  search: z.string().optional().default(''),
});

export const auditLogsQuerySchema = paginationSchema.extend({
  search: z.string().optional().default(''),
});
