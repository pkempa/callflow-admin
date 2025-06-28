export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

export interface LogContext {
  correlationId?: string;
  userId?: string;
  organizationId?: string;
  userRole?: string;
  sessionId?: string;
  page?: string;
  component?: string;
  userAgent?: string;
  url?: string;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  context: LogContext;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class AdminLogger {
  private context: LogContext = {};
  private logLevel: LogLevel;
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || "development";
    this.logLevel = this.getLogLevelFromEnv();
    this.initializeContext();
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel =
      process.env.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase() as LogLevel;
    if (["debug", "info", "warn", "error", "critical"].includes(envLevel)) {
      return envLevel;
    }
    return this.environment === "development" ? "debug" : "info";
  }

  private initializeContext(): void {
    if (typeof window !== "undefined") {
      this.context = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };
    }
  }

  public setCorrelationId(correlationId: string): void {
    this.context.correlationId = correlationId;
  }

  public setUserContext(
    userId: string,
    organizationId?: string,
    role?: string
  ): void {
    this.context.userId = userId;
    this.context.organizationId = organizationId;
    this.context.userRole = role;
  }

  public setPageContext(page: string): void {
    this.context.page = page;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error", "critical"];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: "callflow-admin",
      environment: this.environment,
      context: { ...this.context },
      metadata,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private outputToConsole(entry: LogEntry): void {
    const { level, message, metadata, error } = entry;
    const logData = { ...entry.context, ...(metadata || {}) };

    switch (level) {
      case "debug":
        console.debug(`🔍 ${message}`, logData, error);
        break;
      case "info":
        console.info(`ℹ️ ${message}`, logData);
        break;
      case "warn":
        console.warn(`⚠️ ${message}`, logData);
        break;
      case "error":
      case "critical":
        console.error(`❌ ${message}`, logData, error);
        break;
    }
  }

  public log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, metadata, error);
    this.outputToConsole(entry);
  }

  public debug(message: string, metadata?: Record<string, any>): void {
    this.log("debug", message, metadata);
  }

  public info(message: string, metadata?: Record<string, any>): void {
    this.log("info", message, metadata);
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    this.log("warn", message, metadata);
  }

  public error(
    message: string,
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    this.log("error", message, metadata, error);
  }

  public critical(
    message: string,
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    this.log("critical", message, metadata, error);
  }

  public userAction(action: string, metadata?: Record<string, any>): void {
    this.info(`USER ACTION: ${action}`, {
      user_action: true,
      action,
      ...metadata,
    });
  }

  public securityEvent(
    event: string,
    metadata?: Record<string, any>,
    severity: "low" | "medium" | "high" = "medium"
  ): void {
    this.warn(`SECURITY EVENT: ${event}`, {
      security_event: true,
      event,
      severity,
      ...metadata,
    });
  }

  public apiCall(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    error?: Error
  ): void {
    const level = statusCode >= 400 ? "error" : "info";
    this.log(
      level,
      `API CALL: ${method} ${endpoint}`,
      {
        api_call: true,
        endpoint,
        method,
        status_code: statusCode,
        duration_ms: duration,
      },
      error
    );
  }

  public performanceMetric(metric: string, value: number, unit: string): void {
    this.info(`PERFORMANCE: ${metric}`, {
      performance_metric: true,
      metric,
      value,
      unit,
    });
  }
}

// Create singleton instance
export const logger = new AdminLogger();

// Component logger factory
export function createComponentLogger(componentName: string) {
  return {
    debug: (message: string, metadata?: Record<string, any>) =>
      logger.debug(`[${componentName}] ${message}`, metadata),
    info: (message: string, metadata?: Record<string, any>) =>
      logger.info(`[${componentName}] ${message}`, metadata),
    warn: (message: string, metadata?: Record<string, any>) =>
      logger.warn(`[${componentName}] ${message}`, metadata),
    error: (message: string, error?: Error, metadata?: Record<string, any>) =>
      logger.error(`[${componentName}] ${message}`, error, metadata),
    userAction: (action: string, metadata?: Record<string, any>) =>
      logger.userAction(action, { component: componentName, ...metadata }),
    securityEvent: (
      event: string,
      metadata?: Record<string, any>,
      severity?: "low" | "medium" | "high"
    ) =>
      logger.securityEvent(
        event,
        { component: componentName, ...metadata },
        severity
      ),
  };
}
