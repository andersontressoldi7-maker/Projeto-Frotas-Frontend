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
  title = 'Veículos';
  subtitle = 'Gestão da frota com histórico de checklists';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'placa', label: 'Placa', type: 'text' },
    { key: 'modelo', label: 'Modelo', type: 'text' },
    { key: 'ano', label: 'Ano', type: 'number' },
    { key: 'km', label: 'KM', type: 'number' },
    { key: 'status', label: 'Status', type: 'badge', colorGroup: 'statusVeiculo' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  allData: any[] = [];
  data: any[] = [];

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
        this.allData = dados;
        this.aplicarFiltroDaRota();
      },
      error: () => this.toastService.error('Não foi possível carregar os veículos.', 'Erro')
    });

    this.route.queryParams.subscribe(() => this.aplicarFiltroDaRota());
  }

  private aplicarFiltroDaRota(): void {
    const status = this.route.snapshot.queryParams['status'];
    if (status) {
      this.data = this.allData.filter(item => (item.status || '').toLowerCase() === String(status).toLowerCase());
      this.subtitle = `Filtrando por: ${status}`;
    } else {
      this.data = [...this.allData];
      this.subtitle = 'Gestão da frota com histórico de checklists';
    }
  }

  onPrimaryAction(): void { this.router.navigate(['/veiculos/novo']); }
  onFilterApplied(filters: any): void {}

  onEditClick(row: any): void {
    this.router.navigate(['/veiculos', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o veículo ${row.placa}?`, 'Excluir veículo');
    if (!confirmado) {
      return;
    }

    this.veiculosService.excluir(row.id).subscribe({
      next: () => {
        this.allData = this.allData.filter(item => item.id !== row.id);
        this.aplicarFiltroDaRota();
        this.toastService.success('Veículo excluído.', 'Sucesso');
      },
      error: () => this.toastService.error('Não foi possível excluir o veículo.', 'Erro')
    });
  }
}
