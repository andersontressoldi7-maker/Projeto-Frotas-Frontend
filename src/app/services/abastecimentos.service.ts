import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentosService {
  private apiUrl = '/api/abastecimentos';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obter(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  criar(abastecimento: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, abastecimento);
  }

  atualizar(id: number, abastecimento: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, abastecimento);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
