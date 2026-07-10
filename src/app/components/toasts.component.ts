import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toasts-wrapper" aria-live="polite" aria-atomic="true">
      <div *ngFor="let t of toasts" class="toast-item alert" [ngClass]="levelClass(t.level)">
        <div class="d-flex">
          <div class="toast-body flex-grow-1">
            <strong *ngIf="t.title">{{ t.title }}</strong>
            <div>{{ t.message }}</div>
          </div>
          <button type="button" class="btn-close ms-2" aria-label="Close" (click)="dismiss(t.id)"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toasts-wrapper {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      width: 320px;
    }

    .toast-item {
      margin-bottom: 0.75rem;
      border-radius: 10px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      padding: 0.75rem 0.9rem;
    }

    .toast-body {
      font-size: 0.95rem;
    }

    .alert-success { background: #e9f7ef; color: #144b2b; border: 1px solid rgba(64,145,108,0.12); }
    .alert-info { background: #e9f3fb; color: #0b4a67; border: 1px solid rgba(13,110,253,0.08); }
    .alert-warning { background: #fff7e6; color: #674500; border: 1px solid rgba(255,193,7,0.08); }
    .alert-danger { background: #fdecea; color: #5a1f1f; border: 1px solid rgba(220,53,69,0.08); }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 1.1rem;
      opacity: 0.6;
      cursor: pointer;
    }
  `]
})
export class ToastsComponent implements OnInit {
  toasts: ToastMessage[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.onToast().subscribe(t => {
      this.toasts.push(t);
      if (t.timeout && t.timeout > 0) {
        setTimeout(() => this.dismiss(t.id), t.timeout);
      }
    });
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  levelClass(level: string) {
    switch (level) {
      case 'success': return 'alert-success';
      case 'info': return 'alert-info';
      case 'warning': return 'alert-warning';
      case 'danger': return 'alert-danger';
      default: return 'alert-info';
    }
  }
}
