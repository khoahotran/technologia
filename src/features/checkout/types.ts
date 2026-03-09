import { z } from 'zod';

export const AddressSchema = z.object({
    addressId: z.string(),
    province: z.string(),
    city: z.string(),
    ward: z.string(),
    street: z.string(),
    no: z.string(),
    isDefault: z.boolean(),
    receiverName: z.string(),
    receiverPhoneNumber: z.string(),
});

export type Address = z.infer<typeof AddressSchema>;

export const CreateAddressSchema = AddressSchema.omit({ addressId: true });
export type CreateAddress = z.infer<typeof CreateAddressSchema>;

export const OrderItemSchema = z.object({
    productId: z.string(),
    variantId: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    name: z.string(),
    image: z.string().optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
    status: z.enum(['created', 'shipping', 'delivered', 'cancelled']),
    paymentMethod: z.enum(['bank', 'wallet', 'cod']),
    shippingAddress: AddressSchema,
    items: z.array(OrderItemSchema),
    total: z.number(),
});

export type Order = z.infer<typeof OrderSchema>;
