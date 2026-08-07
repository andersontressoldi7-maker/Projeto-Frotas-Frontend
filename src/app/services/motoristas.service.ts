import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MotoristasService {
  private apiUrl = `${environment.apiBaseUrl}/motoristas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obter(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  criar(motorista: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, motorista);
  }

  atualizar(id: number, motorista: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, motorista);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarDocumentos(motoristaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${motoristaId}/documentos`);
  }

  salvarDocumento(motoristaId: number, documento: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${motoristaId}/documentos`, documento);
  }

  excluirDocumento(motoristaId: number, documentoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${motoristaId}/documentos/${documentoId}`);
  }
}
