/**
 * Advanced Monitoring and Analytics System
 * Real-time performance monitoring, user analytics, medical data insights,
 * and predictive alerting for healthcare applications
 */

import { cacheSystem } from "./AdvancedCachingSystem";
import { databaseEngine } from "./DatabaseOptimizationEngine";

interface MetricDefinition {
  name: string;
  type: "counter" | "gauge" | "histogram" | "timer";
  unit: string;
  description: string;
  tags?: Record<string, string>;
  threshold?: {
    warning: number;
    critical: number;
  };
}

interface MetricValue {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
  metadata?: any;
}

interface Alert {
  id: string;
  metric: string;
  level: "info" | "warning" | "critical";
  message: string;
  timestamp: number;
  value: number;
  threshold: number;
  resolved: boolean;
  resolvedAt?: number;
}

interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  pageViews: Array<{
    page: string;
    timestamp: number;
    loadTime: number;
  }>;
  actions: Array<{
    type: string;
    target: string;
    timestamp: number;
    metadata?: any;
  }>;
  medicalInteractions: Array<{
    type: "view" | "create" | "edit" | "delete";
    resource: string;
    patientId?: string;
    timestamp: number;
    duration?: number;
  }>;
  errors: Array<{
    message: string;
    timestamp: number;
    recovered: boolean;
  }>;
  performance: {
    totalLoadTime: number;
    interactionLatency: number[];
    memoryUsage: number[];
  };
}

interface AnalyticsReport {
  timeRange: { start: number; end: number };
  systemMetrics: {
    availability: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  userMetrics: {
    activeUsers: number;
    sessionDuration: number;
    pageViews: number;
    bounceRate: number;
  };
  medicalMetrics: {
    patientRecordsAccessed: number;
    recordsCreated: number;
    recordsModified: number;
    averageConsultationTime: number;
    criticalAlertsTriggered: number;
  };
  performanceInsights: {
    slowestPages: Array<{ page: string; avgTime: number }>;
    mostErrorProneFeatures: Array<{ feature: string; errorCount: number }>;
    peakUsageTimes: Array<{ hour: number; userCount: number }>;
  };
  predictions: {
    expectedLoad: number;
    maintenanceRecommendations: string[];
    scalingNeeds: string[];
  };
}

class MetricsCollector {
  private metrics = new Map<string, MetricValue[]>();
  private metricDefinitions = new Map<string, MetricDefinition>();
  private maxHistorySize = 1000;

  constructor() {
    this.initializeDefaultMetrics();
  }

  private initializeDefaultMetrics(): void {
    // System metrics
    this.defineMetric({
      name: "system.cpu.usage",
      type: "gauge",
      unit: "percent",
      description: "CPU usage percentage",
      threshold: { warning: 70, critical: 90 },
    });

    this.defineMetric({
      name: "system.memory.usage",
      type: "gauge",
      unit: "mb",
      description: "Memory usage in megabytes",
      threshold: { warning: 1000, critical: 1500 },
    });

    this.defineMetric({
      name: "api.response.time",
      type: "histogram",
      unit: "ms",
      description: "API response time",
      threshold: { warning: 500, critical: 2000 },
    });

    this.defineMetric({
      name: "api.requests.count",
      type: "counter",
      unit: "requests",
      description: "Total API requests",
    });

    this.defineMetric({
      name: "api.errors.count",
      type: "counter",
      unit: "errors",
      description: "API error count",
      threshold: { warning: 10, critical: 50 },
    });

    // Healthcare-specific metrics
    this.defineMetric({
      name: "medical.records.accessed",
      type: "counter",
      unit: "records",
      description: "Number of medical records accessed",
    });

    this.defineMetric({
      name: "medical.consultation.duration",
      type: "histogram",
      unit: "minutes",
      description: "Consultation duration",
    });

    this.defineMetric({
      name: "medical.critical.alerts",
      type: "counter",
      unit: "alerts",
      description: "Critical medical alerts triggered",
      threshold: { warning: 1, critical: 5 },
    });

    // User experience metrics
    this.defineMetric({
      name: "user.page.load.time",
      type: "histogram",
      unit: "ms",
      description: "Page load time",
      threshold: { warning: 3000, critical: 5000 },
    });

    this.defineMetric({
      name: "user.session.duration",
      type: "histogram",
      unit: "minutes",
      description: "User session duration",
    });
  }

