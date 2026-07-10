import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isMobileOpen = false;
  private _mobileToggleHandler = () => this.toggleMobileOpen();

  menuItems = [
    { icon: 'bi-grid', label: 'Dashboard', route: '/dashboard', active: true },
    { icon: 'bi-card-checklist', label: 'Checklists', route: '/checklists' },
    { icon: 'bi-folder', label: 'Modelos de Checklist', route: '/modelos' },
    { icon: 'bi-list-check', label: 'Itens de Checklist', route: '/itens' },
    { icon: 'bi-truck', label: 'Veículos', route: '/veiculos' },
    { icon: 'bi-tags', label: 'Tipos de Veículos', route: '/tipos-veiculos' },
    { icon: 'bi-people', label: 'Motoristas', route: '/motoristas' },
    { icon: 'bi-building', label: 'Empresas', route: '/empresas' },
    { icon: 'bi-geo-alt', label: 'Viagens', route: '/viagens' },
    { icon: 'bi-fuel-pump', label: 'Abastecimentos', route: '/abastecimentos', shortcut: 'F7' },
    { icon: 'bi-wallet2', label: 'Tipos de Despesas', route: '/tipos-despesas' },
    { icon: 'bi-wrench', label: 'Manutenções', route: '/manutencoes' },
    { icon: 'bi-sliders', label: 'Tipos de Manutenção', route: '/tipos-manutencao' },
    { icon: 'bi-bell', label: 'Alertas e Notificações', route: '/alertas' },
    { icon: 'bi-shield-lock', label: 'Permissões', route: '/permissoes' },
    { icon: 'bi-bar-chart', label: 'Relatórios', route: '/relatorios' },
    { icon: 'bi-gear', label: 'Configurações', route: '/configuracoes' }
  ];

  constructor(public themeService: ThemeService, private router: Router) {}

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'F7') {
      event.preventDefault();
      this.router.navigate(['/abastecimentos']);
    }
  }

  ngOnInit(): void {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === 'true') {
        this.isCollapsed = true;
      }
    } catch {}

    const wrapper = document.querySelector('.dashboard-wrapper');
    const header = document.querySelector('.header-dashboard');
    if (this.isCollapsed) {
      wrapper?.classList.add('collapsed');
      header?.classList.add('collapsed');
    } else {
      wrapper?.classList.remove('collapsed');
      header?.classList.remove('collapsed');
    }

    try {
      document.addEventListener('toggle-mobile-sidebar', this._mobileToggleHandler as EventListener);
    } catch {}
  }

  logout(): void {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch {}
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    try {
      localStorage.setItem('sidebarCollapsed', this.isCollapsed ? 'true' : 'false');
    } catch {}
    const wrapper = document.querySelector('.dashboard-wrapper');
    const header = document.querySelector('.header-dashboard');
    
    if (this.isCollapsed) {
      wrapper?.classList.add('collapsed');
      header?.classList.add('collapsed');
    } else {
      wrapper?.classList.remove('collapsed');
      header?.classList.remove('collapsed');
    }
  }

  toggleMobileOpen(): void {
    this.isMobileOpen = !this.isMobileOpen;
    if (this.isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  openMobile(): void {
    this.isMobileOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeMobile(): void {
    this.isMobileOpen = false;
    document.body.style.overflow = '';
  }

  ngOnDestroy(): void {
    try {
      document.removeEventListener('toggle-mobile-sidebar', this._mobileToggleHandler as EventListener);
    } catch {}
  }
}