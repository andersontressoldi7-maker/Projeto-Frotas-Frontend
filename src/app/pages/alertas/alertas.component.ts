import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { NotificationService, AlertaApi } from '../../services/notification.service';
import { ToastService } from '../../components/toast.service';

interface AlertaExibicao extends AlertaApi {
  icone: string;
  corIcone: string;
}

const ICONES_POR_TIPO: Record<string, string> = {
  cnh: 'bi-person-badge',
  curso: 'bi-mortarboard',
  exame: 'bi-clipboard2-pulse',
  manutencao: 'bi-wrench'
};

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.scss']
})
export class AlertasComponent implements OnInit {
  titulo = 'Alertas e Notificações';
  subtitulo = 'Eventos críticos, pendências e prazos próximos';

  abaAtiva = 'pendentes';
  filtroExpandido = false;
  carregando = true;

  opcoesFiltro = [
    { key: 'mensagem', label: 'Mensagem', type: 'text' },
    { key: 'nivel', label: 'Nível', type: 'select', options: ['Crítico', 'Aviso'] }
  ];

  filtrosAtivos: any[] = [];
  modeloFiltro: { [key: string]: any } = {};

  alertas: AlertaExibicao[] = [];

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.notificationService.listarBruto().subscribe({
      next: (alertas) => {
        this.alertas = alertas.map(alerta => ({
          ...alerta,
          icone: ICONES_POR_TIPO[alerta.tipo] || 'bi-bell',
          corIcone: alerta.tag === 'Crítico' ? 'text-danger bg-danger-subtle' : 'text-warning bg-warning-subtle'
        }));
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.toastService.erro('Não foi possível carregar os alertas.', 'Erro');
      }
    });
  }

  get quantidadePendentes(): number {
    return this.alertas.length;
  }

  get quantidadeCriticos(): number {
    return this.alertas.filter(alerta => alerta.tag === 'Crítico').length;
  }

  get quantidadeDatasProximas(): number {
    return this.alertas.filter(alerta => alerta.tag !== 'Crítico').length;
  }

  obterAlertasFiltrados() {
    if (this.abaAtiva === 'criticos') {
      return this.alertas.filter(alerta => alerta.tag === 'Crítico');
    }
    if (this.abaAtiva === 'datas') {
      return this.alertas.filter(alerta => alerta.tag !== 'Crítico');
    }
    return this.alertas;
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