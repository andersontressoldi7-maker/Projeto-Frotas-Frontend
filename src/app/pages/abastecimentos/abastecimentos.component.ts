import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { AbastecimentosService } from '../../services/abastecimentos.service';

@Component({
  selector: 'app-abastecimentos',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './abastecimentos.component.html',
  styleUrls: ['./abastecimentos.component.scss']
})
export class AbastecimentosComponent implements OnInit {
  title = 'Abastecimentos';
  subtitle = 'Controle de abastecimentos da frota';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nroFrota', label: 'Nro Frota', type: 'text' },
    { key: 'placa', label: 'Placa', type: 'text' },
    { key: 'motorista', label: 'Motorista', type: 'text' },
    { key: 'dataAbastecimento', label: 'Data', type: 'date' },
    { key: 'combustivel', label: 'Combustível', type: 'text' },
    { key: 'qtLitros', label: 'Litros', type: 'number' },
    { key: 'valorTotal', label: 'Valor Total', type: 'number' },
    { key: 'tipoAbastecimento', label: 'Tipo', type: 'badge', colorGroup: 'tipoAbastecimento' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  allData: any[] = [];
  data: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private toastService: ToastService,
    private abastecimentosService: AbastecimentosService
  ) {}

  ngOnInit(): void {
    this.abastecimentosService.listar().subscribe({
      next: (dados) => {
        this.allData = dados.map(abastecimento => ({
          id: abastecimento.id,
          nroFrota: abastecimento.veiculo?.nro_frota,
          placa: abastecimento.veiculo?.placa,
          motorista: abastecimento.motorista?.nome,
          dataAbastecimento: abastecimento.data_abastecimento,
          combustivel: abastecimento.combustivel,
          qtLitros: abastecimento.qt_litros,
          valorTotal: abastecimento.valor_total,
          tipoAbastecimento: abastecimento.tipo_abastecimento
        }));
        this.aplicarFiltroDaRota();
      },
      error: () => this.toastService.error('Não foi possível carregar os abastecimentos.', 'Erro')
    });

    this.route.queryParams.subscribe(() => this.aplicarFiltroDaRota());
  }

  private aplicarFiltroDaRota(): void {
    const tipo = this.route.snapshot.queryParams['tipo'];
    if (tipo) {
      this.data = this.allData.filter(item => (item.tipoAbastecimento || '').toLowerCase() === String(tipo).toLowerCase());
      this.subtitle = `Filtrando por: ${tipo}`;
    } else {
      this.data = [...this.allData];
      this.subtitle = 'Controle de abastecimentos da frota';
    }
  }

  onPrimaryAction(): void {
    this.router.navigate(['/abastecimentos/novo']);
  }

  onFilterApplied(filters: any): void {}

  onEditClick(row: any): void {
    this.router.navigate(['/abastecimentos', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o abastecimento do veículo ${row.placa} em ${row.dataAbastecimento}?`, 'Excluir abastecimento');
    if (!confirmado) {
      return;
    }

    this.abastecimentosService.excluir(row.id).subscribe({
      next: () => {
        this.allData = this.allData.filter(item => item.id !== row.id);
        this.aplicarFiltroDaRota();
        this.toastService.success('Abastecimento excluído.', 'Sucesso');
      },
      error: () => this.toastService.error('Não foi possível excluir o abastecimento.', 'Erro')
    });
  }
}
