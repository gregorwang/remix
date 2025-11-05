interface ChangelogCardProps {
    version: string
    date: string
    description: string
  }
  
  export default function ChangelogCard({ version, date, description }: ChangelogCardProps) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow">
        {/* Version and Date Header */}
        <div className="flex items-center gap-2 mb-3">
          {/* Version Badge */}
          <span className="inline-flex items-center justify-center rounded-full border border-gray-400 bg-white px-3 py-1 text-sm font-medium text-gray-700">
            {version}
          </span>
          {/* Date */}
          <span className="text-sm text-gray-600">{date}</span>
        </div>
  
        {/* Description */}
        <p className="text-sm text-foreground leading-relaxed">{description}</p>
      </div>
    )
  }
  