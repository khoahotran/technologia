/**
 * Thành phần Logo Đối tác (Partner Logo Component)
 * 
 * Hiển thị logo của một đối tác. Nếu không có hình ảnh logo, 
 * sẽ hiển thị tên đối tác dưới dạng văn bản thay thế.
 */
interface PartnerLogoProps {
  /** Tên của đối tác (dùng cho thuộc tính alt hoặc hiển thị dạng text) */
  name: string
  /** Đường dẫn đến hình ảnh logo (tùy chọn) */
  logoUrl?: string
}

export function PartnerLogo({ name, logoUrl }: PartnerLogoProps) {
  return (
    <div className="bg-white rounded-xl p-6 min-w-[150px] flex-shrink-0 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={name} className="h-12 object-contain" />
      ) : (
        <span className="text-lg font-bold text-gray-700">{name}</span>
      )}
    </div>
  )
}
