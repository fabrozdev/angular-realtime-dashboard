import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import type { MarketData } from '../../../../services/websocket.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  imports: [CommonModule],
})
export class TableComponent implements AfterViewChecked, OnChanges {
  @Input() marketData: MarketData[] | null = [];
  @ViewChild('scrollContainer') private readonly scrollContainer?: ElementRef;

  private previousLength = 0;
  private shouldScroll = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['marketData'] && this.marketData) {
      const currentLength = this.marketData.length;
      // Only scroll if new items were added
      if (currentLength > this.previousLength) {
        this.shouldScroll = true;
      }
      this.previousLength = currentLength;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      const element = this.scrollContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
