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
    this.carregando = true;
    this.authService.login(this.email, this.senha).subscribe({
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