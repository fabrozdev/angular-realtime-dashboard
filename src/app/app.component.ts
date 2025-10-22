import { DashboardComponent } from './features/dashboard/dashboard.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent],
  template: '<app-dashboard></app-dashboard>',
})
export class AppComponent {}
