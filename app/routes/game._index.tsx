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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent/10 to-accent-hover/10 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-primary-950 mb-6">
            🎮 游戏中心
          </h1>
          <p className="text-xl text-primary-950/70 mb-8">
            选择一个平台，开始探索我的游戏世界
          </p>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <Link
                key={platform.id}
                to={`/game/${platform.id}`}
                prefetch="intent"
                className="group relative bg-primary-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-primary-950/10"
              >
                {/* Background Gradient on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${platform.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-10 h-10" />
                    </div>
                  </div>

                  {/* Platform Name */}
                  <h2 className="text-2xl font-bold text-primary-950 mb-4 text-center group-hover:text-accent-hover transition-colors">
                    {platform.name}
                  </h2>

                  {/* Description */}
                  <p className="text-primary-950/70 text-center mb-6">
                    {platform.description}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-around pt-6 border-t border-primary-950/10">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-950">{platform.stats.total}</div>
                      <div className="text-sm text-primary-950/60">游戏总数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-hover">{platform.stats.completed}</div>
                      <div className="text-sm text-primary-950/60">已完成</div>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="mt-6 flex justify-center">
                    <svg 
                      className="w-6 h-6 text-accent-hover transform group-hover:translate-x-2 transition-transform duration-300" 
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

