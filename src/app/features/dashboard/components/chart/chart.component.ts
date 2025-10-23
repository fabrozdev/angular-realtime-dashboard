import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import type { MarketData } from '../../../../services/websocket.service';
import { CommonModule } from '@angular/common';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  Time,
  AreaSeries,
} from 'lightweight-charts';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush, // Performance improvement
})
export class ChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() marketData: MarketData[] | null = [];
  @Input() height: number = 400; // Configurable height
  @Input() showVolume: boolean = false; // Future feature flag

  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  private chart: IChartApi | null = null;
  private areaSeries: ISeriesApi<'Area'> | null = null;
  private resizeHandler: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null; // Better than window resize
  private lastTimestamp: number = 0;
  private isInitialized = false;

  ngAfterViewInit() {
    this.initChart();
    this.isInitialized = true;

    // Initial data load
    if (this.marketData && this.marketData.length > 0) {
      this.setInitialData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['marketData'] && this.isInitialized) {
      if (changes['marketData'].firstChange) {
        this.setInitialData();
      } else {
        this.updateChartIncremental();
      }
    }

    // Handle height changes
    if (changes['height'] && !changes['height'].firstChange && this.chart) {
      this.chart.applyOptions({ height: this.height });
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initChart() {
    if (!this.chartContainer?.nativeElement) {
      console.warn('Chart container not available');
      return;
    }

    // Prevent re-initialization
    if (this.chart) {
      return;
    }

    const container = this.chartContainer.nativeElement;
    const width = container.clientWidth || 600;

    this.chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#191919', // Slightly softer than pure black
      },
      grid: {
        vertLines: { color: '#e1e1e1' },
        horzLines: { color: '#e1e1e1' },
      },
      width,
      height: this.height,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#e1e1e1',
      },
      rightPriceScale: {
        borderColor: '#e1e1e1',
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#9598a1',
          style: 3, // Dashed line
        },
        horzLine: {
          width: 1,
          color: '#9598a1',
          style: 3,
        },
      },
    });

    this.areaSeries = this.chart.addSeries(AreaSeries, {
      lineColor: '#000000', // More vibrant blue
      topColor: 'rgba(89,92,103,0.28)',
      bottomColor: 'rgba(41, 98, 255, 0.01)',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#000000',
      crosshairMarkerBackgroundColor: '#ffffff',
      priceLineVisible: false, // Cleaner look
    });

    this.setupResizeObserver();
  }

  private setupResizeObserver() {
    if (!this.chartContainer?.nativeElement || !this.chart) {
      return;
    }

    // Use ResizeObserver for better performance than window resize
    this.resizeObserver = new ResizeObserver((entries) => {
      if (!this.chart) return;

      const { width } = entries[0].contentRect;
      this.chart.applyOptions({ width: Math.floor(width) });
    });

    this.resizeObserver.observe(this.chartContainer.nativeElement);

    // Fallback for older browsers
    if (typeof ResizeObserver === 'undefined') {
      this.resizeHandler = () => {
        if (this.chart && this.chartContainer?.nativeElement) {
          this.chart.applyOptions({
            width: this.chartContainer.nativeElement.clientWidth,
          });
        }
      };
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  private setInitialData() {
    if (!this.areaSeries || !this.marketData || this.marketData.length === 0) {
      return;
    }

    try {
      // Convert and deduplicate data
      const dataMap = new Map<number, number>();

      this.marketData.forEach((d) => {
        const timestamp = Math.floor(d.time / 1000);
        // Keep the most recent price for duplicate timestamps
        dataMap.set(timestamp, d.price);
      });

      const chartData = Array.from(dataMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([time, value]) => ({
          time: time as Time,
          value: value,
        }));

      if (chartData.length > 0) {
        this.areaSeries.setData(chartData);
        this.lastTimestamp = chartData[chartData.length - 1].time as number;

        // Better visual fitting with some padding
        this.chart?.timeScale().fitContent();
        this.chart?.timeScale().scrollToPosition(0, false);
      }
    } catch (error) {
      console.error('Error setting initial chart data:', error);
    }
  }

  private updateChartIncremental() {
    if (!this.areaSeries || !this.marketData || this.marketData.length === 0) {
      return;
    }

    try {
      // Get only new data points
      const newPoints = this.marketData.filter((d) => {
        const timestamp = Math.floor(d.time / 1000);
        return timestamp >= this.lastTimestamp;
      });

      if (newPoints.length === 0) {
        return;
      }

      // Update with the latest point only (more efficient)
      const lastPoint = newPoints[newPoints.length - 1];
      const timestamp = Math.floor(lastPoint.time / 1000);

      this.areaSeries.update({
        time: timestamp as Time,
        value: lastPoint.price,
      });

      this.lastTimestamp = timestamp;
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }

  private cleanup() {
    // Clean up ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clean up window resize handler (fallback)
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    // Remove chart
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }

    this.areaSeries = null;
  }

  // Public method to manually trigger chart resize
  public resize() {
    if (this.chart && this.chartContainer?.nativeElement) {
      this.chart.applyOptions({
        width: this.chartContainer.nativeElement.clientWidth,
      });
    }
  }

  // Public method to reset zoom
  public resetZoom() {
    this.chart?.timeScale().fitContent();
  }
}
