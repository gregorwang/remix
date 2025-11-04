// 游戏相关的类型定义
// 遵循 Remix 最佳实践：类型定义独立管理

export type Game = {
  id: number;
  name: string;
  playTime: string;
  progress: number | null;
  trophies: { 
    platinum: number; 
    gold: number; 
    silver: number; 
    bronze: number; 
  };
  achievementsCurrent: number | null;
  achievementsTotal: number | null;
  rating: number;
  review: string;
  tags: string[];
  cover: string;
};

export type Platform = {
  id: string;
  name: string;
  gradient: string;
  score: string;
  motto: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
};

export type UserStat = {
  label: string;
  value: string;
};

export type FollowedGame = {
  id: number;
  name: string;
  releaseDate: string;
  rating: number;
  cover: string;
};

export type PlatformId = 'playstation' | 'switch' | 'pc';

export type AllGamesData = {
  [K in PlatformId]: Game[];
};

