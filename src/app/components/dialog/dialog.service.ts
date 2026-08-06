import { Injectable, signal } from '@angular/core';

export type DialogTipo = 'aviso' | 'erro' | 'confirmar';

export interface EstadoDialog {
  tipo: DialogTipo;
  titulo: string;
  mensagem: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  estado = signal<EstadoDialog | null>(null);
  private resolver: ((valor: boolean) => void) | null = null;

  aviso(mensagem: string, titulo = 'Aviso'): Promise<void> {
    return this.abrir('aviso', titulo, mensagem).then(() => undefined);
  }

  erro(mensagem: string, titulo = 'Erro'): Promise<void> {
    return this.abrir('erro', titulo, mensagem).then(() => undefined);
  }

  confirmar(mensagem: string, titulo = 'Confirmação'): Promise<boolean> {
    return this.abrir('confirmar', titulo, mensagem);
  }

  responder(valor: boolean): void {
    this.estado.set(null);
    const resolver = this.resolver;
    this.resolver = null;
    resolver?.(valor);
  }

  private abrir(tipo: DialogTipo, titulo: string, mensagem: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.resolver = resolve;
      this.estado.set({ tipo, titulo, mensagem });
    });
  }
}
