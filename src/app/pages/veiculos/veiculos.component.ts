import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { VeiculosService } from '../../services/veiculos.service';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './veiculos.component.html'
})
export class VeiculosComponent implements OnInit {
  titulo = 'Veículos';
  subtitulo = 'Gestão da frota com histórico de checklists';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'placa', label: 'Placa', type: 'text' },
    { key: 'modelo', label: 'Modelo', type: 'text' },
    { key: 'ano', label: 'Ano', type: 'number' },
    { key: 'km', label: 'KM', type: 'number' },
    { key: 'status', label: 'Status', type: 'badge', colorGroup: 'statusVeiculo' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  todosDados: any[] = [];
  dados: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private toastService: ToastService,
    private veiculosService: VeiculosService
  ) {}

  ngOnInit(): void {
    this.veiculosService.listar().subscribe({
      next: (dados) => {
        this.todosDados = dados;
        this.aplicarFiltroDaRota();
      },
      error: () => this.toastService.erro('Não foi possível carregar os veículos.', 'Erro')
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
      this.subtitulo = 'Gestão da frota com histórico de checklists';
    }
  }

  aoAcaoPrimaria(): void { this.router.navigate(['/veiculos/novo']); }
  aoFiltroAplicado(filtros: any): void {}

  aoEditar(linha: any): void {
    this.router.navigate(['/veiculos', linha.id, 'editar']);
  }

  async aoExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o veículo ${linha.placa}?`, 'Excluir veículo');
    if (!confirmado) {
      return;
    }

    this.veiculosService.excluir(linha.id).subscribe({
      next: () => {
        this.todosDados = this.todosDados.filter(item => item.id !== linha.id);
        this.aplicarFiltroDaRota();
        this.toastService.sucesso('Veículo excluído.', 'Sucesso');
      },
      error: () => this.toastService.erro('Não foi possível excluir o veículo.', 'Erro')
    });
  }
}
