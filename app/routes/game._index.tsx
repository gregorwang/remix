import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { PlayStationIcon, SwitchIcon, PCIcon } from "~/components/GamePlatformIcons";

// Remix 最佳实践：使用嵌套路由
// 这是 /game 的索引页面，用于平台选择

const platforms = [
  {
    id: 'playstation',
    name: 'PlayStation',
    icon: PlayStationIcon,
    gradient: 'from-blue-600 to-blue-800',
    description: '探索PlayStation平台的游戏世界',
    stats: { total: 22, completed: 12 }
  },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    icon: SwitchIcon,
    gradient: 'from-red-600 to-red-800',
    description: '享受Switch便携游戏的乐趣',
    stats: { total: 2, completed: 1 }
  },
  {
    id: 'pc',
    name: 'PC',
    icon: PCIcon,
    gradient: 'from-green-600 to-green-800',
    description: 'PC Master Race的游戏收藏',
    stats: { total: 2, completed: 0 }
  }
];

export const meta: MetaFunction = () => {
  return [
    { title: "游戏中心 - 选择平台" },
    { name: "description", content: "选择你的游戏平台，查看游戏收藏" },
  ];
};

export default function GameIndex() {
  return (
    <div className="min-h-screen bg-primary-50">
      {/* Hero Section - 使用 section-sm 间距 */}
      <div className="bg-gradient-to-r from-accent/10 to-accent-hover/10 py-section-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Hero 标题 - text-5xl + font-bold + tracking-tighter + leading-none */}
          <h1 className="text-5xl font-bold text-primary-950 mb-3 tracking-tighter leading-none">
            🎮 游戏中心
          </h1>
          {/* 描述文字 - text-lg + leading-relaxed */}
          <p className="text-lg text-primary-950/70 leading-relaxed">
            选择一个平台，开始探索我的游戏世界
          </p>
        </div>
      </div>

      {/* Platform Selection - 使用 section-md 间距 */}
      <div className="max-w-7xl mx-auto px-6 py-section-md">
        {/* 卡片间距使用流体值 3rem */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <Link
                key={platform.id}
                to={`/game/${platform.id}`}
                prefetch="intent"
                className="group relative bg-primary-100 rounded-lg p-2.5 border border-primary-950/10 transition-all duration-300 ease-expo-out hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Background Gradient on Hover - 动画：opacity 300ms + ease-expo-out */}
                <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300 ease-expo-out`} />
                
                <div className="relative z-10">
                  {/* Icon - 使用固定间距 1.5rem + 动画：transform 300ms */}
                  <div className="mb-1.5 flex justify-center">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${platform.gradient} flex items-center justify-center text-white shadow-lg transition-transform duration-300 ease-expo-out group-hover:scale-110`}>
                      <Icon className="w-10 h-10" />
                    </div>
                  </div>

                  {/* Platform Name - text-2xl + font-semibold + tracking-tight + leading-snug + 动画：颜色 300ms */}
                  <h2 className="text-2xl font-semibold text-primary-950 mb-1 text-center tracking-tight leading-snug transition-colors duration-300 ease-expo-out group-hover:text-accent-hover">
                    {platform.name}
                  </h2>

                  {/* Description - text-base + leading-normal */}
                  <p className="text-base text-primary-950/70 text-center mb-1.5 leading-normal">
                    {platform.description}
                  </p>

                  {/* Stats - 使用固定间距 1.5rem */}
                  <div className="flex justify-around pt-1.5 border-t border-primary-950/10">
                    <div className="text-center">
                      {/* 数字 - text-2xl + font-semibold + tabular-nums */}
                      <div className="text-2xl font-semibold text-primary-950 tabular-nums">{platform.stats.total}</div>
                      {/* 标签 - text-sm + leading-normal */}
                      <div className="text-sm text-primary-950/60 leading-normal">游戏总数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-accent-hover tabular-nums">{platform.stats.completed}</div>
                      <div className="text-sm text-primary-950/60 leading-normal">已完成</div>
                    </div>
                  </div>

                  {/* Arrow Icon - 使用固定间距 1.5rem + 动画：transform 300ms + ease-expo-out */}
                  <div className="mt-1.5 flex justify-center">
                    <svg 
                      className="w-6 h-6 text-accent-hover transition-transform duration-300 ease-expo-out group-hover:translate-x-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

