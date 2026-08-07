import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VeiculosService {
  private apiUrl = `${environment.apiBaseUrl}/veiculos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obter(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  criar(veiculo: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, veiculo);
  }

  atualizar(id: number, veiculo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, veiculo);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
