// Utils 模块索引文件
// 统一导出所有纯算法逻辑工具函数，符合Remix最佳实践

// Chat 相关工具
export {
  generateChatResponse,
  getDefaultChatResponses,
  selectRandomResponse,
  validateChatMessage
} from './chatUtils';

// 时间相关工具
export {
  calculatePostRestriction,
  getTimeAgo,
  calculatePagination,
  formatDateTime,
  isWithinTimeRange,
  getRelativeTime
} from './timeUtils';

// 游戏相关工具
export {
  PLATFORMS,
  USER_STATS,
  isValidPlatformId,
  getValidPlatformId,
  paginateGames,
  calculateGameProgress,
  getRatingStyle,
  formatPlayTime,
  calculateTotalTrophies,
  filterGamesByTags,
  sortGamesByRating,
  sortGamesByPlayTime
} from './gameUtils';

// 加密相关工具
export {
  generateImageToken,
  verifyImageToken,
  generateImageUrl,
  validateImageName,
  validateExpirationTime,
  formatRemainingTime,
  generateSecureRandomString,
  calculateHash
} from './cryptoUtils';

// 类型导出
export type { TokenResult, TokenVerificationResult } from './cryptoUtils'; 