import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { DashboardService } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';
import { ChecklistService } from '../../services/checklist.service';
import { ManutencoesService } from '../../services/manutencoes.service';
import { ViagensService } from '../../services/viagens.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private checklistService: ChecklistService,
    private manutencoesService: ManutencoesService,
    private viagensService: ViagensService
  ) {}

  cartoes = [
    { titulo: 'Checklists hoje', valor: 0, icone: 'bi-check2-square', cor: 'success', rota: '' },
    {
      titulo: 'Checklists pendentes',
      valor: 0,
      icone: 'bi-clipboard-check',
      cor: 'warning',
      rota: '/checklists',
      parametros: { status: 'Em Andamento' }
    },
    {
      titulo: 'Veículos cadastrados',
      valor: 0,
      icone: 'bi-truck',
      cor: 'info',
      rota: '/veiculos'
    },
    {
      titulo: 'Veículos em manutenção',
      valor: 0,
      icone: 'bi-exclamation-triangle',
      cor: 'danger',
      rota: '/veiculos',
      parametros: { status: 'Em manutenção' }
    },
    {
      titulo: 'Manutenções pendentes',
      valor: 0,
      icone: 'bi-wrench',
      cor: 'secondary',
      rota: '/manutencoes',
      parametros: { status: 'Aberta' }
    },
    {
      titulo: 'Manutenções em atraso',
      valor: 0,
      icone: 'bi-clock-history',
      cor: 'danger-light',
      rota: '/manutencoes'
    },
    {
      titulo: 'Viagens em andamento',
      valor: 0,
      icone: 'bi-geo-alt',
      cor: 'primary',
      rota: '/viagens',
      parametros: { status: 'Em Rota' }
    },
    { titulo: 'Alertas críticos', valor: 0, icone: 'bi-bell', cor: 'danger', rota: '/alertas' }
  ];

  aoClicarNoCartao(cartao: any): void {
    if (cartao.rota) {
      this.router.navigate([cartao.rota], {
        queryParams: cartao.parametros || {}
      });
    }
  }

  manutencoesPendentes: any[] = [];
  checklistsFinalizados: any[] = [];
  viagensFinalizadas: any[] = [];

  filtroData = '30d';

  resumoFinanceiro = {
    totalReceita: 0,
    totalDespesa: 0,
    lucro: 0,
    viagens: 0,
    ticketMedio: 0,
    margem: 0
  };

  opcoesFiltroData = [
    { valor: '7d', label: 'Últimos 7 dias' },
    { valor: '30d', label: 'Últimos 30 dias' },
    { valor: '90d', label: 'Últimos 90 dias' }
  ];

  get resumoFinanceiroFormatado() {
    return {
      totalReceita: this.formatarMoeda(this.resumoFinanceiro.totalReceita),
      totalDespesa: this.formatarMoeda(this.resumoFinanceiro.totalDespesa),
      lucro: this.formatarMoeda(this.resumoFinanceiro.lucro),
      ticketMedio: this.formatarMoeda(this.resumoFinanceiro.ticketMedio),
      margem: `${this.resumoFinanceiro.margem.toFixed(1)}%`
    };
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(valor);
  }

  ngOnInit(): void {
    this.carregarResumo();
    this.carregarAlertasCriticos();
    this.carregarChecklistsRecentes();
    this.carregarManutencoesPendentes();
    this.aplicarFiltroData();
  }

  private carregarResumo(): void {
    this.dashboardService.resumo().subscribe(resumo => {
      this.cartoes[0].valor = resumo.checklistsHoje;
      this.cartoes[1].valor = resumo.checklistsPendentes;
      this.cartoes[2].valor = resumo.veiculosCadastrados;
      this.cartoes[3].valor = resumo.veiculosEmManutencao;
      this.cartoes[4].valor = resumo.manutencoesPendentes;
      this.cartoes[5].valor = resumo.manutencoesEmAtraso;
      this.cartoes[6].valor = resumo.viagensEmAndamento;
    });
  }

  private carregarAlertasCriticos(): void {
    this.notificationService.listar().subscribe(alertas => {
      this.cartoes[7].valor = alertas.filter(a => a.critico).length;
    });
  }

  private carregarChecklistsRecentes(): void {
    this.checklistService.listar().subscribe(dados => {
      this.checklistsFinalizados = dados.slice(0, 5).map(checklist => ({
        veiculo: checklist.veiculo?.placa,
        data: checklist.created_at,
        motorista: checklist.motorista?.nome,
        status: checklist.status
      }));
    });
  }

  private carregarManutencoesPendentes(): void {
    this.manutencoesService.listar().subscribe(dados => {
      this.manutencoesPendentes = dados
        .filter(item => item.status !== 'Finalizada')
        .slice(0, 5)
        .map(item => ({
          descricao: item.descricao_problema,
          data: item.created_at,
          prioridade: item.prioridade,
          status: item.status
        }));
    });
  }

  aplicarFiltroData(): void {
    const dias: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

    this.dashboardService.financeiro(dias[this.filtroData] ?? 30).subscribe(financeiro => {
      this.resumoFinanceiro = financeiro;
    });

    this.atualizarViagensFinalizadas();
  }

  private atualizarViagensFinalizadas(): void {
    const hoje = new Date();
    const limite = new Date();

    switch (this.filtroData) {
      case '7d':
        limite.setDate(hoje.getDate() - 7);
        break;
      case '90d':
        limite.setDate(hoje.getDate() - 90);
        break;
      default:
        limite.setDate(hoje.getDate() - 30);
        break;
    }

    this.viagensService.listar().subscribe(dados => {
      this.viagensFinalizadas = dados
        .filter(viagem => {
          if (viagem.status !== 'Finalizada') {
            return false;
          }
          const dataViagem = new Date(viagem.data_saida);
          return dataViagem >= limite && dataViagem <= hoje;
        })
        .map(viagem => ({
          id: viagem.id,
          veiculo: viagem.veiculo?.placa,
          motorista: viagem.motorista?.nome,
          data: viagem.data_saida,
          origem: viagem.origem,
          destino: viagem.destino,
          status: viagem.status
        }));
    });
  }

  abrirDetalheViagem(viagem: any): void {
    this.router.navigate(['/viagens', viagem.id, 'editar']);
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
