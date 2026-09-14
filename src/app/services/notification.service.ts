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

export interface AlertaApi {
  id: number;
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
    return this.listarBruto().pipe(
      map(alertas => alertas.map(alerta => this.mapearAlerta(alerta)))
    );
  }

  listarBruto(): Observable<AlertaApi[]> {
    return this.http.get<Omit<AlertaApi, 'id'>[]>(this.urlBase).pipe(
      map(alertas => alertas.map((alerta, indice) => ({ id: indice + 1, ...alerta })))
    );
  }

  private mapearAlerta(alerta: AlertaApi): Notificacao {
    return {
      id: alerta.id,
      titulo: alerta.titulo,
      mensagem: alerta.detalhe,
      data: alerta.data,
      lida: false,
      categoria: alerta.tipo === 'manutencao' ? 'Manutenção' : 'Documento',
      critico: alerta.tag === 'Crítico'
    };
  }
}
