import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CategoriaNotificacao = 'Manutenção' | 'Checklist' | 'Documento' | 'Viagem' | 'Sistema';

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  categoria: CategoriaNotificacao;
}

export const CATEGORIAS_NOTIFICACAO: CategoriaNotificacao[] = ['Manutenção', 'Checklist', 'Documento', 'Viagem', 'Sistema'];

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/notificacoes';

  constructor(private http: HttpClient) {}

  listar(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(this.apiUrl);
  }

  marcarComoLida(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/lida`, {});
  }

  marcarTodasComoLidas(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/lidas`, {});
  }
}
