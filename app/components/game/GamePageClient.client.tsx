"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import type { loader } from '~/routes/game';
import { useImageToken, type ImageData } from '~/hooks/useImageToken';
import { Link, useLocation } from '@remix-run/react';
import type { SerializeFrom } from '@remix-run/node';

type LoaderData = SerializeFrom<typeof loader>;

// --- Icon Components ---
const PlayStationIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.794.991.794.991v10.516l4.028.69V8.112c0-2.145-1.192-3.123-2.783-3.123-1.591 0-2.783.978-2.783 3.123v-.69c0-.69-.158-1.81-.794-.991-.49.16-.794.301-.794.991V2.596H8.985z" />
    </svg>
);

const SwitchIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.176 24h3.674c3.376 0 6.15-2.774 6.15-6.15V6.15C24 2.775 21.226 0 17.85 0H14.176c-.663 0-1.2.538-1.2 1.2v21.6c0 .662.537 1.2 1.2 1.2z" />
        <path d="M9.824 24H6.15C2.774 24 0 21.226 0 17.85V6.15C0 2.775 2.774 0 6.15 0h3.674c.662 0 1.2.538 1.2 1.2v21.6c0 .662-.538 1.2-1.2 1.2z" />
    </svg>
);

const PCIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm8-5v10l8-5-8-5z" />
    </svg>
);

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

