import { Injectable, signal } from '@angular/core';

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
  mensagens = signal<ToastMessage[]>([]);
  private contador = 0;

  mostrar(level: ToastLevel, message: string, title?: string, timeout = 5000) {
    const toast: ToastMessage = {
      id: `${++this.contador}`,
      level,
      message,
      title,
      timeout
    };

    this.mensagens.update(mensagens => [...mensagens, toast]);

    if (timeout > 0) {
      setTimeout(() => this.descartar(toast.id), timeout);
    }
  }

  descartar(id: string) {
    this.mensagens.update(mensagens =>
      mensagens.filter(mensagem => mensagem.id !== id)
    );
  }

  sucesso(message: string, title?: string, timeout?: number) {
    this.mostrar('success', message, title, timeout);
  }

  informar(message: string, title?: string, timeout?: number) {
    this.mostrar('info', message, title, timeout);
  }

  avisar(message: string, title?: string, timeout?: number) {
    this.mostrar('warning', message, title, timeout);
  }

  erro(message: string, title?: string, timeout?: number) {
    this.mostrar('danger', message, title, timeout);
  }
}