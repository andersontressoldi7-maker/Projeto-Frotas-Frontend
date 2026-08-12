import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type CategoriaNotificacao = 'Manutenção' | 'Checklist' | 'Documento' | 'Viagem' | 'Sistema';

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  categoria: CategoriaNotificacao;
  critico: boolean;
}

export const CATEGORIAS_NOTIFICACAO: CategoriaNotificacao[] = ['Manutenção', 'Checklist', 'Documento', 'Viagem', 'Sistema'];

interface AlertaApi {
  tipo: string;
  titulo: string;
  detalhe: string;
  data: string;
  tag: string;
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private urlBase = `${environment.apiBaseUrl}/alertas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Notificacao[]> {
    return this.http.get<AlertaApi[]>(this.urlBase).pipe(
      map(alertas => alertas.map((alerta, indice) => this.mapearAlerta(alerta, indice)))
    );
  }

  private mapearAlerta(alerta: AlertaApi, indice: number): Notificacao {
    return {
      id: indice + 1,
      titulo: alerta.titulo,
      mensagem: alerta.detalhe,
      data: alerta.data,
      lida: false,
      categoria: alerta.tipo === 'manutencao' ? 'Manutenção' : 'Documento',
      critico: alerta.tag === 'Crítico'
    };
  }
}
