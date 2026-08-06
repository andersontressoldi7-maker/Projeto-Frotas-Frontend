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

  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSolicitarCodigo(): void {
    if (!this.email.trim()) {
      this.toastService.error('Informe seu email.', 'Erro');
      return;
    }

    this.isLoading = true;
    this.authService.solicitarCodigoRecuperacao(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Código enviado para o seu email.', 'Sucesso');
        this.etapa = 'redefinir';
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Não foi possível enviar o código. Tente novamente.', 'Erro');
      }
    });
  }

  onRedefinirSenha(): void {
    if (!this.codigo.trim() || !this.novaSenha) {
      this.toastService.error('Preencha o código e a nova senha.', 'Erro');
      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {
      this.toastService.error('As senhas não coincidem.', 'Erro');
      return;
    }

    this.isLoading = true;
    this.authService.redefinirSenha(this.email, this.codigo, this.novaSenha).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Senha redefinida com sucesso.', 'Sucesso');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Código inválido ou expirado.', 'Erro');
      }
    });
  }

  voltarParaSolicitar(): void {
    this.etapa = 'solicitar';
  }
}