const ImageWithToken = ({
    originalSrc,
    alt,
    className,
    imgId,
    logName,
    isLazy = false,
}: {
    originalSrc: string,
    alt: string,
    className: string,
    imgId: string,
    logName: string,
    isLazy?: boolean
}) => {
    const { initializeSingleImageUrl, handleImageError: hookHandleImageError } = useImageToken();
    const [imageSrc, setImageSrc] = useState('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+');
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        let observer: IntersectionObserver;

        const processImage = async () => {
            const tokenizedUrl = await initializeSingleImageUrl(originalSrc, logName);
            if(imgRef.current) { // check if component is still mounted
                setImageSrc(tokenizedUrl);
            }
        };

        if (isLazy) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            processImage();
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: '0px 0px 200px 0px' }
            );

            if (imgRef.current) {
                observer.observe(imgRef.current);
            }
        } else {
            processImage();
        }

        return () => {
            if (observer && imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, [originalSrc, logName, initializeSingleImageUrl, isLazy]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        hookHandleImageError(e, imgId);
    };

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            data-cover={originalSrc}
            data-img-id={imgId}
            className={className}
            onError={handleImageError}
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
    } = data;

    const location = useLocation();

    const currentPlatformData = useMemo(() => {
        return platforms.find(p => p.id === platformId) || platforms[0];
    }, [platformId, platforms]);


    const getProgressBarColor = (progress: number | null) => {
        if (progress === null) return 'bg-gray-600/50';
        if (progress === 100) return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
        if (progress >= 75) return 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600';
        if (progress >= 50) return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600';
        if (progress >= 25) return 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600';
        return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600';
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
            <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                            <ImageWithToken
                                originalSrc="game/jkl.jpg"
                                alt="个人头像"
                                imgId="user-avatar"
                                logName="User Avatar"
                                className="relative w-28 h-28 rounded-full border-4 border-white/30 shadow-2xl object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-2 lg:space-y-0 lg:space-x-4 mb-3">
                                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                                    汪家俊
                                </h1>
                            </div>
                            <p className="text-gray-300 mb-6 text-lg hover:text-white transition-colors cursor-pointer">🎮 热爱游戏，享受每一个精彩瞬间</p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                                {userStats.map((stat) => (
                                    <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                                        <div className="text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors">{stat.value}</div>
                                        <div className="text-sm text-gray-300 group-hover:text-white transition-colors">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Platform Switcher */}
                    <div className="mt-8">
                        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                            <h3 className="text-white font-semibold mb-4 text-center">选择游戏平台</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {platforms.map((platform) => {
                                    const Icon = platformIcons[platform.id as keyof typeof platformIcons];
                                    return (
                                        <Link
                                            key={platform.id}
                                            to={`/game?platform=${platform.id}`}
                                            prefetch="intent"
                                            className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 group relative overflow-hidden ${platformId === platform.id
                                                ? `bg-gradient-to-r ${platform.gradient} text-white shadow-2xl scale-105`
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            {Icon && <Icon />}
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
                                {platformIcons[currentPlatformData.id as keyof typeof platformIcons] && <div className="w-full h-full">{platformIcons[currentPlatformData.id as keyof typeof platformIcons]()}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-center justify-between relative z-10 space-y-6 lg:space-y-0">
                            <div className="flex items-center space-x-6">
                                <ImageWithToken
                                    originalSrc="game/jkl.jpg"
                                    alt={`${currentPlatformData.name} 头像`}
                                    imgId="platform-avatar"
                                    logName="Platform Avatar"
                                    className="w-20 h-20 rounded-full border-4 border-white/50 shadow-xl object-cover"
                                />
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-2xl font-bold text-white">汪家俊</h3>
                                        <div className="flex items-center text-yellow-300 bg-black/20 rounded-full px-3 py-1">
                                            <StarIcon className="w-5 h-5 mr-1" />
                                            <span className="font-bold">{currentPlatformData.score}</span>
                                        </div>
                                    </div>
                                    <p className="text-white/90 text-lg">{currentPlatformData.motto}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {currentPlatformData.stats.map((stat) => (
                                    <div key={stat.label} className="text-center bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                                        <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.value}</div>
                                        <div className="text-xs lg:text-sm text-white/80">{stat.label}</div>
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
                    <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-xl rounded-2xl px-8 py-4 inline-block border border-white/10">
                        <h2 className="text-white font-bold text-2xl bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                            🎮 我的游戏收藏
                        </h2>
                    </div>
                </div>

                {/* Game List */}
                <div className="space-y-6">
                    {paginatedGames.map((game) => (
                        <div key={game.id} className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 hover:bg-black/30 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl border border-white/10 group">
                            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
                                {/* Cover */}
                                <div className="relative group/cover flex-shrink-0">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
                                    <ImageWithToken
                                        originalSrc={game.cover}
                                        alt={game.name}
                                        imgId={`game-cover-${game.id}`}
                                        logName={`Game cover for ${game.name}`}
                                        className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-xl object-cover shadow-xl transition-transform duration-500 group-hover:scale-110"
                                        isLazy={true}
                                    />
                                </div>
                                {/* Details */}
                                <div className="flex-1 text-center lg:text-left">
                                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 hover:text-cyan-300 transition-colors cursor-pointer group-hover:text-cyan-300">{game.name}</h3>
                                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 text-sm text-gray-300 mb-4">
                                        <span className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                            <span>{game.playTime}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="flex-1 bg-gray-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                                            <div className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${getProgressBarColor(game.progress)}`} style={{ width: game.progress !== null ? `${game.progress}%` : `100%` }}>
                                                {game.progress !== null && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>}
                                            </div>
                                        </div>
                                        <span className="text-sm text-white font-bold min-w-[60px] bg-white/10 rounded-full px-3 py-1">
                                            {game.progress !== null ? `${game.progress}%` : '-'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                        {(game.tags || []).map(tag => (
                                            <span key={tag} className="text-xs bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
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
                                                        <span className="text-sm text-white font-semibold">{count}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                    <div className="text-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                        <div className="text-lg font-bold text-white">{game.achievementsCurrent !== null && game.achievementsTotal !== null ? `${game.achievementsCurrent}/${game.achievementsTotal}` : '-'}</div>
                                        <div className="text-xs text-gray-300">成就</div>
                                    </div>
                                    <div className="text-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-3 backdrop-blur-sm border border-yellow-500/30">
                                        <div className="flex items-center justify-center space-x-1 mb-1">
                                            <span className="text-xl font-bold text-yellow-400">{game.rating}</span>
                                            <span className="text-sm text-gray-300">/10</span>
                                        </div>
                                        <div className="flex justify-center space-x-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <StarIcon key={i} className={`w-3 h-3 transition-all duration-200 ${i < Math.floor(game.rating / 2) ? 'text-yellow-400 scale-110' : 'text-gray-600'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-center max-w-[150px] bg-white/5 rounded-xl p-3 backdrop-blur-sm">
                                        <p className="text-sm text-gray-300 italic hover:text-white transition-colors cursor-default leading-relaxed">{game.review}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <nav className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center space-x-3">
                                <Link
                                    to={`/game?platform=${platformId}&page=${currentPage - 1}`}
                                    prefetch="intent"
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${currentPage === 1 ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700 hover:scale-105 shadow-lg'}`}
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
                                            className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold min-w-[50px] ${page === currentPage ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-xl scale-110' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-105'}`}
                                        >
                                            {page}
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    to={`/game?platform=${platformId}&page=${currentPage + 1}`}
                                    prefetch="intent"
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${currentPage === totalPages ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700 hover:scale-105 shadow-lg'}`}
                                    aria-disabled={currentPage === totalPages}
                                    onClick={(e) => { if (currentPage === totalPages) e.preventDefault(); }}
                                >
                                    <span>下一页</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                            <div className="mt-4 text-center text-sm text-gray-300">
                                第 {currentPage} 页，共 {totalPages} 页 | 总计 {totalGames} 个游戏
                            </div>
                        </nav>
                    </div>
                )}

                {/* Followed Games */}
                <section className="mt-16">
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl px-8 py-4 inline-block border border-white/10">
                            <h2 className="text-white font-bold text-2xl bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                                🌟 我关注的游戏
                            </h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {initialFollowedGames.map(game => (
                            <div key={game.id} className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 hover:bg-black/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl group border border-white/10">
                                <div className="relative overflow-hidden rounded-xl mb-4">
                                    <ImageWithToken
                                        originalSrc={game.cover}
                                        alt={game.name}
                                        imgId={`followed-game-${game.id}`}
                                        logName={`Followed game ${game.name}`}
                                        className="w-full h-40 rounded-xl object-cover transition-transform duration-500 group-hover:scale-110"
                                        isLazy={true}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                                    <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        即将发布
                                    </div>
                                </div>
                                <h4 className="text-white font-bold text-lg mb-3 group-hover:text-cyan-300 transition-colors leading-tight">{game.name}</h4>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-300 bg-white/10 rounded-full px-3 py-1">{game.releaseDate}</span>
                                    <div className="flex items-center space-x-1 bg-yellow-500/20 rounded-full px-3 py-1">
                                        <StarIcon className="w-4 h-4 text-yellow-400" />
                                        <span className="text-yellow-400 font-semibold">{game.rating}</span>
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