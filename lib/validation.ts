import { z } from 'zod';

/**
 * Sanitizes input strings by stripping potential HTML tags and dangerous scripts (XSS Protection)
 */
export function sanitizeInput(text: string): string {
  if (!text) return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onload=/gi, '')
    .trim();
}

/**
 * Checkout Form Schema (Zod Validation)
 */
export const CheckoutSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .transform(sanitizeInput),
  phone: z
    .string()
    .min(10, 'Valid 11-digit Bangladeshi phone number required')
    .max(15, 'Phone number too long')
    .regex(/^(\+8801|8801|01)[3-9]\d{8}$/, 'Invalid Bangladeshi phone number format')
    .transform(sanitizeInput),
  district: z
    .string()
    .min(2, 'District is required')
    .max(50, 'District name too long')
    .transform(sanitizeInput),
  address: z
    .string()
    .min(5, 'Delivery address must be at least 5 characters')
    .max(300, 'Address cannot exceed 300 characters')
    .transform(sanitizeInput),
  orderNotes: z
    .string()
    .max(500, 'Order notes cannot exceed 500 characters')
    .optional()
    .transform((val) => (val ? sanitizeInput(val) : '')),
  paymentMethod: z.enum(['COD', 'SSLCOMMERZ', 'BKASH', 'NAGAD']),
  cartItems: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID required'),
        title: z.string().transform(sanitizeInput),
        price: z.number().positive('Price must be greater than 0'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
        selectedSize: z.string().optional().transform((val) => (val ? sanitizeInput(val) : '')),
        selectedColor: z.string().optional().transform((val) => (val ? sanitizeInput(val) : '')),
        image: z.string().optional(),
      })
    )
    .min(1, 'Cart cannot be empty'),
  couponCode: z
    .string()
    .max(30, 'Invalid coupon code')
    .optional()
    .transform((val) => (val ? sanitizeInput(val).toUpperCase() : '')),
});

/**
 * Search Query Schema
 */
export const SearchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query too long')
    .transform(sanitizeInput),
});

/**
 * User Auth Form Schemas
 */
export const LoginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(3, 'Email or phone number required')
    .max(100)
    .transform(sanitizeInput),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).transform(sanitizeInput),
  email: z.string().email('Invalid email address').transform(sanitizeInput),
  phone: z
    .string()
    .regex(/^(\+8801|8801|01)[3-9]\d{8}$/, 'Invalid Bangladeshi phone number')
    .transform(sanitizeInput),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
