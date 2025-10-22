import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import type { MarketData } from '../../../../services/websocket.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ChartComponent implements OnChanges {
  @Input() marketData: MarketData[] | null = [];
  public labels: string[] = [];
  public dataset: number[] = [];

  ngOnChanges(changes: SimpleChanges) {
    const md = this.marketData || [];
    this.labels = md.map((d) => new Date(d.time).toLocaleTimeString());
    this.dataset = md.map((d) => d.price);
    // Note: In a real app you'd use Chart.js or another lib to render efficiently.
  }
}
