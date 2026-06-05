import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  userEmail = 'andersontressoldi7@gmail.com';
  userInitials = 'AN';

  cards = [
    { title: 'Checklists hoje', value: 0, icon: 'bi-check2-square', color: 'success' },
    { title: 'Checklists pendentes', value: 0, icon: 'bi-clipboard-check', color: 'warning' },
    { title: 'Veículos cadastrados', value: 1, icon: 'bi-truck', color: 'info' },
    { title: 'Veículos com problemas', value: 0, icon: 'bi-exclamation-triangle', color: 'danger' },
    { title: 'Manutenções pendentes', value: 1, icon: 'bi-wrench', color: 'secondary' },
    { title: 'Manutenções em atraso', value: 1, icon: 'bi-clock-history', color: 'danger-light' },
    { title: 'Viagens em andamento', value: 1, icon: 'bi-geo-alt', color: 'primary' },
    { title: 'Alertas críticos', value: 0, icon: 'bi-bell', color: 'danger' }
  ];

  manutencoesPendentes = [
    { descricao: 'Óleo Baixo', data: '22/05/2026', prioridade: 'Crítica', status: 'Aberta' }
  ];

  statusResumo = [
    { label: 'Veículos disponíveis', value: 1, color: 'text-success' },
    { label: 'Em manutenção', value: 0, color: 'text-muted' },
    { label: 'Viagens ativas', value: 1, color: 'text-primary' },
    { label: 'Alertas críticos', value: 0, color: 'text-danger' }
  ];
}