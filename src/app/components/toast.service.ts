import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type ToastLevel = 'success' | 'info' | 'warning' | 'danger';

export interface ToastMessage {
  id: string;
  level: ToastLevel;
  message: string;
  title?: string;
  timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private subject = new Subject<ToastMessage>();

  onToast(): Observable<ToastMessage> {
    return this.subject.asObservable();
  }

  show(level: ToastLevel, message: string, title?: string, timeout = 5000) {
    const t: ToastMessage = { id: Date.now().toString(), level, message, title, timeout };
    this.subject.next(t);
  }

  success(message: string, title?: string, timeout?: number) { this.show('success', message, title, timeout); }
  info(message: string, title?: string, timeout?: number) { this.show('info', message, title, timeout); }
  warning(message: string, title?: string, timeout?: number) { this.show('warning', message, title, timeout); }
  error(message: string, title?: string, timeout?: number) { this.show('danger', message, title, timeout); }
}
