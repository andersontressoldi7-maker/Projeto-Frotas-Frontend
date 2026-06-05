import { Component } from '@angular/core';
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
export class SidebarComponent {
  isCollapsed = false;

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
    { icon: 'bi-wrench', label: 'Manutenções', route: '/manutencoes' },
    { icon: 'bi-sliders', label: 'Tipos de Manutenção', route: '/tipos-manutencao' },
    { icon: 'bi-bell', label: 'Alertas e Notificações', route: '/alertas' },
    { icon: 'bi-shield-lock', label: 'Permissões', route: '/permissoes' },
    { icon: 'bi-bar-chart', label: 'Relatórios', route: '/relatorios' },
    { icon: 'bi-gear', label: 'Configurações', route: '/configuracoes' }
  ];

  constructor(public themeService: ThemeService) {}

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
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
}