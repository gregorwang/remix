// 常量定义

// API 相关常量
export const API_ENDPOINTS = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.example.com' 
    : 'http://localhost:3000',
  AUTH: '/auth',
  USERS: '/users',
  POSTS: '/posts',
} as const;

// 应用配置常量
export const APP_CONFIG = {
  NAME: 'My Remix App',
  VERSION: '1.0.0',
  DESCRIPTION: 'A modern web application built with Remix',
  AUTHOR: 'Your Name',
} as const;

// 路由常量
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  TERMS: '/terms',
} as const;

// 本地存储键名常量
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// 主题常量
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// 语言常量
export const LANGUAGES = {
  EN: 'en',
  ZH: 'zh',
  ES: 'es',
  FR: 'fr',
} as const;

// 状态常量
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// 分页常量
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// 验证规则常量
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
} as const;

// 时间常量（毫秒）
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// 错误消息常量
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请检查您的网络设置',
  UNAUTHORIZED: '您没有权限访问此资源',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器内部错误，请稍后重试',
  VALIDATION_ERROR: '输入数据验证失败',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
} as const;

// 成功消息常量
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  UPDATE_SUCCESS: '更新成功',
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出成功',
  REGISTER_SUCCESS: '注册成功',
} as const;

// 管理员用户ID列表
export const ADMIN_USER_IDS = [
    'user_2zGxbulHCCfV9zltLED9FuBIrM3',  // 主管理员
    'gregorwang',  // 备用管理员
    // 可以在这里添加更多管理员ID
];

// 管理员邮箱列表
export const ADMIN_EMAILS = [
    '1985738212@qq.com',  // 主管理员邮箱
    // 可以在这里添加更多管理员邮箱
];

// 检查用户是否为管理员
export const isAdmin = (userId: string | null | undefined, userEmail?: string | null): boolean => {
    if (!userId) return false;
    
    // 检查用户ID
    if (ADMIN_USER_IDS.includes(userId)) {
        return true;
    }
    
    // 检查邮箱
    if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
        return true;
    }
    
    return false;
};