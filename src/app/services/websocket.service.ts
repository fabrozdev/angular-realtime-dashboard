import { Injectable, NgZone } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, catchError, EMPTY, retry, shareReplay, tap } from 'rxjs';

export interface MarketData {
  e: 'trade'; // Event type
  E: number; // Event time (timestamp in milliseconds)
  s: string; // Symbol (e.g., "BTCUSDT", "BNBBTC")
  t: number; // Trade ID
  p: string; // Price (as string to preserve precision)
  q: string; // Quantity (as string to preserve precision)
  b: number; // Buyer order ID
  a: number; // Seller order ID
  T: number; // Trade time (timestamp in milliseconds)
  m: boolean; // Is the buyer the market maker?
  M: boolean; // Ignore (can be used for future enhancements)
}

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket$!: WebSocketSubject<any>;

  constructor(private ngZone: NgZone) {}

  connect(url = 'wss://stream.binance.com:9443/ws/btcusdt@trade'): Observable<MarketData> {
    // create inside ngZone.runOutsideAngular if heavy CPU is expected
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({ url });
    }

    return this.socket$.pipe(
      tap((message) => console.log('Received message:', message)),
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
