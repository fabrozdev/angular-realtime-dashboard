import { Component, Input } from '@angular/core';
import type { MarketData } from '../../../../services/websocket.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  imports: [CommonModule],
})
export class TableComponent {
  @Input() marketData: MarketData[] | null = [];

  trackByTime(index: number, item: MarketData) {
    return item.time;
  }
}
