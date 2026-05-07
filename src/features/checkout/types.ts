import { z } from 'zod';

export const AddressSchema = z.object({
    addressId: z.string(),
    customerId: z.string().optional(),
    province: z.string(),
    city: z.string().nullable().optional(),
    ward: z.string(),
    street: z.string(),
    no: z.string(),
    isDefault: z.boolean(),
    receiverName: z.string(),
    receiverPhoneNumber: z.string(),
    updatedAt: z.string().optional(),
});

export type Address = z.infer<typeof AddressSchema>;

export const CreateAddressSchema = AddressSchema.omit({ addressId: true });
export type CreateAddress = z.infer<typeof CreateAddressSchema>;

export const PaymentAccountResponseSchema = z.object({
    paymentAccountId: z.string(),
    customerId: z.string(),
    accountNumber: z.string(),
    holderName: z.string(),
    bankName: z.string(),
    isDefault: z.boolean(),
    type: z.enum(["BANK_ACCOUNT", "E_WALLET", "OTHER"]),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "DELETED"]),
    updatedAt: z.string(),
});

export type PaymentAccountResponse = z.infer<typeof PaymentAccountResponseSchema>;

export const CreatePaymentAccountSchema = z.object({
    accountNumber: z.string().min(1, "Account number is required"),
    holderName: z.string().min(1, "Holder name is required"),
    bankName: z.string().min(1, "Bank name is required"),
    isDefault: z.boolean().default(false),
    type: z.enum(["BANK_ACCOUNT", "E_WALLET"]),
});

export type CreatePaymentAccount = z.infer<typeof CreatePaymentAccountSchema>;
