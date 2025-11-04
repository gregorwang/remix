"use client";

import { useMemo } from 'react';
import type { loader } from '~/routes/game';
import { Link } from '@remix-run/react';
import type { SerializeFrom } from '@remix-run/node';
import { PlayStationIcon, SwitchIcon, PCIcon } from '~/components/GamePlatformIcons';

type LoaderData = SerializeFrom<typeof loader>;

const platformIcons = {
    playstation: PlayStationIcon,
    switch: SwitchIcon,
    pc: PCIcon
};

// --- Helper Components ---
const StarIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

// 简化的图片组件 - 直接使用服务端生成的完整URL
const GameImage = ({
    src,
    alt,
    className,
    isLazy = false,
}: {
    src: string,
    alt: string,
    className: string,
    isLazy?: boolean
}) => {
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={(e) => console.error('Image failed to load:', src)}
            loading={isLazy ? "lazy" : "eager"}
        />
    );
};


// --- Main Client Component ---
export default function GamePageClient(data: LoaderData) {
    const {
        userStats,
        platforms,
        platformId,
        paginatedGames,
        totalGames,
        totalPages,
        currentPage,
        followedGames: initialFollowedGames,
        avatarImageUrl,
    } = data;

    const currentPlatformData = useMemo(() => {
        return platforms.find(p => p.id === platformId) || platforms[0];
    }, [platformId, platforms]);


    const getProgressBarColor = (progress: number | null) => {
        if (progress === null) return 'bg-primary-950/30';
        if (progress === 100) return 'bg-gradient-to-r from-green-500 via-green-600 to-green-700';
        if (progress >= 75) return 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700';
        if (progress >= 50) return 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700';
        if (progress >= 25) return 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700';
        return 'bg-gradient-to-r from-red-500 via-red-600 to-red-700';
    };

    const visiblePages = useMemo(() => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    }, [currentPage, totalPages]);

    return (
        <>
            <header className="bg-primary-100/80 backdrop-blur-xl border-b border-primary-950/10 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-accent via-accent-hover to-accent rounded-full blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                            <GameImage
                                src={avatarImageUrl}
                                alt="个人头像"
                                className="relative w-28 h-28 rounded-full border-4 border-primary-100 shadow-2xl object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full border-2 border-primary-50 animate-pulse"></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-2 lg:space-y-0 lg:space-x-4 mb-3">
                                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-950 via-accent to-accent-hover bg-clip-text text-transparent">
                                    汪家俊
                                </h1>
                            </div>
                            <p className="text-primary-950/70 mb-6 text-lg hover:text-primary-950 transition-colors cursor-pointer">🎮 热爱游戏，享受每一个精彩瞬间</p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                                {userStats.map((stat) => (
                                    <div key={stat.label} className="bg-primary-100 backdrop-blur-sm rounded-xl p-4 hover:bg-accent/10 transition-all duration-300 transform hover:scale-105 cursor-pointer group border border-primary-950/5">
                                        <div className="text-3xl font-bold text-primary-950 group-hover:text-accent-hover transition-colors">{stat.value}</div>
                                        <div className="text-sm text-primary-950/60 group-hover:text-primary-950 transition-colors">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Platform Switcher */}
                    <div className="mt-8">
                        <div className="bg-primary-100 backdrop-blur-xl rounded-2xl p-6 border border-primary-950/10 shadow-md">
                            <h3 className="text-primary-950 font-semibold mb-4 text-center">选择游戏平台</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {platforms.map((platform) => {
                                    const Icon = platformIcons[platform.id as keyof typeof platformIcons];
                                    return (
                                        <Link
                                            key={platform.id}
                                            to={`/game?platform=${platform.id}`}
                                            prefetch="intent"
                                            className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 group relative overflow-hidden ${platformId === platform.id
                                                ? `bg-gradient-to-r ${platform.gradient} text-white shadow-xl scale-105`
                                                : 'bg-primary-50 text-primary-950/70 hover:bg-accent/10 hover:text-primary-950 border border-primary-950/10'
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            {Icon && <Icon className="w-6 h-6" />}
                                            <span className="font-bold relative z-10">{platform.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platform Info */}
                <div className="max-w-7xl mx-auto px-6 pb-8">
                    <div key={platformId} className={`bg-gradient-to-r ${currentPlatformData.gradient} rounded-3xl p-8 shadow-2xl relative overflow-hidden platform-enter-active`}>
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-4 right-4 w-20 h-20 animate-spin-slow">
                                {(() => {
                                    const IconComponent = platformIcons[currentPlatformData.id as keyof typeof platformIcons];
                                    return IconComponent ? <div className="w-full h-full"><IconComponent className="w-full h-full" /></div> : null;
                                })()}
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-center justify-between relative z-10 space-y-6 lg:space-y-0">
                            <div className="flex items-center space-x-6">
                                <GameImage
                                    src={avatarImageUrl}
                                    alt={`${currentPlatformData.name} 头像`}
                                    className="w-20 h-20 rounded-full border-4 border-white/70 shadow-xl object-cover"
                                />
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-2xl font-bold text-white">汪家俊</h3>
                                        <div className="flex items-center text-yellow-300 bg-white/20 rounded-full px-3 py-1">
                                            <StarIcon className="w-5 h-5 mr-1" />
                                            <span className="font-bold">{currentPlatformData.score}</span>
                                        </div>
                                    </div>
                                    <p className="text-white/95 text-lg">{currentPlatformData.motto}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {currentPlatformData.stats.map((stat) => (
                                    <div key={stat.label} className="text-center bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                                        <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.value}</div>
                                        <div className="text-xs lg:text-sm text-white/90">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Game Collection Title */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-accent/10 to-accent-hover/10 backdrop-blur-xl rounded-2xl px-8 py-4 inline-block border border-accent/20 shadow-md">
                        <h2 className="font-bold text-2xl bg-gradient-to-r from-primary-950 to-accent bg-clip-text text-transparent">
                            🎮 我的游戏收藏
                        </h2>
                    </div>
                </div>

                {/* Game List */}
                <div className="space-y-6">
                    {paginatedGames.map((game) => (
                        <div key={game.id} className="bg-primary-100 backdrop-blur-xl rounded-2xl p-6 hover:bg-primary-100 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border border-primary-950/10 group">
                            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
                                {/* Cover */}
                                <div className="relative group/cover flex-shrink-0">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent-hover rounded-xl blur opacity-0 group-hover:opacity-60 transition duration-500"></div>
                                    <GameImage
                                        src={game.cover}
                                        alt={game.name}
                                        className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-xl object-cover shadow-xl transition-transform duration-500 group-hover:scale-110"
                                        isLazy={true}
                                    />
                                </div>
                                {/* Details */}
                                <div className="flex-1 text-center lg:text-left">
                                    <h3 className="text-xl lg:text-2xl font-bold text-primary-950 mb-2 hover:text-accent-hover transition-colors cursor-pointer group-hover:text-accent-hover">{game.name}</h3>
                                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 text-sm text-primary-950/60 mb-4">
                                        <span className="flex items-center space-x-2 bg-primary-50 rounded-full px-3 py-1 border border-primary-950/10">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                            <span>{game.playTime}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="flex-1 bg-primary-950/10 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                                            <div className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${getProgressBarColor(game.progress)}`} style={{ width: game.progress !== null ? `${game.progress}%` : `100%` }}>
                                                {game.progress !== null && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>}
                                            </div>
                                        </div>
                                        <span className="text-sm text-primary-950 font-bold min-w-[60px] bg-primary-50 rounded-full px-3 py-1 border border-primary-950/10">
                                            {game.progress !== null ? `${game.progress}%` : '-'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                        {(game.tags || []).map(tag => (
                                            <span key={tag} className="text-xs bg-gradient-to-r from-accent/10 to-accent-hover/10 text-accent-hover px-3 py-1 rounded-full border border-accent/30">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* Stats */}
                                <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
                                    {platformId === 'playstation' && game.trophies && (
                                        <div className="flex items-center space-x-3">
                                            {Object.entries(game.trophies).map(([type, count]) => {
                                                if (count === 0) return null;
                                                const colors: {[key: string]: string} = {
                                                    platinum: 'from-gray-200 to-white',
                                                    gold: 'from-yellow-400 to-yellow-600',
                                                    silver: 'from-gray-300 to-gray-500',
                                                    bronze: 'from-orange-400 to-orange-600'
                                                };
                                                return (
                                                    <div key={type} className="flex items-center space-x-1 group/trophy">
                                                        <div className={`w-4 h-4 bg-gradient-to-br ${colors[type]} rounded-full group-hover/trophy:scale-125 transition-transform shadow-lg`}></div>
                                                        <span className="text-sm text-primary-950 font-semibold">{count}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                    <div className="text-center bg-primary-50 rounded-xl p-3 backdrop-blur-sm border border-primary-950/10">
                                        <div className="text-lg font-bold text-primary-950">{game.achievementsCurrent !== null && game.achievementsTotal !== null ? `${game.achievementsCurrent}/${game.achievementsTotal}` : '-'}</div>
                                        <div className="text-xs text-primary-950/60">成就</div>
                                    </div>
                                    <div className="text-center bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-xl p-3 backdrop-blur-sm border border-yellow-500/40">
                                        <div className="flex items-center justify-center space-x-1 mb-1">
                                            <span className="text-xl font-bold text-yellow-600">{game.rating}</span>
                                            <span className="text-sm text-primary-950/60">/10</span>
                                        </div>
                                        <div className="flex justify-center space-x-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <StarIcon key={i} className={`w-3 h-3 transition-all duration-200 ${i < Math.floor(game.rating / 2) ? 'text-yellow-500 scale-110' : 'text-primary-950/20'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-center max-w-[150px] bg-primary-50 rounded-xl p-3 backdrop-blur-sm border border-primary-950/10">
                                        <p className="text-sm text-primary-950/70 italic hover:text-primary-950 transition-colors cursor-default leading-relaxed">{game.review}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <nav className="bg-primary-100 backdrop-blur-xl rounded-2xl p-6 border border-primary-950/10 shadow-md">
                            <div className="flex items-center space-x-3">
                                <Link
                                    to={`/game?platform=${platformId}&page=${currentPage - 1}`}
                                    prefetch="intent"
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${currentPage === 1 ? 'bg-primary-950/20 text-primary-950/40 cursor-not-allowed' : 'bg-gradient-to-r from-accent to-accent-hover text-white hover:from-accent-hover hover:to-accent hover:scale-105 shadow-lg'}`}
                                    aria-disabled={currentPage === 1}
                                    onClick={(e) => { if (currentPage === 1) e.preventDefault(); }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    <span>上一页</span>
                                </Link>
                                <div className="flex space-x-2">
                                    {visiblePages.map(page => (
                                        <Link
                                            key={page}
                                            to={`/game?platform=${platformId}&page=${page}`}
                                            prefetch="intent"
                                            className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold min-w-[50px] ${page === currentPage ? 'bg-gradient-to-r from-accent to-accent-hover text-white shadow-xl scale-110' : 'bg-primary-50 text-primary-950/70 hover:bg-accent/10 hover:text-primary-950 hover:scale-105 border border-primary-950/10'}`}
                                        >
                                            {page}
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    to={`/game?platform=${platformId}&page=${currentPage + 1}`}
                                    prefetch="intent"
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${currentPage === totalPages ? 'bg-primary-950/20 text-primary-950/40 cursor-not-allowed' : 'bg-gradient-to-r from-accent to-accent-hover text-white hover:from-accent-hover hover:to-accent hover:scale-105 shadow-lg'}`}
                                    aria-disabled={currentPage === totalPages}
                                    onClick={(e) => { if (currentPage === totalPages) e.preventDefault(); }}
                                >
                                    <span>下一页</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                            <div className="mt-4 text-center text-sm text-primary-950/70">
                                第 {currentPage} 页，共 {totalPages} 页 | 总计 {totalGames} 个游戏
                            </div>
                        </nav>
                    </div>
                )}

                {/* Followed Games */}
                <section className="mt-16">
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl px-8 py-4 inline-block border border-green-500/20 shadow-md">
                            <h2 className="font-bold text-2xl bg-gradient-to-r from-primary-950 to-green-600 bg-clip-text text-transparent">
                                🌟 我关注的游戏
                            </h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {initialFollowedGames.map(game => (
                            <div key={game.id} className="bg-primary-100 backdrop-blur-xl rounded-2xl p-6 hover:bg-primary-100 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group border border-primary-950/10">
                                <div className="relative overflow-hidden rounded-xl mb-4">
                                    <GameImage
                                        src={game.cover}
                                        alt={game.name}
                                        className="w-full h-40 rounded-xl object-cover transition-transform duration-500 group-hover:scale-110"
                                        isLazy={true}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                                    <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        即将发布
                                    </div>
                                </div>
                                <h4 className="text-primary-950 font-bold text-lg mb-3 group-hover:text-accent-hover transition-colors leading-tight">{game.name}</h4>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-primary-950/70 bg-primary-50 rounded-full px-3 py-1 border border-primary-950/10">{game.releaseDate}</span>
                                    <div className="flex items-center space-x-1 bg-yellow-400/20 rounded-full px-3 py-1 border border-yellow-500/40">
                                        <StarIcon className="w-4 h-4 text-yellow-600" />
                                        <span className="text-yellow-600 font-semibold">{game.rating}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
} 