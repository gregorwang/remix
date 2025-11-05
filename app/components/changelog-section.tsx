import ChangelogCard from "./changelog-card"

interface ChangelogEntry {
  version: string
  date: string
  description: string
}

const entries: ChangelogEntry[] = [
  {
    version: "1.7",
    date: "Sep 29, 2025",
    description: "Agent 自动补全、Hook 与团队规则",
  },
  {
    version: "1.6",
    date: "Sep 12, 2025",
    description: "针对采样给合、摘录功能，以及更完善的 Agent 终端",
  },
  {
    version: "1.5",
    date: "Aug 21, 2025",
    description: "Linear 集成、改进的 Agent 终端，以及操作系统通知",
  },
  {
    version: "1.4",
    date: "Aug 6, 2025",
    description: "改进的 Agent 工具，可自导性与使用可见性",
  },
]

export default function ChangelogSection() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-8 text-foreground">更新日志</h1>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {entries.map((entry) => (
          <ChangelogCard key={entry.version} {...entry} />
        ))}
      </div>

      {/* Link */}
      <div className="mt-8">
        <a
          href="#cursor"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium"
        >
          查看Cursor新功能
          <span className="text-xl">→</span>
        </a>
      </div>
    </div>
  )
}