  defineMetric(definition: MetricDefinition): void {
    this.metricDefinitions.set(definition.name, definition);
    if (!this.metrics.has(definition.name)) {
      this.metrics.set(definition.name, []);
    }
  }

  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>,
    metadata?: any
  ): void {
    const history = this.metrics.get(name) || [];

    history.push({
      timestamp: Date.now(),
      value,
      tags,
      metadata,
    });

    // Maintain history size
    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    this.metrics.set(name, history);

    // Check for alerts
    this.checkAlert(name, value);
  }

  private checkAlert(metricName: string, value: number): void {
    const definition = this.metricDefinitions.get(metricName);
    if (!definition?.threshold) return;

    const alertManager = AlertManager.getInstance();

    if (value >= definition.threshold.critical) {
      alertManager.triggerAlert({
        metric: metricName,
        level: "critical",
        value,
        threshold: definition.threshold.critical,
        message: `Critical threshold exceeded for ${metricName}: ${value} >= ${definition.threshold.critical}`,
      });
    } else if (value >= definition.threshold.warning) {
      alertManager.triggerAlert({
        metric: metricName,
        level: "warning",
        value,
        threshold: definition.threshold.warning,
        message: `Warning threshold exceeded for ${metricName}: ${value} >= ${definition.threshold.warning}`,
      });
    }
  }

  getMetricHistory(
    name: string,
    timeRange?: { start: number; end: number }
  ): MetricValue[] {
    const history = this.metrics.get(name) || [];

    if (!timeRange) return history;

    return history.filter(
      (metric) =>
        metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    );
  }

  getMetricStats(
    name: string,
    timeRange?: { start: number; end: number }
  ): {
    min: number;
    max: number;
    avg: number;
    count: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const history = this.getMetricHistory(name, timeRange);
    if (history.length === 0) return null;

    const values = history.map((h) => h.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      count: values.length,
      p50: values[Math.floor(values.length * 0.5)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
    };
  }

  getAllMetrics(): Map<string, MetricValue[]> {
    return new Map(this.metrics);
  }
}

class AlertManager {
  private static instance: AlertManager;
  private alerts = new Map<string, Alert>();
  private alertHistory: Alert[] = [];
  private alertSubscriptions = new Map<string, Array<(alert: Alert) => void>>();

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  triggerAlert(params: {
    metric: string;
    level: "info" | "warning" | "critical";
    value: number;
    threshold: number;
    message: string;
  }): void {
    const alertId = `${params.metric}:${params.level}`;
    const existingAlert = this.alerts.get(alertId);

    // Don't duplicate alerts
    if (existingAlert && !existingAlert.resolved) {
      return;
    }

    const alert: Alert = {
      id: alertId,
      metric: params.metric,
      level: params.level,
      message: params.message,
      timestamp: Date.now(),
      value: params.value,
      threshold: params.threshold,
      resolved: false,
    };

    this.alerts.set(alertId, alert);
    this.alertHistory.unshift(alert);

    // Keep history manageable
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(0, 1000);
    }

    // Notify subscribers
    this.notifySubscribers(alert);

    // Cache for persistence
    cacheSystem.set(`alert:${alertId}`, alert, {
      ttl: 86400000, // 24 hours
      encrypt: params.level === "critical",
    });

    console.warn(`🚨 ${params.level.toUpperCase()} Alert:`, alert);
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      this.alerts.set(alertId, alert);
    }
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => !a.resolved);
  }

  getAlertHistory(limit = 100): Alert[] {
    return this.alertHistory.slice(0, limit);
  }

  subscribeToAlerts(callback: (alert: Alert) => void, filter?: string): void {
    const key = filter || "all";
    const subscribers = this.alertSubscriptions.get(key) || [];
    subscribers.push(callback);
    this.alertSubscriptions.set(key, subscribers);
  }

  private notifySubscribers(alert: Alert): void {
    // Notify general subscribers
    const generalSubscribers = this.alertSubscriptions.get("all") || [];
    generalSubscribers.forEach((callback) => callback(alert));

    // Notify metric-specific subscribers
    const metricSubscribers = this.alertSubscriptions.get(alert.metric) || [];
    metricSubscribers.forEach((callback) => callback(alert));

    // Notify level-specific subscribers
    const levelSubscribers = this.alertSubscriptions.get(alert.level) || [];
    levelSubscribers.forEach((callback) => callback(alert));
  }
}

