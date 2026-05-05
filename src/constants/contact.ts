/**
 * Thông tin liên hệ và mạng xã hội của hệ thống Technologia.
 */
export const CONTACT_INFO = {
  phone: {
    display: "(+84) 859 268 620", // Định dạng hiển thị yêu cầu: (+84) 859 268 620
    value: "0859268620",        // Giá trị dùng cho href="tel:..."
    full: "+84859268620"        // Giá trị quốc tế đầy đủ
  },
  email: "trannguyenanhkhoa0104@gmail.com",
  socials: {
    facebook: "https://www.facebook.com/khoahotran2k4/",
    instagram: "https://www.instagram.com/khoahotran2k4/",
    youtube: "https://www.youtube.com/@khoahotran",
    linkedin: "https://linkedin.com/in/khoahotran"
  }
} as const;
