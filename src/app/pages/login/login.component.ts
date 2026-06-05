import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;

  constructor(private router: Router, public themeService: ThemeService) {}

  onMouseMove(e: MouseEvent): void {
    const orbs = document.querySelectorAll<HTMLElement>('.orb');
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    orbs[0]?.style.setProperty('transform', `translate(${dx * 30}px, ${dy * 20}px)`);
    orbs[1]?.style.setProperty('transform', `translate(${-dx * 24}px, ${-dy * 18}px)`);
    orbs[2]?.style.setProperty('transform', `translate(${dx * 16}px, ${-dy * 22}px)`);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/dashboard']);
    }, 2000);
  }
}