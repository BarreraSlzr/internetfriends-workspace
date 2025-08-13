/**
 * Trading-Style Development Dashboard
 * Real-time visualization of development metrics like financial markets
 */

"use client";

import { useEffect, useState, useRef } from "react";
import {
  horseRacePipeline,
  type RaceEvent,
} from "@/lib/events/horse-race-pipeline";
import { patternMonitor } from "@/lib/events/pattern-monitor";
import styles from "./trading-dashboard.module.scss";

interface TradingMetrics {
  timestamp: Date;
  quality: number;
  components: number;
  momentum: number;
  speed: number;
  volume: number;
}

interface MarketTicker {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
}

export default function TradingDashboard() {
  const [metrics, setMetrics] = useState<TradingMetrics[]>([]);
  const [currentTickers, setCurrentTickers] = useState<MarketTicker[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [raceEvents, setRaceEvents] = useState<RaceEvent[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);

  // Market-style data streaming
  useEffect(() => {
    if (!isLive) return;

    const streamId = "trading-dashboard";

    // Subscribe to race pipeline
    horseRacePipeline.subscribe(streamId, (event: RaceEvent) => {
      setRaceEvents((prev) => [...prev.slice(-50), event]);

      // Convert race data to trading metrics
      const tradingMetric: TradingMetrics = {
        timestamp: event.timestamp,
        quality: calculateQualityIndex(),
        components: event.patterns,
        momentum: event.momentum,
        speed: event.speed,
        volume: event.patterns * event.speed,
      };

      setMetrics((prev) => [...prev.slice(-100), tradingMetric]);
    });

    // Update tickers every 2 seconds
    const tickerInterval = setInterval(() => {
      updateMarketTickers();
    }, 2000);

    return () => {
      horseRacePipeline.unsubscribe(streamId);
      clearInterval(tickerInterval);
    };
  }, [isLive]);

  // Draw trading chart
  useEffect(() => {
    if (!chartRef.current || metrics.length < 2) return;
    drawTradingChart();
  }, [metrics]);

  const calculateQualityIndex = (): number => {
    const currentMetrics = patternMonitor.getCurrentMetrics();
    return currentMetrics.averageScore;
  };

  const updateMarketTickers = (): void => {
    const stats = horseRacePipeline.getCurrentStats();
    const patterns = patternMonitor.getActivePatterns();

    const tickers: MarketTicker[] = [
      {
        symbol: "QUAL",
        price: Math.round(calculateQualityIndex() * 100) / 100,
        change: Math.random() * 4 - 2,
        changePercent: Math.random() * 8 - 4,
        trend:
          stats.momentum > 0.6
            ? "up"
            : stats.momentum < 0.4
              ? "down"
              : "stable",
      },
      {
        symbol: "COMP",
        price: stats.activePatterns,
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 12 - 6,
        trend:
          patterns.filter((p) => p.status === "improving").length >
          patterns.length / 2
            ? "up"
            : "down",
      },
      {
        symbol: "MOMT",
        price: Math.round(stats.momentum * 1000) / 10,
        change: Math.random() * 6 - 3,
        changePercent: Math.random() * 15 - 7.5,
        trend: stats.speed > 0.5 ? "up" : "down",
      },
      {
        symbol: "PERF",
        price: Math.round(stats.speed * 100),
        change: Math.random() * 5 - 2.5,
        changePercent: Math.random() * 10 - 5,
        trend:
          stats.position === "leading"
            ? "up"
            : stats.position === "trailing"
              ? "down"
              : "stable",
      },
    ];

    setCurrentTickers(tickers);
  };

  const drawTradingChart = (): void => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, width, height);

    if (metrics.length < 2) return;

    // Chart styling
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;

    // Draw quality line
    ctx.beginPath();
    metrics.forEach((metric, index) => {
      const x = (index / (metrics.length - 1)) * (width - 40) + 20;
      const y = height - ((metric.quality / 100) * (height - 40) + 20);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw momentum overlay
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    metrics.forEach((metric, index) => {
      const x = (index / (metrics.length - 1)) * (width - 40) + 20;
      const y = height - (metric.momentum * (height - 40) + 20);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw volume bars
    ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
    metrics.forEach((metric, index) => {
      const x = (index / (metrics.length - 1)) * (width - 40) + 18;
      const barHeight = (metric.volume / 100) * (height - 40);
      ctx.fillRect(x, height - barHeight - 20, 4, barHeight);
    });

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * (height - 40) + 20;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }
  };

  const formatChange = (change: number, isPercent: boolean = false): string => {
    const sign = change >= 0 ? "+" : "";
    const suffix = isPercent ? "%" : "";
    return `${sign}${change.toFixed(2)}${suffix}`;
  };

  const getChangeClass = (change: number): string => {
    if (change > 0) return styles.positive;
    if (change < 0) return styles.negative;
    return styles.neutral;
  };

  return (
    <div className={styles.dashboard}>
      {/* Market Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>🏁 Development Market</h1>
          <div className={styles.status}>
            <span
              className={`${styles.indicator} ${isLive ? styles.live : styles.paused}`}
            />
            {isLive ? "LIVE" : "PAUSED"}
          </div>
        </div>
        <button
          className={styles.toggleButton}
          onClick={() => setIsLive(!isLive)}
        >
          {isLive ? "⏸️ Pause" : "▶️ Resume"}
        </button>
      </div>

      {/* Market Tickers */}
      <div className={styles.tickers}>
        {currentTickers.map((ticker) => (
          <div key={ticker.symbol} className={styles.ticker}>
            <div className={styles.symbol}>{ticker.symbol}</div>
            <div className={styles.price}>{ticker.price.toFixed(2)}</div>
            <div className={getChangeClass(ticker.change)}>
              {formatChange(ticker.change)}
            </div>
            <div className={getChangeClass(ticker.changePercent)}>
              {formatChange(ticker.changePercent, true)}
            </div>
            <div className={styles.trend}>
              {ticker.trend === "up"
                ? "↗️"
                : ticker.trend === "down"
                  ? "↘️"
                  : "→"}
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className={styles.chartContainer}>
        <canvas
          ref={chartRef}
          width={800}
          height={300}
          className={styles.chart}
        />
        <div className={styles.chartLabels}>
          <span>Quality Index (QUAL)</span>
          <span>Momentum Overlay (MOMT)</span>
          <span>Volume Bars</span>
        </div>
      </div>

      {/* Race Events Feed */}
      <div className={styles.eventsFeed}>
        <h3>📈 Live Events</h3>
        <div className={styles.events}>
          {raceEvents
            .slice(-10)
            .reverse()
            .map((event, index) => (
              <div
                key={`${event.timestamp.getTime()}-${index}`}
                className={styles.event}
              >
                <span className={styles.timestamp}>
                  {event.timestamp.toLocaleTimeString()}
                </span>
                <span className={styles.eventType}>
                  {event.type === "pattern_boost"
                    ? "🚀"
                    : event.type === "obstacle_hit"
                      ? "🔥"
                      : event.type === "position_change"
                        ? "📊"
                        : "⚡"}
                </span>
                <span className={styles.message}>{event.message}</span>
                <span className={styles.position}>
                  {event.position.toUpperCase()}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Market Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span>Market Cap:</span>
          <span>
            {metrics.length > 0 ? metrics[metrics.length - 1].components : 0}{" "}
            Components
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span>24h Volume:</span>
          <span>
            {metrics.reduce((sum, m) => sum + m.volume, 0).toFixed(0)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span>Momentum:</span>
          <span>
            {metrics.length > 0
              ? (metrics[metrics.length - 1].momentum * 100).toFixed(1)
              : 0}
            %
          </span>
        </div>
      </div>
    </div>
  );
}
