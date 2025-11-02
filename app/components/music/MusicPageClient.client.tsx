import { useState, useEffect, useRef } from 'react';
import { useImageToken, type ImageData } from '~/hooks/useMediaToken.client';
import { useMusicAnimations } from '~/hooks/useMusicAnimations.client';
import type { loader } from '~/routes/music';
import type { SerializeFrom } from '@remix-run/node';

type LoaderData = SerializeFrom<typeof loader>;

export default function MusicPageClient(loaderData: LoaderData) {
    const { initializeImageUrls, handleImageError } = useImageToken();

    const [dnaImages, setDnaImages] = useState<ImageData[]>(loaderData.initialDnaImages);
    const [musicImages, setMusicImages] = useState<ImageData[]>(loaderData.initialMusicImages);
    const [albums, setAlbums] = useState<ImageData[]>(loaderData.initialAlbums);
    const [isInitialized, setIsInitialized] = useState(false);

    // Refs for animated elements
    const scrollIndicator = useRef<HTMLDivElement>(null);
    const statsContent = useRef<HTMLDivElement>(null);
    const sceneContainer = useRef<HTMLDivElement>(null);
    const timelineTitle = useRef<HTMLHeadingElement>(null);
    const musicTimeline = useRef<HTMLDivElement>(null);
    const leftTimeline = useRef<HTMLDivElement>(null);
    const centralTitle = useRef<HTMLDivElement>(null);
    const mainArtist = useRef<HTMLDivElement>(null);
    const songList = useRef<HTMLDivElement>(null);
    const rightTimeline = useRef<HTMLDivElement>(null);
    const bottomInfo = useRef<HTMLDivElement>(null);
    const titleContainer = useRef<HTMLDivElement>(null);
    const dnaVisual = useRef<HTMLDivElement>(null);
    const keyInfo = useRef<HTMLDivElement>(null);
    const scrollHint = useRef<HTMLDivElement>(null);

    // Call the custom hook to handle animations
    useMusicAnimations({
        scrollIndicator,
        statsContent,
        sceneContainer,
        timelineTitle,
        musicTimeline,
        leftTimeline,
        centralTitle,
        mainArtist,
        songList,
        rightTimeline,
        bottomInfo,
        titleContainer,
        dnaVisual,
        keyInfo,
        scrollHint
    }, isInitialized);


    const getParticleStyle = (index: number) => {
        const size = Math.random() * 3 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const animationDelay = Math.random() * 20;
        const animationDuration = Math.random() * 10 + 10;

        return {
            width: `${size}px`,
            height: `${size}px`,
            left: `${x}%`,
            top: `${y}%`,
            animationDelay: `${animationDelay}s`,
            animationDuration: `${animationDuration}s`
        };
    };
    
    const getLyricStreamStyle = (index: number) => {
        const delays = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33];
        const speeds = [20, 24, 18, 26, 22, 19, 23, 17, 25, 21, 27, 20];
        const heights = [8, 15, 22, 29, 36, 43, 50, 57, 64, 71, 78, 85];

        return {
            top: `${heights[index % heights.length]}%`,
            left: '100%',
            animationDelay: `${delays[index % delays.length]}s`,
            animationDuration: `${speeds[index % speeds.length]}s`
        };
    };
    
    const getImageSrc = (id: string | number, imageList: ImageData[]) => {
        const image = imageList.find(img => img.id === id);
        if (image && image.src.includes('token=')) {
            return image.src;
        }
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';
    };

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                initializeImageUrls(dnaImages, setDnaImages, 'DNA'),
                initializeImageUrls(musicImages, setMusicImages, 'Music'),
                initializeImageUrls(albums, setAlbums, 'Album')
            ]);
            setIsInitialized(true);
        };
        
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="starfield-bg text-white overflow-x-hidden relative">
            <div className="starfield-container">
                <div className="stars"></div>
                <div className="stars2"></div>
                <div className="stars3"></div>
            </div>
            
            <div ref={scrollIndicator} className="constellation-progress"></div>
            
            <div className="min-h-screen relative z-10">
                <section className="galaxy-bg py-16 px-4 relative overflow-hidden">
                    <div className="particles-container opacity-30">
                        {Array.from({ length: 20 }).map((_, n) => (
                            <div className="particle" key={n} style={getParticleStyle(n)}></div>
                        ))}
                    </div>
                    
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div ref={titleContainer} className="lg:col-span-4 text-center lg:text-left opacity-0">
                            <h1 className="text-3xl md:text-4xl font-black mb-3 stellar-text">
                                音乐星河DNA
                            </h1>
                            <p className="text-lg text-galaxy-white font-light mb-4">
                                @wangjiajun
                            </p>
                            <div className="glass-effect rounded-xl p-4 mb-4">
                                <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                                    从<span className="text-star-gold font-semibold">电影原声</span>到<span className="text-aurora-purple font-semibold">动漫治愈</span>，跨越时空的音乐品味
                                </p>
                            </div>
                        </div>
                        
                        <div ref={dnaVisual} className="lg:col-span-5 opacity-0">
                            <div className="cosmic-glass rounded-2xl p-5 md:p-6 relative">
                                <div className="text-2xl md:text-3xl font-bold mb-4 cosmic-title text-center">
                                    <i className="fas fa-atom mr-2 text-star-gold"></i>DNA解析
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                    <div className="constellation-tag text-xs">
                                        <i className="fas fa-star text-star-gold mr-1"></i>电影原声
                                    </div>
                                    <div className="constellation-tag text-xs">
                                        <i className="fas fa-music text-aurora-purple mr-1"></i>中速节奏
                                    </div>
                                    <div className="constellation-tag text-xs">
                                        <i className="fas fa-heart text-aurora-purple mr-1"></i>动漫治愈
                                    </div>
                                </div>
                                <div className="flex justify-center gap-6">
                                    <div className="text-center">
                                        <div className="text-xl md:text-2xl font-bold text-star-gold glowing-number">99999+</div>
                                        <div className="text-xs text-galaxy-white">分钟</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl md:text-2xl font-bold text-aurora-purple glowing-number">6869</div>
                                        <div className="text-xs text-galaxy-white">首歌</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div ref={keyInfo} className="lg:col-span-3 text-center lg:text-right opacity-0">
                            <div className="space-y-4">
                                <div className="glass-effect rounded-xl p-4">
                                    <div className="text-sm text-galaxy-white mb-2">音乐旅程</div>
                                    <div className="text-lg font-bold text-white">2015-2024</div>
                                </div>
                                <div className="glass-effect rounded-xl p-4">
                                    <div className="text-sm text-galaxy-white mb-2">跨越年代</div>
                                    <div className="text-lg font-bold text-white">9年</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div ref={scrollHint} className="text-center mt-8 opacity-0">
                        <div className="stellar-pulse inline-block">
                            <i className="fas fa-angle-double-down text-xl text-star-gold"></i>
                        </div>
                        <p className="text-xs text-galaxy-white mt-1">探索音乐星河</p>
                    </div>
                </section>

                <section className="py-20 px-4 relative">
                    <div className="max-w-6xl mx-auto">
                        <h2 ref={timelineTitle} className="text-4xl md:text-5xl font-bold text-center mb-16 opacity-0 stellar-text">
                            <i className="fas fa-galaxy mr-4 text-star-gold"></i>
                            音乐星系演化史
                        </h2>
                        
                        <div ref={musicTimeline} className="music-timeline-container space-y-12">
                           <div className="music-card-item opacity-0 transform translate-y-20">
                               <div className="flex flex-col md:flex-row items-center rounded-3xl p-6 md:p-8 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600">
                                   <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                       <div className="text-2xl font-bold text-purple-100 mb-2">2015</div>
                                       <div className="text-sm text-purple-200">原声星座</div>
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">梦醒时分 (Live)</h3>
                                       <p className="text-purple-100 text-lg">梁静茹</p>
                                   </div>
                                   <div className="mt-4 md:mt-0 md:ml-8">
                                       <img src={getImageSrc('dd', dnaImages)} alt="梦醒时分 - 梁静茹" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'dd')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                   </div>
                               </div>
                           </div>
                           <div className="music-card-item opacity-0 transform translate-y-20">
                               <div className="flex flex-col md:flex-row items-center rounded-3xl p-6 md:p-8 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600">
                                   <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                       <div className="text-2xl font-bold text-indigo-100 mb-2">2017</div>
                                       <div className="text-sm text-indigo-200">分享星云</div>
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">Killer Song</h3>
                                       <p className="text-indigo-100 text-lg">麻枝准/やなぎなぎ</p>
                                   </div>
                                   <div className="mt-4 md:mt-0 md:ml-8">
                                       <img src={getImageSrc('i', dnaImages)} alt="Killer Song - 麻枝准" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'i')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                   </div>
                               </div>
                           </div>
                           <div className="music-card-item opacity-0 transform translate-y-20">
                               <div className="flex flex-col md:flex-row items-center rounded-3xl p-6 md:p-8 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600">
                                   <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                       <div className="text-2xl font-bold text-blue-100 mb-2">2017</div>
                                       <div className="text-sm text-blue-200">光芒星团</div>
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">The Ray of Light</h3>
                                       <p className="text-blue-100 text-lg">Vivienne</p>
                                   </div>
                                   <div className="mt-4 md:mt-0 md:ml-8">
                                       <img src={getImageSrc('d', dnaImages)} alt="The Ray of Light - Vivienne" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'd')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                   </div>
                               </div>
                           </div>
                           <div className="music-card-item opacity-0 transform translate-y-20">
                               <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-cyan-600 to-teal-600 rounded-3xl p-6 md:p-8 card-hover music-card">
                                   <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                       <div className="text-2xl font-bold text-cyan-100 mb-2">2018</div>
                                       <div className="text-sm text-cyan-200">心动星系</div>
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">Headlight</h3>
                                       <p className="text-cyan-100 text-lg">MONKEY MAJIK</p>
                                   </div>
                                   <div className="mt-4 md:mt-0 md:ml-8">
                                       <img src={getImageSrc('a', dnaImages)} alt="Headlight - MONKEY MAJIK" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'a')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                   </div>
                               </div>
                           </div>
                           <div className="music-card-item opacity-0 transform translate-y-20">
                              <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-teal-600 to-green-600 rounded-3xl p-6 md:p-8 card-hover music-card">
                                  <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                      <div className="text-2xl font-bold text-teal-100 mb-2">2019</div>
                                      <div className="text-sm text-teal-200">日出星座</div>
                                  </div>
                                  <div className="flex-1">
                                      <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">Renaissance</h3>
                                      <p className="text-teal-100 text-lg">Steve James/Clairity</p>
                                  </div>
                                  <div className="mt-4 md:mt-0 md:ml-8">
                                      <img src={getImageSrc('r', dnaImages)} alt="Renaissance - Steve James" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'r')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                  </div>
                              </div>
                           </div>
                           <div className="music-card-item opacity-0 transform translate-y-20">
                               <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-6 md:p-8 card-hover music-card">
                                   <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                       <div className="text-2xl font-bold text-pink-100 mb-2">2019</div>
                                       <div className="text-sm text-pink-200">最爱的情歌</div>
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">小满</h3>
                                       <p className="text-pink-100 text-lg">音阙诗听/王梓钰</p>
                                   </div>
                                   <div className="mt-4 md:mt-0 md:ml-8">
                                       <img src={getImageSrc('u', dnaImages)} alt="小满 - 音阙诗听" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'u')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                   </div>
                               </div>
                           </div>
                           <div className="music-card-item opacity-0 transform translate-y-20">
                               <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-6 md:p-8 card-hover music-card">
                                   <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                       <div className="text-2xl font-bold text-green-100 mb-2">2020</div>
                                       <div className="text-sm text-green-200">那年春天</div>
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">SLUMP -Japanese ver.-</h3>
                                       <p className="text-green-100 text-lg">Stray Kids</p>
                                   </div>
                                   <div className="mt-4 md:mt-0 md:ml-8">
                                       <img src={getImageSrc('v', dnaImages)} alt="SLUMP - Stray Kids" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'v')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                   </div>
                               </div>
                           </div>
                           <div className="music-card-item opacity-0 transform translate-y-20">
                               <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-6 md:p-8 card-hover music-card">
                                   <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                       <div className="text-2xl font-bold text-blue-100 mb-2">2021</div>
                                       <div className="text-sm text-blue-200">多次循环</div>
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">Phantom</h3>
                                       <p className="text-blue-100 text-lg">Vivienne</p>
                                   </div>
                                   <div className="mt-4 md:mt-0 md:ml-8">
                                       <img src={getImageSrc('bb', dnaImages)} alt="Phantom - Vivienne" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'bb')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                   </div>
                               </div>
                           </div>
                           <div className="music-card-item opacity-0 transform translate-y-20">
                               <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-6 md:p-8 card-hover music-card">
                                   <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                       <div className="text-2xl font-bold text-orange-100 mb-2">2022</div>
                                       <div className="text-sm text-orange-200">雨天心动</div>
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">Letting Go</h3>
                                       <p className="text-orange-100 text-lg">蔡健雅</p>
                                   </div>
                                   <div className="mt-4 md:mt-0 md:ml-8">
                                       <img src={getImageSrc('h', dnaImages)} alt="Letting Go - 蔡健雅" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'h')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                   </div>
                               </div>
                           </div>
                           <div className="music-card-item opacity-0 transform translate-y-20">
                               <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-purple-700 to-pink-700 rounded-3xl p-6 md:p-8 card-hover music-card">
                                   <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                       <div className="text-2xl font-bold text-purple-100 mb-2">2023</div>
                                       <div className="text-sm text-purple-200">最爱的情歌</div>
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">Somebody That I Used To...</h3>
                                       <p className="text-purple-100 text-lg">TRONICBOX</p>
                                   </div>
                                   <div className="mt-4 md:mt-0 md:ml-8">
                                       <img src={getImageSrc('m', dnaImages)} alt="Somebody That I Used To - TRONICBOX" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'm')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                   </div>
                               </div>
                           </div>
                           <div className="music-card-item opacity-0 transform translate-y-20">
                               <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-6 md:p-8 card-hover music-card stellar-glow">
                                   <div className="text-center md:text-left md:mr-8 mb-4 md:mb-0">
                                       <div className="text-2xl font-bold text-yellow-100 mb-2">2024</div>
                                       <div className="text-sm text-yellow-200">超新星</div>
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white">rich-man</h3>
                                       <p className="text-yellow-100 text-lg">林ゆうき</p>
                                   </div>
                                   <div className="mt-4 md:mt-0 md:ml-8">
                                       <img src={getImageSrc('y', dnaImages)} alt="rich-man - 林ゆうき" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'y')} className="w-20 h-20 rounded-xl shadow-lg transform-gpu" loading="lazy" decoding="async" />
                                   </div>
                               </div>
                           </div>
                        </div>
                    </div>
                </section>

                <section className="stats-section min-h-screen galaxy-bg flex items-center justify-center py-16 px-4">
                    <div className="particles-container opacity-30">
                        {Array.from({ length: 20 }).map((_, n) => (
                            <div className="particle" key={n} style={getParticleStyle(n)}></div>
                        ))}
                    </div>
                    
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            
                            <div ref={statsContent} className="stats-content text-center lg:text-left opacity-0" data-animation="slideInLeft">
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-6 stellar-text">你最爱下午听歌</h1>
                                
                                <div className="time-info mb-8">
                                    <p className="text-lg text-galaxy-white mb-4">你全年最活跃的时段</p>
                                    <div className="time-display text-2xl md:text-3xl font-bold text-white cosmic-glass rounded-2xl px-6 py-3 inline-block shadow-lg mb-6">
                                        14:00-18:00
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="stat-card cosmic-glass rounded-xl p-4 shadow-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <i className="fas fa-headphones text-xl text-star-gold mr-2"></i>
                                            <span className="text-sm font-semibold text-galaxy-white">总听歌时长</span>
                                        </div>
                                        <div className="text-2xl font-bold text-star-gold glowing-number">387</div>
                                        <div className="text-xs text-galaxy-white">小时 28分</div>
                                    </div>
                                    
                                    <div className="stat-card cosmic-glass rounded-xl p-4 shadow-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <i className="fas fa-music text-xl text-aurora-purple mr-2"></i>
                                            <span className="text-sm font-semibold text-galaxy-white">听歌总数</span>
                                        </div>
                                        <div className="text-2xl font-bold text-aurora-purple glowing-number">1330</div>
                                        <div className="text-xs text-galaxy-white">首歌曲</div>
                                    </div>
                                    
                                    <div className="stat-card cosmic-glass rounded-xl p-4 shadow-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <i className="fas fa-desktop text-xl text-star-gold mr-2"></i>
                                            <span className="text-sm font-semibold text-galaxy-white">电脑听歌</span>
                                        </div>
                                        <div className="text-2xl font-bold text-star-gold glowing-number">128</div>
                                        <div className="text-xs text-galaxy-white">小时</div>
                                    </div>
                                    
                                    <div className="stat-card cosmic-glass rounded-xl p-4 shadow-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <i className="fas fa-podcast text-xl text-aurora-purple mr-2"></i>
                                            <span className="text-sm font-semibold text-galaxy-white">播客时间</span>
                                        </div>
                                        <div className="text-2xl font-bold text-aurora-purple glowing-number">2</div>
                                        <div className="text-xs text-galaxy-white">小时</div>
                                    </div>
                                </div>

                                <div className="poetic-text text-center lg:text-left">
                                    <p className="text-lg font-medium text-white mb-2">大家都急着赶路</p>
                                    <p className="text-lg text-galaxy-white mb-2">只有你</p>
                                    <p className="text-lg text-galaxy-white">在音乐里打捞最后的晚霞</p>
                                </div>
                            </div>

                            <div ref={sceneContainer} className="scene-container opacity-0" data-animation="slideInRight">
                                <div className="afternoon-scene relative w-full max-w-md mx-auto h-80">
                                    <div className="sun absolute top-8 right-16 w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg animate-pulse-slow">
                                        <div className="sun-ray absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-yellow-300 opacity-60"></div>
                                        <div className="sun-ray absolute -right-2 top-1/2 transform -translate-y-1/2 w-6 h-0.5 bg-yellow-300 opacity-60"></div>
                                        <div className="sun-ray absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-yellow-300 opacity-60"></div>
                                        <div className="sun-ray absolute -left-2 top-1/2 transform -translate-y-1/2 w-6 h-0.5 bg-yellow-300 opacity-60"></div>
                                    </div>
                                    <div className="cloud absolute top-6 left-8 w-14 h-7 bg-white rounded-full shadow-md opacity-80">
                                        <div className="absolute -left-2 top-1 w-7 h-5 bg-white rounded-full"></div>
                                        <div className="absolute -right-2 top-1 w-7 h-5 bg-white rounded-full"></div>
                                    </div>
                                    <div className="cloud absolute top-12 right-28 w-10 h-5 bg-white rounded-full shadow-md opacity-70">
                                        <div className="absolute -left-1 top-0.5 w-5 h-3 bg-white rounded-full"></div>
                                        <div className="absolute -right-1 top-0.5 w-5 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <div className="hill absolute bottom-0 left-0 w-28 h-16 bg-gradient-to-t from-orange-400 to-red-400 rounded-t-full transform rotate-12 opacity-80"></div>
                                    <div className="hill absolute bottom-0 right-8 w-32 h-20 bg-gradient-to-t from-red-400 to-orange-500 rounded-t-full transform -rotate-6 opacity-70"></div>
                                    <div className="music-notes absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <i className="fas fa-music text-white/30 text-4xl animate-float"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="keywords-section min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-16 px-4">
                    <div className="container mx-auto max-w-6xl">
                        
                        <div className="text-center mb-12" data-animation="fadeInUp">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 stellar-text">你的年度音乐关键词</h2>
                            <div className="flex justify-center items-center space-x-6 mb-8">
                                <div className="keyword-highlight">
                                    <div className="text-2xl md:text-3xl font-bold text-star-gold glowing-number">发现</div>
                                    <div className="text-sm text-galaxy-white">145次</div>
                                </div>
                                <div className="text-xl text-galaxy-white">×</div>
                                <div className="keyword-highlight">
                                    <div className="text-2xl md:text-3xl font-bold text-aurora-purple glowing-number">梦想</div>
                                    <div className="text-sm text-galaxy-white">261次</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            
                            <div className="lyrics-stream-container" data-animation="slideInLeft">
                                <div className="stream-container relative h-[36rem] cosmic-glass rounded-3xl p-6 shadow-lg overflow-hidden">
                                    <div className="text-center mb-4">
                                        <h3 className="text-lg font-bold text-white mb-2">年度歌词记忆</h3>
                                        <div className="text-sm text-galaxy-white">那些触动心灵的句子</div>
                                    </div>
                                    
                                    <div className="lyric-stream-area relative h-[32rem] overflow-hidden">
                                        {loaderData.selectedLyricsData.map((lyric, index) => (
                                            <div key={index} className="lyric-stream-item absolute whitespace-nowrap bg-gradient-to-r from-purple-200/80 to-pink-200/80 backdrop-blur-sm rounded-full px-5 py-3 shadow-md text-base font-medium text-gray-800"
                                                 style={getLyricStreamStyle(index)}>
                                                <div className="flex items-center">
                                                    <span className="mr-2">{lyric.text}</span>
                                                    <span className="text-xs text-gray-600">- {lyric.song}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="album-covers h-96" data-animation="slideInRight">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-bold text-white mb-4">常听专辑</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 h-80">
                                    {albums.slice(0, 4).map((album, index) => (
                                        <div key={album.id} className="album-item transform transition-all duration-300 hover:scale-110 flex items-center justify-center" style={{ animationDelay: `${index * 0.1}s` }}>
                                            <img
                                                src={getImageSrc(album.id, albums)}
                                                alt={album.alt || ''}
                                                onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, album.id)}
                                                className="w-full h-full object-cover rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform-gpu"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="artist-showcase-section min-h-screen py-16 px-4 relative galaxy-bg">
                    <div className="absolute inset-0 opacity-20">
                      <div className="floating absolute top-20 left-10 w-32 h-32 bg-white rounded-full opacity-15"></div>
                      <div className="floating absolute top-40 right-20 w-20 h-20 bg-pink-300 rounded-full opacity-20" style={{ animationDelay: '-1s' }}></div>
                      <div className="floating absolute bottom-32 left-1/4 w-16 h-16 bg-blue-300 rounded-full opacity-18" style={{ animationDelay: '-2s' }}></div>
                      <div className="floating absolute top-1/2 right-1/3 w-24 h-24 bg-purple-300 rounded-full opacity-15" style={{ animationDelay: '-3s' }}></div>
                    </div>
                    
                    <div className="w-full max-w-7xl mx-auto grid grid-cols-12 gap-6 items-center min-h-[80vh]">
                        
                        <div ref={leftTimeline} className="col-span-12 md:col-span-3 opacity-0">
                            <div className="text-center md:text-left space-y-6">
                                <h3 className="text-lg font-bold text-white mb-6">历年最爱歌手</h3>
                                
                                <div className="timeline-item flex md:flex-col items-center md:items-center space-x-4 md:space-x-0 md:space-y-2">
                                    <div className="flex-shrink-0 flex flex-col items-center">
                                        <div className="text-center mb-2">
                                            <div className="text-sm font-bold text-white mb-1">2023</div>
                                            <div className="text-base font-black text-white">四季音色</div>
                                        </div>
                                        <div className="w-20 h-20 md:w-25 md:h-25 rounded-full overflow-hidden shadow-lg border-2 border-white/40">
                                            <img src={getImageSrc('ee', musicImages)} alt="四季音色" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'ee')} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" loading="lazy" decoding="async" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="timeline-item flex md:flex-col items-center md:items-center space-x-4 md:space-x-0 md:space-y-2">
                                    <div className="flex-shrink-0 flex flex-col items-center">
                                        <div className="text-center mb-2">
                                            <div className="text-sm font-bold text-white mb-1">2022</div>
                                            <div className="text-base font-black text-white">Vivienne</div>
                                        </div>
                                        <div className="w-20 h-20 md:w-25 md:h-25 rounded-full overflow-hidden shadow-lg border-2 border-white/40">
                                            <img src={getImageSrc('f', musicImages)} alt="Vivienne 2022" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'f-2022')} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" loading="lazy" decoding="async" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-span-12 md:col-span-6 text-center">
                            <div ref={centralTitle} className="mb-8 opacity-0">
                                <h1 className="text-xl md:text-2xl font-bold text-white mb-2">你的2024年度歌手</h1>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 stellar-text">Vivienne</h2>
                            </div>
                            
                            <div ref={mainArtist} className="mb-8 opacity-0">
                                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden shadow-2xl mx-auto mb-6 main-artist-image">
                                    <img src={getImageSrc('f', musicImages)} alt="Vivienne 2024年度歌手" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'f-main')} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 transform-gpu" loading="lazy" decoding="async" fetchPriority="high" />
                                </div>
                            </div>
                            
                            <div ref={songList} className="opacity-0">
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 mb-6">
                                    <div className="space-y-3 text-left">
                                        <div className="flex items-center justify-between py-2 border-b border-white/20">
                                            <div className="flex items-center">
                                                <span className="text-white/70 mr-3 text-sm font-medium">1</span>
                                                <span className="text-white text-sm md:text-base font-medium">World of You</span>
                                            </div>
                                            <span className="text-white/70 text-sm">96次</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-white/20">
                                            <div className="flex items-center">
                                                <span className="text-white/70 mr-3 text-sm font-medium">2</span>
                                                <span className="text-white text-sm md:text-base font-medium">Falling in Love Again</span>
                                            </div>
                                            <span className="text-white/70 text-sm">118次</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-white/20">
                                            <div className="flex items-center">
                                                <span className="text-white/70 mr-3 text-sm font-medium">3</span>
                                                <span className="text-white text-sm md:text-base font-medium">Can&apos;t look away</span>
                                            </div>
                                            <span className="text-white/70 text-sm">176次</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-white/20">
                                            <div className="flex items-center">
                                                <span className="text-white/70 mr-3 text-sm font-medium">4</span>
                                                <span className="text-white text-sm md:text-base font-medium">Distant Memory</span>
                                            </div>
                                            <span className="text-white/70 text-sm">80次</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center">
                                                <span className="text-white/70 mr-3 text-sm font-medium">5</span>
                                                <span className="text-white text-sm md:text-base font-medium">Phantom</span>
                                            </div>
                                            <span className="text-white/70 text-sm">132次</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full px-6 py-2 text-white font-medium transition-all duration-300 transform hover:scale-105 text-sm">
                                    已关注
                                </button>
                            </div>
                        </div>
                        
                        <div ref={rightTimeline} className="col-span-12 md:col-span-3 opacity-0">
                            <div className="text-center md:text-right space-y-6">
                                <h3 className="text-lg font-bold text-white mb-6 md:text-right">音乐时光机</h3>
                                
                                <div className="timeline-item flex md:flex-col items-center md:items-center space-x-4 md:space-x-0 md:space-y-2">
                                    <div className="flex-shrink-0 flex flex-col items-center md:order-2">
                                        <div className="text-center mb-2">
                                            <div className="text-sm font-bold text-white mb-1">2021</div>
                                            <div className="text-base font-black text-white">Vivienne</div>
                                        </div>
                                        <div className="w-20 h-20 md:w-25 md:h-25 rounded-full overflow-hidden shadow-lg border-2 border-white/40">
                                            <img src={getImageSrc('f', musicImages)} alt="Vivienne 2021" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'f-2021')} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" loading="lazy" decoding="async" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="timeline-item flex md:flex-col items-center md:items-center space-x-4 md:space-x-0 md:space-y-2">
                                    <div className="flex-shrink-0 flex flex-col items-center md:order-2">
                                        <div className="text-center mb-2">
                                            <div className="text-sm font-bold text-white mb-1">2020</div>
                                            <div className="text-base font-black text-white">FELT</div>
                                        </div>
                                        <div className="w-20 h-20 md:w-25 md:h-25 rounded-full overflow-hidden shadow-lg border-2 border-white/40">
                                            <img src={getImageSrc('o', musicImages)} alt="FELT 2020" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, '0')} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" loading="lazy" decoding="async" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="timeline-item flex md:flex-col items-center md:items-center space-x-4 md:space-x-0 md:space-y-2">
                                    <div className="flex-shrink-0 flex flex-col items-center md:order-2">
                                        <div className="text-center mb-2">
                                            <div className="text-sm font-bold text-white mb-1">2019</div>
                                            <div className="text-base font-black text-white">FELT</div>
                                        </div>
                                        <div className="w-20 h-20 md:w-25 md:h-25 rounded-full overflow-hidden shadow-lg border-2 border-white/40">
                                            <img src={getImageSrc('o', musicImages)} alt="FELT 2019" onError={(e) => handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>, 'o')} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" loading="lazy" decoding="async" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div ref={bottomInfo} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center opacity-0">
                        <div className="text-xs text-white/60 mb-2">🎵 你的音乐DNA已解锁</div>
                        <div className="text-xs text-white/60">每一首歌都是你独特品味的见证</div>
                    </div>
                </section>
            </div>
        </div>
    );
} 