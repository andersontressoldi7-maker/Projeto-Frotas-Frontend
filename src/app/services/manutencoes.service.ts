import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { criarParametrosPaginacao, FiltrosPaginados, RespostaPaginadaComFiltros } from './paginacao.utils';

@Injectable({
  providedIn: 'root'
})
export class ManutencoesService {
  private urlBase = `${environment.apiBaseUrl}/manutencoes`;

  constructor(private http: HttpClient) {}

  listar(pagina = 1, porPagina = 50, filtros: FiltrosPaginados = {}): Observable<RespostaPaginadaComFiltros<any>> {
    const params = criarParametrosPaginacao(pagina, porPagina, filtros);
    return this.http.get<RespostaPaginadaComFiltros<any>>(this.urlBase, { params });
  }

  obter(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/${id}`);
  }

  criar(manutencao: any): Observable<any> {
    return this.http.post<any>(this.urlBase, manutencao);
  }

  atualizar(id: number, manutencao: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}/${id}`, manutencao);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
