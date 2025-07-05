// 游戏相关的纯算法逻辑工具函数
// 这些函数不涉及 I/O 操作，只做纯计算

/**
 * 游戏平台数据
 */
export const PLATFORMS = [
  {
    id: 'playstation',
    name: 'PlayStation',
    gradient: 'from-blue-600 to-blue-800',
    score: '219',
    motto: '努力取得更多奖杯吧',
    stats: [
      { label: '白金', value: '12' },
      { label: '黄金', value: '36' },
      { label: '白银', value: '172' },
      { label: '黄铜', value: '784' }
    ]
  },
  {
    id: 'switch',
    name: 'Switch',
    gradient: 'from-red-600 to-red-800',
    score: '156',
    motto: '享受便携游戏的乐趣',
    stats: [
      { label: '完成游戏', value: '2' },
      { label: '拥有游戏', value: '2' },
      { label: '游戏时长', value: '10h' },
      { label: '收藏', value: '12' }
    ]
  },
  {
    id: 'pc',
    name: 'PC',
    gradient: 'from-green-600 to-green-800',
    score: '342',
    motto: 'PC Master Race',
    stats: [
      { label: 'Steam游戏', value: '0' },
      { label: 'Epic游戏', value: '3' },
      { label: '总成就', value: '0' },
    ]
  }
];

/**
 * 用户统计数据
 */
export const USER_STATS = [
  { label: '游戏总数', value: '156' },
  { label: '完成度', value: '78%' },
  { label: '游戏时长', value: '1150h' },
  { label: '成就解锁', value: '1,204' }
];

/**
 * 验证平台ID是否有效
 * @param platformId 平台ID
 * @returns 是否有效
 */
export function isValidPlatformId(platformId: string): boolean {
  return PLATFORMS.some(platform => platform.id === platformId);
}

/**
 * 获取有效的平台ID
 * @param platformId 输入的平台ID
 * @param defaultPlatform 默认平台
 * @returns 有效的平台ID
 */
export function getValidPlatformId(platformId: string, defaultPlatform: string = 'playstation'): string {
  return isValidPlatformId(platformId) ? platformId : defaultPlatform;
}

/**
 * 计算游戏分页
 * @param games 游戏数组
 * @param currentPage 当前页码
 * @param gamesPerPage 每页游戏数量
 * @returns 分页结果
 */
export function paginateGames<T>(
  games: T[],
  currentPage: number,
  gamesPerPage: number = 8
): {
  paginatedGames: T[];
  totalGames: number;
  totalPages: number;
  currentPage: number;
} {
  const totalGames = games.length;
  const totalPages = Math.ceil(totalGames / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  
  const paginatedGames = games.slice(startIndex, endIndex);
  
  return {
    paginatedGames,
    totalGames,
    totalPages,
    currentPage
  };
}

/**
 * 计算游戏进度百分比
 * @param current 当前成就数
 * @param total 总成就数
 * @returns 进度百分比
 */
export function calculateGameProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * 根据评分获取评分样式类
 * @param rating 评分
 * @returns CSS类名
 */
export function getRatingStyle(rating: number): string {
  if (rating >= 9) return 'text-green-600 bg-green-100';
  if (rating >= 7) return 'text-yellow-600 bg-yellow-100';
  if (rating >= 5) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
}

/**
 * 格式化游戏时长显示
 * @param playTime 游戏时长字符串
 * @returns 格式化后的时长
 */
export function formatPlayTime(playTime: string): string {
  // 如果已经是格式化的字符串（如 "45h"），直接返回
  if (playTime.includes('h') || playTime.includes('小时')) {
    return playTime;
  }
  
  // 如果是数字，添加小时单位
  const hours = parseFloat(playTime);
  if (!isNaN(hours)) {
    return `${hours}h`;
  }
  
  return playTime;
}

/**
 * 计算奖杯统计
 * @param trophies 奖杯对象
 * @returns 奖杯总数
 */
export function calculateTotalTrophies(trophies: {
  platinum: number;
  gold: number;
  silver: number;
  bronze: number;
}): number {
  return trophies.platinum + trophies.gold + trophies.silver + trophies.bronze;
}

/**
 * 根据标签过滤游戏
 * @param games 游戏数组
 * @param tags 标签数组
 * @returns 过滤后的游戏数组
 */
export function filterGamesByTags<T extends { tags: string[] }>(games: T[], tags: string[]): T[] {
  if (tags.length === 0) return games;
  
  return games.filter(game => 
    tags.some(tag => 
      game.tags.some(gameTag => 
        gameTag.toLowerCase().includes(tag.toLowerCase())
      )
    )
  );
}

/**
 * 按评分排序游戏
 * @param games 游戏数组
 * @param order 排序方式 ('asc' | 'desc')
 * @returns 排序后的游戏数组
 */
export function sortGamesByRating<T extends { rating: number }>(
  games: T[], 
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...games].sort((a, b) => {
    return order === 'desc' ? b.rating - a.rating : a.rating - b.rating;
  });
}

/**
 * 按游戏时长排序
 * @param games 游戏数组
 * @param order 排序方式 ('asc' | 'desc')
 * @returns 排序后的游戏数组
 */
export function sortGamesByPlayTime<T extends { playTime: string }>(
  games: T[], 
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...games].sort((a, b) => {
    const timeA = parseFloat(a.playTime) || 0;
    const timeB = parseFloat(b.playTime) || 0;
    return order === 'desc' ? timeB - timeA : timeA - timeB;
  });
} 