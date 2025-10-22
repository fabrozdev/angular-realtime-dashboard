import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { MarketData, WebsocketService } from '../../services/websocket.service';
import { BehaviorSubject, distinctUntilChanged, map, scan, Subscription } from 'rxjs';
import { TableComponent } from './components/table/table.component';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './components/chart/chart.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ChartComponent, TableComponent],
})
export class DashboardComponent implements OnDestroy {
  private sub = new Subscription();
  public buffer$ = new BehaviorSubject<MarketData[]>([]);
  public paused = false;

  constructor(private ws: WebsocketService) {
    const stream$ = this.ws.connect();

    // Keep a rolling window of latest 30 points per symbol (across all messages we keep last 30 total)
    this.sub.add(
      stream$
        .pipe(
          scan((acc: MarketData[], curr: MarketData) => {
            return [...acc.slice(-29), curr];
          }, [] as MarketData[]),
          distinctUntilChanged(),
          map((arr) => arr),
        )
        .subscribe((d) => {
          if (!this.paused) this.buffer$.next(d);
        }),
    );
  }

  togglePause() {
    this.paused = !this.paused;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