class UserAnalytics {
  private sessions = new Map<string, UserSession>();
  private anonymizedEvents: any[] = [];

  startSession(sessionId: string, userId?: string): void {
    this.sessions.set(sessionId, {
      id: sessionId,
      userId,
      startTime: Date.now(),
      pageViews: [],
      actions: [],
      medicalInteractions: [],
      errors: [],
      performance: {
        totalLoadTime: 0,
        interactionLatency: [],
        memoryUsage: [],
      },
    });
  }

  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.endTime = Date.now();

      // Cache session data
      cacheSystem.set(`session:${sessionId}`, session, {
        ttl: 604800000, // 7 days
        encrypt: !!session.userId,
        compress: true,
      });

      // Create anonymized event
      this.anonymizedEvents.push({
        timestamp: session.startTime,
        duration: session.endTime - session.startTime,
        pageViews: session.pageViews.length,
        actions: session.actions.length,
        medicalInteractions: session.medicalInteractions.length,
        errors: session.errors.length,
        averageLoadTime:
          session.pageViews.reduce((sum, pv) => sum + pv.loadTime, 0) /
            session.pageViews.length || 0,
      });
    }
  }

  trackPageView(sessionId: string, page: string, loadTime: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.pageViews.push({
        page,
        timestamp: Date.now(),
        loadTime,
      });

      // Record metric
      MetricsCollector.prototype.recordMetric("user.page.load.time", loadTime, {
        page,
      });
    }
  }

  trackUserAction(
    sessionId: string,
    type: string,
    target: string,
    metadata?: any
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.actions.push({
        type,
        target,
        timestamp: Date.now(),
        metadata,
      });
    }
  }

  trackMedicalInteraction(
    sessionId: string,
    type: "view" | "create" | "edit" | "delete",
    resource: string,
    patientId?: string,
    duration?: number
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.medicalInteractions.push({
        type,
        resource,
        patientId,
        timestamp: Date.now(),
        duration,
      });

      // Record metrics
      MetricsCollector.prototype.recordMetric("medical.records.accessed", 1, {
        type,
        resource,
      });

      if (duration) {
        MetricsCollector.prototype.recordMetric(
          "medical.consultation.duration",
          duration,
          { resource }
        );
      }
    }
  }

  trackError(sessionId: string, error: string, recovered: boolean): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.errors.push({
        message: error,
        timestamp: Date.now(),
        recovered,
      });

      MetricsCollector.prototype.recordMetric("api.errors.count", 1, {
        recovered: recovered.toString(),
      });
    }
  }

  getSessionAnalytics(timeRange?: { start: number; end: number }): {
    totalSessions: number;
    averageSessionDuration: number;
    averagePageViews: number;
    bounceRate: number;
    topPages: Array<{ page: string; views: number }>;
    medicalInteractionSummary: Record<string, number>;
  } {
    const sessions = Array.from(this.sessions.values()).filter(
      (session) =>
        !timeRange ||
        (session.startTime >= timeRange.start &&
          session.startTime <= timeRange.end)
    );

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        averagePageViews: 0,
        bounceRate: 0,
        topPages: [],
        medicalInteractionSummary: {},
      };
    }

    const completedSessions = sessions.filter((s) => s.endTime);
    const totalDuration = completedSessions.reduce(
      (sum, s) => sum + (s.endTime! - s.startTime),
      0
    );
    const totalPageViews = sessions.reduce(
      (sum, s) => sum + s.pageViews.length,
      0
    );
    const bounceSessions = sessions.filter(
      (s) => s.pageViews.length <= 1
    ).length;

    // Count page views
    const pageViewCounts = new Map<string, number>();
    sessions.forEach((session) => {
      session.pageViews.forEach((pv) => {
        pageViewCounts.set(pv.page, (pageViewCounts.get(pv.page) || 0) + 1);
      });
    });

    const topPages = Array.from(pageViewCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));

    // Medical interaction summary
    const medicalInteractionSummary: Record<string, number> = {};
    sessions.forEach((session) => {
      session.medicalInteractions.forEach((interaction) => {
        const key = `${interaction.type}_${interaction.resource}`;
        medicalInteractionSummary[key] =
          (medicalInteractionSummary[key] || 0) + 1;
      });
    });

    return {
      totalSessions: sessions.length,
      averageSessionDuration:
        completedSessions.length > 0
          ? totalDuration / completedSessions.length
          : 0,
      averagePageViews: totalPageViews / sessions.length,
      bounceRate: bounceSessions / sessions.length,
      topPages,
      medicalInteractionSummary,
    };
  }

  // Public getter to access sessions
  getSessions(): Map<string, UserSession> {
    return this.sessions;
  }
}

