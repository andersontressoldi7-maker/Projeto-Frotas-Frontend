import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toasts.component.html',
  styleUrls: ['./toasts.component.scss']
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
