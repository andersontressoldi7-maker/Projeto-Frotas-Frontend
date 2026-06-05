import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.scss']
})
export class AlertasComponent {
  title = 'Alertas e Notificações';
  subtitle = 'Eventos críticos, pendências e prazos próximos';

  activeTab = 'pendentes';
  isFilterExpanded = false;

  filterOptions = [
    { key: 'mensagem', label: 'Mensagem', type: 'text' },
    { key: 'nivel', label: 'Nível', type: 'select', options: ['Crítico', 'Aviso'] }
  ];
  
  activeFilters: any[] = [];
  filterModel: { [key: string]: any } = {};

  alertas = [
    {
      id: 1,
      tipo: 'cnh',
      icon: 'bi-person-badge',
      iconColor: 'text-danger bg-danger-subtle',
      titulo: 'CNH vencida há 16 dia(s)',
      detalhe: 'Motorista fred — validade 20/05/2026',
      data: '20/05/2026',
      tag: 'Crítico',
      categoria: 'pendentes'
    },
    {
      id: 2,
      tipo: 'manutencao',
      icon: 'bi-wrench',
      iconColor: 'text-danger bg-danger-subtle',
      titulo: 'Manutenção pendente — abc-1234 (atrasada 14d)',
      detalhe: 'Óleo Baixo',
      data: '22/05/2026',
      tag: 'Crítico',
      categoria: 'pendentes'
    }
  ];

  getFilteredAlertas() {
    return this.alertas.filter(alerta => alerta.categoria === this.activeTab);
  }

  toggleFilters() {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  addFilter(opt: any) {
    if (!this.activeFilters.some(f => f.key === opt.key)) {
      this.activeFilters.push(opt);
      this.filterModel[opt.key] = '';
    }
  }

  removeFilter(index: number, key: string) {
    this.activeFilters.splice(index, 1);
    delete this.filterModel[key];
  }

  getAvailableFilters() {
    return this.filterOptions.filter(opt => !this.activeFilters.some(f => f.key === opt.key));
  }
}