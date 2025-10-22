import { Injectable, NgZone } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, catchError, EMPTY, retry, shareReplay } from 'rxjs';

export interface MarketData {
  symbol: string;
  price: number;
  time: number;
}

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket$!: WebSocketSubject<any>;

  constructor(private ngZone: NgZone) {}

  connect(url = 'ws://localhost:8085'): Observable<MarketData> {
    // create inside ngZone.runOutsideAngular if heavy CPU is expected
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({ url });
    }

    return this.socket$.pipe(
      retry({ count: Infinity, delay: 2000 }),
      catchError((err) => {
        console.error('WS error', err);
        return EMPTY;
      }),
      // share the stream among subscribers
      shareReplay(1),
    );
  }
}
