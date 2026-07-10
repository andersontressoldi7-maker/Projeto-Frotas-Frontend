import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  emailUsuario = 'andersontressoldi7@gmail.com';
  iniciaisUsuario = 'AN';

  constructor(private router: Router) {}

  alternarMenuMobile(): void {
    try {
      const evento = new CustomEvent('toggle-mobile-sidebar');
      document.dispatchEvent(evento);
    } catch {}
  }

  cartoes = [
    { titulo: 'Checklists hoje', valor: 0, icone: 'bi-check2-square', cor: 'success', rota: '' },
    {
      titulo: 'Checklists pendentes',
      valor: 0,
      icone: 'bi-clipboard-check',
      cor: 'warning',
      rota: '/checklists',
      parametros: { status: 'Pendente' }
    },
    {
      titulo: 'Veículos cadastrados',
      valor: 1,
      icone: 'bi-truck',
      cor: 'info',
      rota: '/veiculos'
    },
    {
      titulo: 'Veículos com problemas',
      valor: 0,
      icone: 'bi-exclamation-triangle',
      cor: 'danger',
      rota: '/veiculos',
      parametros: { status: 'Problema' }
    },
    {
      titulo: 'Manutenções pendentes',
      valor: 1,
      icone: 'bi-wrench',
      cor: 'secondary',
      rota: '/manutencoes',
      parametros: { status: 'Aberta' }
    },
    {
      titulo: 'Manutenções em atraso',
      valor: 1,
      icone: 'bi-clock-history',
      cor: 'danger-light',
      rota: '/manutencoes',
      parametros: { status: 'Atrasada' }
    },
    {
      titulo: 'Viagens em andamento',
      valor: 1,
      icone: 'bi-geo-alt',
      cor: 'primary',
      rota: '/viagens',
      parametros: { status: 'Em andamento' }
    },
    { titulo: 'Alertas críticos', valor: 0, icone: 'bi-bell', cor: 'danger', rota: '' }
  ];

  aoClicarNoCartao(cartao: any): void {
    if (cartao.rota) {
      this.router.navigate([cartao.rota], {
        queryParams: cartao.parametros || {}
      });
    }
  }

  manutencoesPendentes = [
    { descricao: 'Óleo Baixo', data: '22/05/2026', prioridade: 'Crítica', status: 'Aberta' }
  ];

  checklistsFinalizados = [
    { veiculo: 'abc-1234', data: '05/06/2026', motorista: 'fred', status: 'Concluído' },
    { veiculo: 'xyz-9876', data: '04/06/2026', motorista: 'joão', status: 'Concluído' }
  ];

  viagensFinalizadasBase = [
    { id: 1, veiculo: 'ABC-1234', motorista: 'João Silva', data: '2026-06-05', origem: 'São Paulo', destino: 'Campinas', status: 'Finalizada' },
    { id: 2, veiculo: 'XYZ-5678', motorista: 'Maria Santos', data: '2026-06-12', origem: 'Campinas', destino: 'Ribeirão Preto', status: 'Finalizada' },
    { id: 3, veiculo: 'DEF-9012', motorista: 'Pedro Costa', data: '2026-07-02', origem: 'Belo Horizonte', destino: 'Vitória', status: 'Finalizada' }
  ];

  viagensFinalizadas: any[] = [];

  filtroData = '30d';

  resumoFinanceiro = {
    totalReceita: 128450,
    totalDespesa: 36420,
    lucro: 92030,
    viagens: 18,
    ticketMedio: 7136,
    margem: 71.7
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
    this.aplicarFiltroData();
  }

  aplicarFiltroData(): void {
    const multiplicadores: Record<string, number> = {
      '7d': 0.8,
      '30d': 1,
      '90d': 2.6
    };

    const fator = multiplicadores[this.filtroData] ?? 1;

    this.resumoFinanceiro = {
      totalReceita: Math.round(128450 * fator),
      totalDespesa: Math.round(36420 * fator),
      lucro: Math.round(92030 * fator),
      viagens: Math.round(18 * fator),
      ticketMedio: Math.round(7136 * fator),
      margem: Number((71.7 - (fator - 1) * 1.8).toFixed(1))
    };

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

    this.viagensFinalizadas = this.viagensFinalizadasBase.filter(item => {
      const dataItem = new Date(item.data);
      return dataItem >= limite && dataItem <= hoje;
    });
  }

  abrirDetalheViagem(viagem: any): void {
    this.router.navigate(['/viagens', viagem.id, 'editar']);
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}