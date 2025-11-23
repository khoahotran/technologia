interface ValueCardProps {
  title: string
  description: string
}

export function ValueCard({ title, description }: ValueCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
