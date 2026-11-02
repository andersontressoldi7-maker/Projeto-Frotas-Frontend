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
import { FiltrosPaginados } from '../../services/paginacao.utils';

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

  data: any[] = [];
  opcoesFiltrosRemotas: Record<string, string[]> = {};
  private filtrosGrid: FiltrosPaginados = {};
  carregando = true;
  paginaAtual = 1;
  temProximaPagina = false;
  private readonly porPagina = 50;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private toastService: ToastService,
    private abastecimentosService: AbastecimentosService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(() => this.carregarDados(1));
  }

  private carregarDados(pagina = this.paginaAtual): void {
    this.carregando = true;
    this.abastecimentosService.listar(pagina, this.porPagina, this.obterFiltrosApi()).subscribe({
      next: (resposta) => {
        this.paginaAtual = resposta.current_page;
        this.temProximaPagina = resposta.next_page_url !== null;
        this.opcoesFiltrosRemotas = resposta.filter_options || {};
        this.data = resposta.data.map(abastecimento => ({
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
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.toastService.erro('Não foi possível carregar os abastecimentos.', 'Erro');
      }
    });
  }

  mudarPagina(pagina: number): void {
    if (pagina < 1 || (pagina > this.paginaAtual && !this.temProximaPagina) || pagina === this.paginaAtual || this.carregando) {
      return;
    }
    this.carregarDados(pagina);
  }

  private obterFiltrosApi(): FiltrosPaginados {
    const filtros: FiltrosPaginados = { ...this.filtrosGrid };
    const tipo = this.route.snapshot.queryParams['tipo'];
    if (tipo) {
      filtros['tipoAbastecimento'] = String(tipo);
    }
    this.subtitle = tipo
      ? `Filtrando por: ${tipo}`
      : 'Controle de abastecimentos da frota';
    return filtros;
  }

  onPrimaryAction(): void {
    this.router.navigate(['/abastecimentos/novo']);
  }

  onFilterApplied(filters: any): void {
    this.filtrosGrid = filters as FiltrosPaginados;
    this.carregarDados(1);
  }

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
        this.toastService.sucesso('Abastecimento excluído.', 'Sucesso');
        this.carregarDados(this.data.length === 1 && this.paginaAtual > 1
          ? this.paginaAtual - 1
          : this.paginaAtual);
      },
      error: () => this.toastService.erro('Não foi possível excluir o abastecimento.', 'Erro')
    });
  }
}
