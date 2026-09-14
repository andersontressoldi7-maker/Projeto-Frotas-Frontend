import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { ManutencoesService } from '../../services/manutencoes.service';

@Component({
  selector: 'app-manutencoes',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './manutencoes.component.html'
})
export class ManutencoesComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private toastService: ToastService,
    private manutencoesService: ManutencoesService
  ) {}
  titulo = 'Manutenções';
  subtitulo = 'Gestão de manutenções e ocorrências';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'descricao', label: 'Descrição', type: 'text' },
    { key: 'prioridade', label: 'Prioridade', type: 'badge', colorGroup: 'prioridadeManutencao' },
    { key: 'status', label: 'Status', type: 'badge', colorGroup: 'statusManutencao' },
    { key: 'abertura', label: 'Abertura', type: 'date' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  todosDados: any[] = [];
  dados: any[] = [];
  carregando = true;

  ngOnInit(): void {
    this.manutencoesService.listar().subscribe({
      next: (dados) => {
        this.todosDados = dados.map(manutencao => ({
          id: manutencao.id,
          descricao: manutencao.descricao_problema,
          prioridade: manutencao.prioridade,
          status: manutencao.status,
          abertura: manutencao.created_at
        }));
        this.aplicarFiltroDaRota();
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar as manutenções.', 'Erro'); }
    });

    this.route.queryParams.subscribe(() => this.aplicarFiltroDaRota());
  }

  private aplicarFiltroDaRota(): void {
    const status = this.route.snapshot.queryParams['status'];
    const prioridade = this.route.snapshot.queryParams['prioridade'];

    if (status || prioridade) {
      this.dados = this.todosDados.filter(item => {
        const correspondeStatus = !status || (item.status || '').toLowerCase() === String(status).toLowerCase();
        const correspondePrioridade = !prioridade || (item.prioridade || '').toLowerCase() === String(prioridade).toLowerCase();
        return correspondeStatus && correspondePrioridade;
      });
      this.subtitulo = status
        ? `Filtrando por: ${status}`
        : `Filtrando por prioridade: ${prioridade}`;
    } else {
      this.dados = [...this.todosDados];
      this.subtitulo = 'Gestão de manutenções e ocorrências';
    }
  }

  aoClicarBotaoPrimario(): void {
    this.router.navigate(['/manutencoes/novo']);
  }
  aoAplicarFiltro(filtros: any): void {}

  aoClicarEditar(linha: any): void {
    this.router.navigate(['/manutencoes', linha.id, 'editar']);
  }

  async aoClicarExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir a manutenção "${linha.descricao}"?`, 'Excluir manutenção');
    if (!confirmado) {
      return;
    }

    this.manutencoesService.excluir(linha.id).subscribe({
      next: () => {
        this.todosDados = this.todosDados.filter(item => item.id !== linha.id);
        this.aplicarFiltroDaRota();
        this.toastService.sucesso('Manutenção excluída.', 'Sucesso');
      },
      error: () => this.toastService.erro('Não foi possível excluir a manutenção.', 'Erro')
    });
  }
}
