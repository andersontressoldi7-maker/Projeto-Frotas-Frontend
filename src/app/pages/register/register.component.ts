import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  razaoSocial = '';
  fantasia = '';
  cnpj = '';
  usuario = '';
  senha = '';
  confirmarSenha = '';

  mostrarSenha = false;
  mostrarConfirmarSenha = false;
  carregando = false;

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  alternarConfirmarSenha(): void {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  onRegistrar(): void {
    if (!this.razaoSocial.trim() || !this.fantasia.trim() || !this.cnpj.trim() || !this.usuario.trim() || !this.senha) {
      this.toastService.erro('Preencha todos os campos.', 'Erro');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.toastService.erro('As senhas não coincidem.', 'Erro');
      return;
    }

    this.carregando = true;
    this.authService.registrar({
      razaoSocial: this.razaoSocial,
      fantasia: this.fantasia,
      cnpj: this.cnpj,
      usuario: this.usuario,
      senha: this.senha
    }).subscribe({
      next: () => {
        this.carregando = false;
        this.toastService.sucesso('Conta criada com sucesso.', 'Sucesso');
        this.router.navigate(['/dashboard']);
      },
      error: (erro) => {
        this.carregando = false;
        this.toastService.erro(erro?.error?.message || 'Não foi possível criar a conta. Tente novamente.', 'Erro');
      }
    });
  }
}
