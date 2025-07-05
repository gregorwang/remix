// 性能监控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private startTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 开始计时
  startTimer(name: string): void {
    if (typeof performance !== 'undefined') {
      this.startTimes.set(name, performance.now());
    }
  }

  // 结束计时并记录
  endTimer(name: string): number {
    if (typeof performance !== 'undefined') {
      const startTime = this.startTimes.get(name);
      if (startTime) {
        const duration = performance.now() - startTime;
        console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
        this.startTimes.delete(name);
        return duration;
      }
    }
    return 0;
  }

  // 测量路由跳转时间
  measureRouteChange(from: string, to: string): void {
    this.startTimer(`route-${from}-to-${to}`);
  }

  // 测量组件渲染时间
  measureComponentRender(componentName: string): () => void {
    this.startTimer(`component-${componentName}`);
    return () => this.endTimer(`component-${componentName}`);
  }

  // 获取页面加载性能指标
  getPageMetrics(): void {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('📊 页面性能指标:');
        console.log(`  DNS查询: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
        console.log(`  TCP连接: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
        console.log(`  请求响应: ${(navigation.responseEnd - navigation.requestStart).toFixed(2)}ms`);
        console.log(`  DOM解析: ${(navigation.domContentLoadedEventEnd - navigation.responseEnd).toFixed(2)}ms`);
        console.log(`  总加载时间: ${(navigation.loadEventEnd - navigation.navigationStart).toFixed(2)}ms`);
      }
    }
  }
}

// 便捷函数
export const perf = PerformanceMonitor.getInstance();

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    startTimer: (name: string) => perf.startTimer(name),
    endTimer: (name: string) => perf.endTimer(name),
    measureComponent: (name: string) => perf.measureComponentRender(name),
    getMetrics: () => perf.getPageMetrics(),
  };
} 