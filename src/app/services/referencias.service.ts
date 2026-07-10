import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReferenciasService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  listarVeiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/veiculos`);
  }

  listarMotoristas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/motoristas`);
  }

  listarTiposManutencao(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-manutencao`);
  }

  obterVeiculo(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/veiculos/${id}`);
  }

  obterMotorista(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/motoristas/${id}`);
  }
}
