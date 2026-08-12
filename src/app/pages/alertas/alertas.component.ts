import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.scss']
})
export class AlertasComponent {
  titulo = 'Alertas e Notificações';
  subtitulo = 'Eventos críticos, pendências e prazos próximos';

  abaAtiva = 'pendentes';
  filtroExpandido = false;

  opcoesFiltro = [
    { key: 'mensagem', label: 'Mensagem', type: 'text' },
    { key: 'nivel', label: 'Nível', type: 'select', options: ['Crítico', 'Aviso'] }
  ];
  
  filtrosAtivos: any[] = [];
  modeloFiltro: { [key: string]: any } = {};

  alertas = [
    {
      id: 1,
      tipo: 'cnh',
      icone: 'bi-person-badge',
      corIcone: 'text-danger bg-danger-subtle',
      titulo: 'CNH vencida há 16 dia(s)',
      detalhe: 'Motorista fred — validade 20/05/2026',
      data: '20/05/2026',
      tag: 'Crítico',
      categoria: 'pendentes'
    },
    {
      id: 2,
      tipo: 'manutencao',
      icone: 'bi-wrench',
      corIcone: 'text-danger bg-danger-subtle',
      titulo: 'Manutenção pendente — abc-1234 (atrasada 14d)',
      detalhe: 'Óleo Baixo',
      data: '22/05/2026',
      tag: 'Crítico',
      categoria: 'pendentes'
    }
  ];

  obterAlertasFiltrados() {
    return this.alertas.filter(alerta => alerta.categoria === this.abaAtiva);
  }

  alternarFiltros() {
    this.filtroExpandido = !this.filtroExpandido;
  }

  adicionarFiltro(opt: any) {
    if (!this.filtrosAtivos.some(f => f.key === opt.key)) {
      this.filtrosAtivos.push(opt);
      this.modeloFiltro[opt.key] = '';
    }
  }

  removerFiltro(index: number, key: string) {
    this.filtrosAtivos.splice(index, 1);
    delete this.modeloFiltro[key];
  }

  obterFiltrosDisponiveis() {
    return this.opcoesFiltro.filter(opt => !this.filtrosAtivos.some(f => f.key === opt.key));
  }
}