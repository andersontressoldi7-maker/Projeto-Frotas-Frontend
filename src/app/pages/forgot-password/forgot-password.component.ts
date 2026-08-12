import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  etapa: 'solicitar' | 'redefinir' = 'solicitar';

  email = '';
  codigo = '';
  novaSenha = '';
  confirmarNovaSenha = '';

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

  onSolicitarCodigo(): void {
    if (!this.email.trim()) {
      this.toastService.erro('Informe seu email.', 'Erro');
      return;
    }

    this.carregando = true;
    this.authService.solicitarCodigoRecuperacao(this.email).subscribe({
      next: () => {
        this.carregando = false;
        this.toastService.sucesso('Código enviado para o seu email.', 'Sucesso');
        this.etapa = 'redefinir';
      },
      error: () => {
        this.carregando = false;
        this.toastService.erro('Não foi possível enviar o código. Tente novamente.', 'Erro');
      }
    });
  }

  onRedefinirSenha(): void {
    if (!this.codigo.trim() || !this.novaSenha) {
      this.toastService.erro('Preencha o código e a nova senha.', 'Erro');
      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {
      this.toastService.erro('As senhas não coincidem.', 'Erro');
      return;
    }

    this.carregando = true;
    this.authService.redefinirSenha(this.email, this.codigo, this.novaSenha).subscribe({
      next: () => {
        this.carregando = false;
        this.toastService.sucesso('Senha redefinida com sucesso.', 'Sucesso');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.carregando = false;
        this.toastService.erro('Código inválido ou expirado.', 'Erro');
      }
    });
  }

  voltarParaSolicitar(): void {
    this.etapa = 'solicitar';
  }
}
