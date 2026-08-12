import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VeiculosService {
  private urlBase = `${environment.apiBaseUrl}/veiculos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.urlBase);
  }

  obter(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/${id}`);
  }

  criar(veiculo: any): Observable<any> {
    return this.http.post<any>(this.urlBase, veiculo);
  }

  atualizar(id: number, veiculo: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}/${id}`, veiculo);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