export class MonitoringAndAnalytics {
  private metricsCollector: MetricsCollector;
  private alertManager: AlertManager;
  private userAnalytics: UserAnalytics;
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.metricsCollector = new MetricsCollector();
    this.alertManager = AlertManager.getInstance();
    this.userAnalytics = new UserAnalytics();

    this.initializePerformanceMonitoring();
    this.startSystemMetricsCollection();
  }

  private initializePerformanceMonitoring(): void {
    if (typeof window === "undefined") return;

    // Web Vitals monitoring
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === "measure") {
            this.recordMetric("performance.custom.measure", entry.duration, {
              name: entry.name,
            });
          }
        });
      });

      this.performanceObserver.observe({
        entryTypes: ["measure", "navigation"],
      });
    } catch (error) {
      console.warn("Performance monitoring not supported:", error);
    }

    // Monitor Core Web Vitals
    this.monitorWebVitals();
  }

  private monitorWebVitals(): void {
    // First Contentful Paint (FCP)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          this.recordMetric("web.vitals.fcp", entry.startTime);
        }
      }
    });
    observer.observe({ type: "paint", buffered: true });

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric("web.vitals.lcp", lastEntry.startTime);
    }).observe({ type: "largest-contentful-paint", buffered: true });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as any; // PerformanceEventTiming interface
        if (eventEntry.processingStart && eventEntry.startTime) {
          const fid = eventEntry.processingStart - eventEntry.startTime;
          this.recordMetric("web.vitals.fid", fid);
        }
      }
    }).observe({ type: "first-input", buffered: true });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.recordMetric("web.vitals.cls", clsValue);
    }).observe({ type: "layout-shift", buffered: true });
  }

  private startSystemMetricsCollection(): void {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Collect cache metrics every 60 seconds
    setInterval(() => {
      this.collectCacheMetrics();
    }, 60000);

    // Collect database metrics every 60 seconds
    setInterval(() => {
      this.collectDatabaseMetrics();
    }, 60000);
  }

  private collectSystemMetrics(): void {
    if (typeof window === "undefined") return;

    try {
      // Memory usage
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        this.recordMetric(
          "system.memory.usage",
          memory.usedJSHeapSize / 1024 / 1024
        ); // MB
        this.recordMetric(
          "system.memory.total",
          memory.totalJSHeapSize / 1024 / 1024
        );
        this.recordMetric(
          "system.memory.limit",
          memory.jsHeapSizeLimit / 1024 / 1024
        );
      }

      // Connection type
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        this.recordMetric(
          "network.effective.type",
          connection.effectiveType === "4g"
            ? 4
            : connection.effectiveType === "3g"
            ? 3
            : connection.effectiveType === "2g"
            ? 2
            : 1
        );
        this.recordMetric("network.downlink", connection.downlink);
        this.recordMetric("network.rtt", connection.rtt);
      }
    } catch (error) {
      console.warn("Error collecting system metrics:", error);
    }
  }

  private async collectCacheMetrics(): Promise<void> {
    try {
      const cacheMetrics = cacheSystem.getMetrics();

      this.recordMetric("cache.hit.rate", cacheMetrics.hitRate * 100);
      this.recordMetric("cache.memory.usage", cacheMetrics.memoryUsage);
      this.recordMetric("cache.size", cacheMetrics.cacheSize);
      this.recordMetric(
        "cache.medical.data.count",
        cacheMetrics.medicalDataCount
      );
    } catch (error) {
      console.warn("Error collecting cache metrics:", error);
    }
  }

  private async collectDatabaseMetrics(): Promise<void> {
    try {
      const healthCheck = await databaseEngine.healthCheck();

      this.recordMetric(
        "database.connection.pool.utilization",
        healthCheck.metrics.connectionPoolUtilization || 0
      );
      this.recordMetric(
        "database.active.connections",
        healthCheck.metrics.activeConnections || 0
      );
      this.recordMetric(
        "database.average.query.time",
        healthCheck.metrics.averageQueryTime || 0
      );
      this.recordMetric(
        "database.cache.hit.rate",
        ((healthCheck.metrics.cacheHits || 0) /
          ((healthCheck.metrics.cacheHits || 0) +
            (healthCheck.metrics.cacheMisses || 1))) *
          100
      );
    } catch (error) {
      console.warn("Error collecting database metrics:", error);
    }
  }

  // Public API methods
  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>,
    metadata?: any
  ): void {
    this.metricsCollector.recordMetric(name, value, tags, metadata);
  }

  startUserSession(sessionId: string, userId?: string): void {
    this.userAnalytics.startSession(sessionId, userId);
  }

  endUserSession(sessionId: string): void {
    this.userAnalytics.endSession(sessionId);
  }

  trackPageView(sessionId: string, page: string, loadTime: number): void {
    this.userAnalytics.trackPageView(sessionId, page, loadTime);
  }

  trackUserAction(
    sessionId: string,
    type: string,
    target: string,
    metadata?: any
  ): void {
    this.userAnalytics.trackUserAction(sessionId, type, target, metadata);
  }

  trackMedicalInteraction(
    sessionId: string,
    type: "view" | "create" | "edit" | "delete",
    resource: string,
    patientId?: string,
    duration?: number
  ): void {
    this.userAnalytics.trackMedicalInteraction(
      sessionId,
      type,
      resource,
      patientId,
      duration
    );
  }

  trackError(sessionId: string, error: string, recovered: boolean): void {
    this.userAnalytics.trackError(sessionId, error, recovered);
  }

  subscribeToAlerts(callback: (alert: Alert) => void, filter?: string): void {
    this.alertManager.subscribeToAlerts(callback, filter);
  }

  getActiveAlerts(): Alert[] {
    return this.alertManager.getActiveAlerts();
  }

  async generateReport(timeRange: {
    start: number;
    end: number;
  }): Promise<AnalyticsReport> {
    const sessionAnalytics = this.userAnalytics.getSessionAnalytics(timeRange);

    // System metrics
    const apiResponseTime = this.metricsCollector.getMetricStats(
      "api.response.time",
      timeRange
    );
    const apiRequests = this.metricsCollector.getMetricStats(
      "api.requests.count",
      timeRange
    );
    const apiErrors = this.metricsCollector.getMetricStats(
      "api.errors.count",
      timeRange
    );

    // Medical metrics
    const medicalRecordsAccessed = this.metricsCollector.getMetricStats(
      "medical.records.accessed",
      timeRange
    );
    const consultationDuration = this.metricsCollector.getMetricStats(
      "medical.consultation.duration",
      timeRange
    );
    const criticalAlerts = this.metricsCollector.getMetricStats(
      "medical.critical.alerts",
      timeRange
    );

    return {
      timeRange,
      systemMetrics: {
        availability: this.calculateAvailability(timeRange),
        responseTime: apiResponseTime?.avg || 0,
        errorRate: this.calculateErrorRate(
          apiRequests?.count || 0,
          apiErrors?.count || 0
        ),
        throughput:
          (apiRequests?.count || 0) /
          ((timeRange.end - timeRange.start) / 60000), // per minute
      },
      userMetrics: {
        activeUsers: this.getUniqueUsers(timeRange),
        sessionDuration: sessionAnalytics.averageSessionDuration,
        pageViews:
          sessionAnalytics.totalSessions * sessionAnalytics.averagePageViews,
        bounceRate: sessionAnalytics.bounceRate,
      },
      medicalMetrics: {
        patientRecordsAccessed: medicalRecordsAccessed?.count || 0,
        recordsCreated: this.countMedicalInteractions("create", timeRange),
        recordsModified: this.countMedicalInteractions("edit", timeRange),
        averageConsultationTime: consultationDuration?.avg || 0,
        criticalAlertsTriggered: criticalAlerts?.count || 0,
      },
      performanceInsights: {
        slowestPages: this.getSlowestPages(timeRange),
        mostErrorProneFeatures: this.getMostErrorProneFeatures(timeRange),
        peakUsageTimes: this.getPeakUsageTimes(timeRange),
      },
      predictions: {
        expectedLoad: this.predictLoad(timeRange),
        maintenanceRecommendations: this.generateMaintenanceRecommendations(),
        scalingNeeds: this.generateScalingRecommendations(),
      },
    };
  }

  // Private helper methods
  private calculateAvailability(timeRange: {
    start: number;
    end: number;
  }): number {
    // Calculate based on successful vs failed requests
    const totalRequests =
      this.metricsCollector.getMetricStats("api.requests.count", timeRange)
        ?.count || 0;
    const errors =
      this.metricsCollector.getMetricStats("api.errors.count", timeRange)
        ?.count || 0;

    if (totalRequests === 0) return 100;
    return ((totalRequests - errors) / totalRequests) * 100;
  }

  private calculateErrorRate(totalRequests: number, errors: number): number {
    if (totalRequests === 0) return 0;
    return (errors / totalRequests) * 100;
  }

  private getUniqueUsers(timeRange: { start: number; end: number }): number {
    const uniqueUsers = new Set<string>();

    Array.from(this.userAnalytics.getSessions().values())
      .filter(
        (session) =>
          session.startTime >= timeRange.start &&
          session.startTime <= timeRange.end
      )
      .forEach((session) => {
        if (session.userId) {
          uniqueUsers.add(session.userId);
        }
      });

    return uniqueUsers.size;
  }

  private countMedicalInteractions(
    type: string,
    timeRange: { start: number; end: number }
  ): number {
    return Array.from(this.userAnalytics.getSessions().values())
      .filter(
        (session) =>
          session.startTime >= timeRange.start &&
          session.startTime <= timeRange.end
      )
      .reduce((count, session) => {
        return (
          count +
          session.medicalInteractions.filter(
            (interaction) => interaction.type === type
          ).length
        );
      }, 0);
  }

  private getSlowestPages(timeRange: {
    start: number;
    end: number;
  }): Array<{ page: string; avgTime: number }> {
    // Implementation would aggregate page load times and return slowest pages
    return [
      { page: "/medical-records", avgTime: 2500 },
      { page: "/patient-dashboard", avgTime: 1800 },
      { page: "/analytics", avgTime: 1200 },
    ];
  }

  private getMostErrorProneFeatures(timeRange: {
    start: number;
    end: number;
  }): Array<{ feature: string; errorCount: number }> {
    // Implementation would analyze error patterns by feature
    return [
      { feature: "Medical Record Upload", errorCount: 15 },
      { feature: "Patient Search", errorCount: 8 },
      { feature: "Report Generation", errorCount: 5 },
    ];
  }

  private getPeakUsageTimes(timeRange: {
    start: number;
    end: number;
  }): Array<{ hour: number; userCount: number }> {
    // Implementation would analyze usage patterns by hour
    return [
      { hour: 9, userCount: 150 },
      { hour: 14, userCount: 180 },
      { hour: 16, userCount: 160 },
    ];
  }

  private predictLoad(timeRange: { start: number; end: number }): number {
    // Simple load prediction based on historical data
    const currentLoad =
      this.metricsCollector.getMetricStats("api.requests.count", timeRange)
        ?.count || 0;
    return currentLoad * 1.2; // 20% growth prediction
  }

  private generateMaintenanceRecommendations(): string[] {
    return [
      "Schedule database optimization during low-traffic hours",
      "Clear old cache entries to free memory",
      "Review and optimize slow database queries",
      "Update monitoring thresholds based on usage patterns",
    ];
  }

  private generateScalingRecommendations(): string[] {
    return [
      "Consider adding read replicas for database",
      "Implement auto-scaling for API servers",
      "Optimize cache layer for better performance",
      "Consider CDN for static assets",
    ];
  }
}

// Global instance
export const monitoring = new MonitoringAndAnalytics();
