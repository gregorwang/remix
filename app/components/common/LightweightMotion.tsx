import React, { useEffect, useRef, useState } from 'react';

interface AnimationProps {
  children: React.ReactNode;
  className?: string;
  initial?: { opacity?: number; x?: number; y?: number; scale?: number };
  animate?: { opacity?: number; x?: number; y?: number; scale?: number };
  whileInView?: { opacity?: number; x?: number; y?: number; scale?: number };
  viewport?: { once?: boolean };
  transition?: { duration?: number; delay?: number };
}

// 轻量级动画组件，使用CSS transitions替代framer-motion
export const LightMotion: React.FC<AnimationProps> = ({
  children,
  className = '',
  initial = {},
  animate = {},
  whileInView = {},
  viewport = { once: true },
  transition = { duration: 0.8, delay: 0 }
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 如果有whileInView，使用Intersection Observer
    if (Object.keys(whileInView).length > 0) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (viewport.once) {
              observer.unobserve(element);
            }
          } else if (!viewport.once) {
            setIsVisible(false);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(element);
      return () => observer.unobserve(element);
    } else {
      // 直接动画
      setTimeout(() => setIsAnimated(true), (transition.delay || 0) * 1000);
    }
  }, [whileInView, viewport, transition.delay]);

  const getStyles = () => {
    const hasInViewAnimation = Object.keys(whileInView).length > 0;
    const targetState = hasInViewAnimation ? whileInView : animate;
    const shouldAnimate = hasInViewAnimation ? isVisible : isAnimated;

    const style: React.CSSProperties = {
      transition: `all ${transition.duration}s ease-out`,
      opacity: shouldAnimate ? (targetState.opacity ?? 1) : (initial.opacity ?? 1),
      transform: shouldAnimate 
        ? `translate(${targetState.x ?? 0}px, ${targetState.y ?? 0}px) scale(${targetState.scale ?? 1})`
        : `translate(${initial.x ?? 0}px, ${initial.y ?? 0}px) scale(${initial.scale ?? 1})`,
    };

    return style;
  };

  return (
    <div ref={elementRef} className={className} style={getStyles()}>
      {children}
    </div>
  );
};

// 简化的导出，模拟framer-motion的API
export const motion = {
  div: (props: AnimationProps & React.HTMLAttributes<HTMLDivElement>) => (
    <LightMotion {...props}>{props.children}</LightMotion>
  ),
  section: (props: AnimationProps & React.HTMLAttributes<HTMLElement>) => (
    <LightMotion {...props}>{props.children}</LightMotion>
  ),
  footer: (props: AnimationProps & React.HTMLAttributes<HTMLElement>) => (
    <LightMotion {...props}>{props.children}</LightMotion>
  ),
  h1: (props: AnimationProps & React.HTMLAttributes<HTMLHeadingElement>) => (
    <LightMotion {...props}>{props.children}</LightMotion>
  ),
  h2: (props: AnimationProps & React.HTMLAttributes<HTMLHeadingElement>) => (
    <LightMotion {...props}>{props.children}</LightMotion>
  ),
  h3: (props: AnimationProps & React.HTMLAttributes<HTMLHeadingElement>) => (
    <LightMotion {...props}>{props.children}</LightMotion>
  ),
  p: (props: AnimationProps & React.HTMLAttributes<HTMLParagraphElement>) => (
    <LightMotion {...props}>{props.children}</LightMotion>
  ),
  button: (props: AnimationProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <LightMotion {...props}>{props.children}</LightMotion>
  ),
  li: (props: AnimationProps & React.LiHTMLAttributes<HTMLLIElement>) => (
    <LightMotion {...props}>{props.children}</LightMotion>
  ),
}; 