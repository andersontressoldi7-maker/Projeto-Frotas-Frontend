import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ModelosService {
  private apiUrl = `${environment.apiBaseUrl}/modelos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obter(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  criar(modelo: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, modelo);
  }

  atualizar(id: number, modelo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, modelo);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
