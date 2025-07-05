// 时间相关的纯算法逻辑工具函数
// 这些函数不涉及 I/O 操作，只做纯计算

/**
 * 计算距离下次允许发布的时间
 * @param lastPostTime 上次发布时间
 * @param intervalHours 时间间隔（小时）
 * @returns 时间信息对象
 */
export function calculatePostRestriction(
  lastPostTime: string | Date, 
  intervalHours: number = 48
): {
  canPost: boolean;
  timeUntilNextPost: string;
  nextAllowedTime: Date;
} {
  const lastPost = new Date(lastPostTime);
  const nextAllowedTime = new Date(lastPost.getTime() + intervalHours * 60 * 60 * 1000);
  const now = new Date();
  const diff = nextAllowedTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return {
      canPost: true,
      timeUntilNextPost: '',
      nextAllowedTime
    };
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    canPost: false,
    timeUntilNextPost: `${hours}h ${minutes}m`,
    nextAllowedTime
  };
}

/**
 * 获取指定小时数之前的时间戳（ISO格式）
 * @param hoursAgo 多少小时之前
 * @returns ISO格式的时间字符串
 */
export function getTimeAgo(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
}

/**
 * 计算分页信息
 * @param totalItems 总条目数
 * @param itemsPerPage 每页条目数
 * @param currentPage 当前页码
 * @returns 分页信息对象
 */
export function calculatePagination(
  totalItems: number, 
  itemsPerPage: number, 
  currentPage: number = 1
): {
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const rangeStart = (currentPage - 1) * itemsPerPage;
  const rangeEnd = rangeStart + itemsPerPage - 1;
  
  return {
    totalPages,
    rangeStart,
    rangeEnd,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}

/**
 * 格式化时间显示
 * @param timestamp 时间戳字符串
 * @param locale 语言环境，默认为中文
 * @returns 格式化后的时间字符串
 */
export function formatDateTime(timestamp: string, locale: string = 'zh-CN'): string {
  return new Date(timestamp).toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 检查时间是否在指定范围内
 * @param timestamp 要检查的时间
 * @param hoursRange 时间范围（小时）
 * @returns 是否在范围内
 */
export function isWithinTimeRange(timestamp: string | Date, hoursRange: number): boolean {
  const time = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  const hoursDiff = diff / (1000 * 60 * 60);
  
  return hoursDiff <= hoursRange;
}

/**
 * 获取相对时间描述
 * @param timestamp 时间戳
 * @returns 相对时间描述（如"2小时前"）
 */
export function getRelativeTime(timestamp: string | Date): string {
  const time = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return formatDateTime(timestamp.toString());
} 