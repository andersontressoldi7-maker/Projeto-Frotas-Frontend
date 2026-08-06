import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroConta {
  razaoSocial: string;
  fantasia: string;
  cnpj: string;
  usuario: string;
  senha: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  login(usuario: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { usuario, senha });
  }

  registrar(dados: RegistroConta): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registrar`, dados);
  }

  solicitarCodigoRecuperacao(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/esqueci-senha`, { email });
  }

  redefinirSenha(email: string, codigo: string, novaSenha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/redefinir-senha`, { email, codigo, novaSenha });
  }
}
