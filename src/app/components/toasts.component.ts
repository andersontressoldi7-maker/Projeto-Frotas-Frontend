import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toasts.component.html',
  styleUrls: ['./toasts.component.scss']
})
export class ToastsComponent {
  constructor(public toastService: ToastService) {}

  descartar(id: string) {
    this.toastService.descartar(id);
  }

  classeNivel(level: string) {
    switch (level) {
      case 'success': return 'alert-success';
      case 'info': return 'alert-info';
      case 'warning': return 'alert-warning';
      case 'danger': return 'alert-danger';
      default: return 'alert-info';
    }
  }
}
