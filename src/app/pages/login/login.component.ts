import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  senha = '';
  unidade: number | null = null;
  lembrarDeMim = false;
  mostrarSenha = false;
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

  entrar(): void {
    const emailNormalizado = this.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      this.toastService.avisar('Informe um endereço de email válido.', 'Dados inválidos');
      return;
    }
    if (!this.senha) {
      this.toastService.avisar('Informe sua senha.', 'Dados inválidos');
      return;
    }
    if (!Number.isInteger(this.unidade) || !this.unidade || this.unidade < 1) {
      this.toastService.avisar('Informe um número de unidade inteiro maior que zero.', 'Dados inválidos');
      return;
    }
    if (this.carregando) {
      return;
    }

    this.carregando = true;
    this.authService.login(emailNormalizado, this.senha, this.unidade).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.carregando = false;
        this.toastService.erro('Usuário ou senha inválidos.', 'Erro');
      }
    });
  }
}