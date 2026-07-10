import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RascunhoService {
  salvar(chave: string, dados: any): void {
    try {
      sessionStorage.setItem(chave, JSON.stringify(dados));
    } catch {}
  }

  obter<T = any>(chave: string): T | null {
    try {
      const bruto = sessionStorage.getItem(chave);
      return bruto ? (JSON.parse(bruto) as T) : null;
    } catch {
      return null;
    }
  }

  limpar(chave: string): void {
    try {
      sessionStorage.removeItem(chave);
    } catch {}
  }
}
