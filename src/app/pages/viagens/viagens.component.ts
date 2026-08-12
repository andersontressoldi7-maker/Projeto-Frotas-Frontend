import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { ViagensService } from '../../services/viagens.service';

@Component({
  selector: 'app-viagens',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './viagens.component.html'
})
export class ViagensComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private toastService: ToastService,
    private viagensService: ViagensService
  ) {}
  titulo = 'Viagens';
  subtitulo = 'Controle de viagens simplificadas';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'origem', label: 'Origem', type: 'text' },
    { key: 'destino', label: 'Destino', type: 'text' },
    { key: 'saida', label: 'Saída', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge', colorGroup: 'statusViagem' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  todosDados: any[] = [];
  dados: any[] = [];

  ngOnInit(): void {
    this.viagensService.listar().subscribe({
      next: (dados) => {
        this.todosDados = dados.map(viagem => ({
          id: viagem.id,
          origem: viagem.origem,
          destino: viagem.destino,
          saida: viagem.data_saida,
          status: viagem.status
        }));
        this.aplicarFiltroDaRota();
      },
      error: () => this.toastService.erro('Não foi possível carregar as viagens.', 'Erro')
    });

    this.route.queryParams.subscribe(() => this.aplicarFiltroDaRota());
  }

  private aplicarFiltroDaRota(): void {
    const status = this.route.snapshot.queryParams['status'];
    if (status) {
      this.dados = this.todosDados.filter(item => (item.status || '').toLowerCase() === String(status).toLowerCase());
      this.subtitulo = `Filtrando por: ${status}`;
    } else {
      this.dados = [...this.todosDados];
      this.subtitulo = 'Controle de viagens simplificadas';
    }
  }

  aoAcaoPrimaria(): void {
    this.router.navigate(['/viagens/novo']);
  }
  aoFiltroAplicado(filtros: any): void {}

  aoEditar(linha: any): void {
    this.router.navigate(['/viagens', linha.id, 'editar']);
  }

  async aoExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir a viagem ${linha.origem} → ${linha.destino}?`, 'Excluir viagem');
    if (!confirmado) {
      return;
    }

    this.viagensService.excluir(linha.id).subscribe({
      next: () => {
        this.todosDados = this.todosDados.filter(item => item.id !== linha.id);
        this.aplicarFiltroDaRota();
        this.toastService.sucesso('Viagem excluída.', 'Sucesso');
      },
      error: () => this.toastService.erro('Não foi possível excluir a viagem.', 'Erro')
    });
  }
}
