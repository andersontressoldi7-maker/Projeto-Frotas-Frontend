import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManutencoesService {
  private apiUrl = '/api/manutencoes';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obter(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  criar(manutencao: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, manutencao);
  }

  atualizar(id: number, manutencao: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, manutencao);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
