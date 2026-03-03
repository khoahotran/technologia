import { z } from "zod";

/**
 * Thực thể Địa chỉ (Address Entity)
 * 
 * Đại diện cho địa chỉ nhận hàng hoặc thanh toán của người dùng.
 */
export const AddressEntitySchema = z.object({
  /** Mã định danh duy nhất của bản ghi địa chỉ */
  addressId: z.string(),
  /** ID khách hàng sở hữu địa chỉ này */
  customerId: z.string(),
  /** Tên Tỉnh/Thành phố trực thuộc trung ương */
  province: z.string(),
  /** Tên Quận/Huyện/Thị xã */
  city: z.string(),
  /** Tên Phường/Xã/Thị trấn */
  ward: z.string(),
  /** Tên đường/phố */
  street: z.string(),
  /** Số nhà/Tòa nhà/Ngách */
  no: z.string(),
});

/** Kiểu dữ liệu TypeScript suy diễn hoàn toàn từ Schema */
export type AddressEntity = z.infer<typeof AddressEntitySchema>;
