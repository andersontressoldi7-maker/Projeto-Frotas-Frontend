import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/toast.service';
import { DialogService } from '../../components/dialog/dialog.service';
import { aplicarMascaraCnpj } from '../../shared/mascaras.util';

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
    private toastService: ToastService,
    private dialogService: DialogService
  ) {}

  onCnpjAlterado(valor: string): void {
    this.cnpj = aplicarMascaraCnpj(valor);
  }

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
      next: async (resposta) => {
        this.carregando = false;
        await this.dialogService.aviso(
          `Sua unidade é ${resposta.unidade}. Guarde esse número — ele é obrigatório em todo login.`,
          'Conta criada com sucesso'
        );
        this.router.navigate(['/dashboard']);
      },
      error: (erro) => {
        this.carregando = false;
        this.toastService.erro(erro?.error?.message || 'Não foi possível criar a conta. Tente novamente.', 'Erro');
      }
    });
  }
}
