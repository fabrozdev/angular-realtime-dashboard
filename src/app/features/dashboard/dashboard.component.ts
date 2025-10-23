import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { MarketData, WebsocketService } from '../../services/websocket.service';
import { BehaviorSubject, distinctUntilChanged, scan, Subscription } from 'rxjs';
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
  private readonly sub = new Subscription();
  public buffer$ = new BehaviorSubject<MarketData[]>([]);
  public paused = false;

  constructor(private readonly ws: WebsocketService) {
    const stream$ = this.ws.connect();

    this.sub.add(
      stream$
        .pipe(
          scan((acc: MarketData[], curr: MarketData) => {
            const lastItem = acc[acc.length - 1];
            if (lastItem && lastItem.time === curr.time) {
              return [...acc.slice(0, -1), curr];
            }
            return [...acc.slice(-199), curr];
          }, [] as MarketData[]),
          //distinctUntilChanged()
        )
        .subscribe((d) => {
          if (!this.paused) {
            this.buffer$.next(d);
          }
        }),
    );
  }

  togglePause() {
    this.paused = !this.paused;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.buffer$.complete();
  }
}
