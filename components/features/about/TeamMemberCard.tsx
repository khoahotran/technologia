interface TeamMemberCardProps {
  name: string
  role: string
  description: string
  imageUrl?: string
}

export function TeamMemberCard({ name, role, description, imageUrl }: TeamMemberCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 min-w-[280px] flex-shrink-0 border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#8AB0C3] flex items-center justify-center">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
