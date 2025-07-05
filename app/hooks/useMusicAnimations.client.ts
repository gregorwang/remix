import { useEffect } from 'react';
import type { RefObject } from 'react';

// Animation helper function, moved from the route component.
const animateElement = (target: HTMLElement | null, options: {
    duration?: number;
    easing?: string;
    opacity?: number | [number, number];
    translateY?: number | [number, number];
    translateX?: number | [number, number];
    scale?: number | [number, number];
    delay?: number;
}) => {
    if (!target) return;
    target.style.transition = `all ${options.duration || 800}ms ${options.easing || 'ease-out'}`;
    
    const apply = () => {
        if (options.opacity !== undefined) target.style.opacity = `${Array.isArray(options.opacity) ? options.opacity[1] : options.opacity}`;
        let transform = '';
        if (options.translateY !== undefined) transform += ` translateY(${Array.isArray(options.translateY) ? options.translateY[1] : options.translateY}px)`;
        if (options.translateX !== undefined) transform += ` translateX(${Array.isArray(options.translateX) ? options.translateX[1] : options.translateX}px)`;
        if (options.scale !== undefined) transform += ` scale(${Array.isArray(options.scale) ? options.scale[1] : options.scale})`;
        target.style.transform = transform;
    };

    if (options.delay) {
        setTimeout(apply, options.delay);
    } else {
        apply();
    }
};

const optimizeScroll = (fn: () => void) => fn;

interface AnimationRefs {
    scrollIndicator: RefObject<HTMLDivElement>;
    statsContent: RefObject<HTMLDivElement>;
    sceneContainer: RefObject<HTMLDivElement>;
    timelineTitle: RefObject<HTMLHeadingElement>;
    musicTimeline: RefObject<HTMLDivElement>;
    leftTimeline: RefObject<HTMLDivElement>;
    centralTitle: RefObject<HTMLDivElement>;
    mainArtist: RefObject<HTMLDivElement>;
    songList: RefObject<HTMLDivElement>;
    rightTimeline: RefObject<HTMLDivElement>;
    bottomInfo: RefObject<HTMLDivElement>;
    titleContainer: RefObject<HTMLDivElement>;
    dnaVisual: RefObject<HTMLDivElement>;
    keyInfo: RefObject<HTMLDivElement>;
    scrollHint: RefObject<HTMLDivElement>;
}

export function useMusicAnimations(refs: AnimationRefs, isInitialized: boolean) {
    useEffect(() => {
        // Do not run animations until image tokens are initialized
        if (!isInitialized) return;

        const {
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
        } = refs;

        const handleScroll = optimizeScroll(() => {
            if (typeof window === 'undefined') return;
            const scrolled = window.pageYOffset;
            const rate = scrolled / (document.body.scrollHeight - window.innerHeight);

            if (scrollIndicator.current) {
                scrollIndicator.current.style.transform = `scaleX(${rate})`;
            }

            if (timelineTitle.current) {
                const titlePosition = timelineTitle.current.getBoundingClientRect().top;
                if (titlePosition < window.innerHeight * 0.8 && titlePosition > -100) {
                    animateElement(timelineTitle.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, easing: 'easeOutCubic' });
                }
            }

            if (musicTimeline.current) {
                const musicCards = musicTimeline.current.querySelectorAll('.music-card-item');
                musicCards.forEach((card, index) => {
                    const cardPosition = card.getBoundingClientRect().top;
                    if (cardPosition < window.innerHeight * 0.8 && cardPosition > -200) {
                        const htmlCard = card as HTMLElement;
                        if (htmlCard.style.opacity === '0' || !htmlCard.style.opacity) {
                            animateElement(htmlCard, {
                                opacity: [0, 1],
                                translateY: [50, 0],
                                scale: [0.9, 1],
                                duration: 800,
                                delay: index * 100,
                                easing: 'easeOutCubic'
                            });
                        }
                    }
                });
            }
        });

        // Initial animations
        const timer = setTimeout(() => {
            animateElement(titleContainer.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, delay: 100, easing: 'easeOutCubic' });
            animateElement(dnaVisual.current, { opacity: [0, 1], scale: [0.9, 1], duration: 800, delay: 300, easing: 'easeOutCubic' });
            animateElement(keyInfo.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, delay: 500, easing: 'easeOutCubic' });
            animateElement(scrollHint.current, { opacity: [0, 1], translateY: [20, 0], duration: 800, delay: 700, easing: 'easeOutCubic' });
            animateElement(statsContent.current, { opacity: [0, 1], translateX: [-30, 0], duration: 1000, delay: 900, easing: 'easeOutCubic' });
            animateElement(sceneContainer.current, { opacity: [0, 1], translateX: [30, 0], duration: 1000, delay: 1100, easing: 'easeOutCubic' });
            animateElement(leftTimeline.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, delay: 800, easing: 'easeOutCubic' });
            animateElement(centralTitle.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, delay: 1200, easing: 'easeOutCubic' });
            animateElement(mainArtist.current, { opacity: [0, 1], scale: [0.9, 1], duration: 800, delay: 1600, easing: 'easeOutCubic' });
            animateElement(songList.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, delay: 2000, easing: 'easeOutCubic' });
            animateElement(rightTimeline.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, delay: 2400, easing: 'easeOutCubic' });
            animateElement(bottomInfo.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, delay: 2800, easing: 'easeOutCubic' });
            
            window.addEventListener('scroll', handleScroll, { passive: true });
        }, 500);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isInitialized, refs]);
} 