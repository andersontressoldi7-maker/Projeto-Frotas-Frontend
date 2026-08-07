import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegistroConta {
  razaoSocial: string;
  fantasia: string;
  cnpj: string;
  usuario: string;
  senha: string;
}

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  empresaId: number;
}

export interface RespostaAutenticacao {
  token: string;
  usuario: UsuarioLogado;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(usuario: string, senha: string): Observable<RespostaAutenticacao> {
    return this.http.post<RespostaAutenticacao>(`${this.apiUrl}/login`, { usuario, senha }).pipe(
      tap(resposta => this.salvarSessao(resposta))
    );
  }

  registrar(dados: RegistroConta): Observable<RespostaAutenticacao> {
    return this.http.post<RespostaAutenticacao>(`${this.apiUrl}/registrar`, dados).pipe(
      tap(resposta => this.salvarSessao(resposta))
    );
  }

  solicitarCodigoRecuperacao(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/esqueci-senha`, { email });
  }

  redefinirSenha(email: string, codigo: string, novaSenha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/redefinir-senha`, { email, codigo, novaSenha });
  }

  encerrarSessao(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sair`, {});
  }

  minhaConta(): Observable<UsuarioLogado> {
    return this.http.get<UsuarioLogado>(`${this.apiUrl}/minha-conta`);
  }

  obterUsuarioLogado(): UsuarioLogado | null {
    try {
      const salvo = localStorage.getItem('user');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  }

  limparSessao(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  private salvarSessao(resposta: RespostaAutenticacao): void {
    try {
      localStorage.setItem('authToken', resposta.token);
      localStorage.setItem('user', JSON.stringify(resposta.usuario));
    } catch {}
  }
}
