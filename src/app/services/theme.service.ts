import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private temaAtual = 'light';
  private ehNavegador: boolean;

  constructor(@Inject(PLATFORM_ID) plataformaId: Object) {
    this.ehNavegador = isPlatformBrowser(plataformaId);

    if (this.ehNavegador) {
      const temaSalvo = localStorage.getItem('theme');
      if (temaSalvo) {
        this.definirTema(temaSalvo);
      } else {
        this.definirTema('light');
      }
    }
  }

  estaEscuro(): boolean {
    return this.temaAtual === 'dark';
  }

  alternarTema(): void {
    const temaAlvo = this.temaAtual === 'light' ? 'dark' : 'light';
    this.definirTema(temaAlvo);
  }

  private definirTema(tema: string): void {
    this.temaAtual = tema;

    if (this.ehNavegador) {
      localStorage.setItem('theme', tema);
      document.documentElement.setAttribute('data-bs-theme', tema);
    }
  }
}