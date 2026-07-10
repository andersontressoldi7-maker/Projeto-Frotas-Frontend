import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViagensService {
  private apiUrl = '/api/viagens';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obter(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  criar(viagem: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, viagem);
  }

  atualizar(id: number, viagem: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, viagem);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
