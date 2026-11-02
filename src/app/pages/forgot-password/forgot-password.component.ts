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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.toastService.erro('Informe um email válido.', 'Dados inválidos');
      return;
    }
    if (this.carregando) {
      return;
    }

    this.carregando = true;
    this.authService.solicitarCodigoRecuperacao(this.email.trim()).subscribe({
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
    if (!/^\d{6}$/.test(this.codigo.trim())) {
      this.toastService.erro('Informe o código de verificação com 6 dígitos.', 'Dados inválidos');
      return;
    }
    if (!this.novaSenha) {
      this.toastService.erro('Informe a nova senha.', 'Dados inválidos');
      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {
      this.toastService.erro('As senhas não coincidem.', 'Erro');
      return;
    }
    if (this.carregando) {
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
