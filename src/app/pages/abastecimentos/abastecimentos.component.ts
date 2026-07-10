import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { GridColumn } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-abastecimentos',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent],
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
    { key: 'tipoAbastecimento', label: 'Tipo', type: 'badge' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  allData: any[] = [
    { id: 1, nroFrota: '001', placa: 'ABC-1234', motorista: 'João Silva', dataAbastecimento: '2026-07-01', combustivel: 'Diesel S10', qtLitros: 150, valorTotal: 897.00, tipoAbastecimento: 'Interno' },
    { id: 2, nroFrota: '002', placa: 'XYZ-5678', motorista: 'Maria Souza', dataAbastecimento: '2026-07-05', combustivel: 'Diesel S500', qtLitros: 80, valorTotal: 456.80, tipoAbastecimento: 'Externo' }
  ];

  data: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tipo = params['tipo'];
      if (tipo) {
        this.data = this.allData.filter(item => item.tipoAbastecimento.toLowerCase() === String(tipo).toLowerCase());
        this.subtitle = `Filtrando por: ${tipo}`;
      } else {
        this.data = [...this.allData];
        this.subtitle = 'Controle de abastecimentos da frota';
      }
    });
  }

  onPrimaryAction(): void {
    this.router.navigate(['/abastecimentos/novo']);
  }

  onFilterApplied(filters: any): void {}

  onEditClick(row: any): void {
    this.router.navigate(['/abastecimentos', row.id, 'editar']);
  }

  onDeleteClick(row: any): void {
    const confirmado = confirm(`Excluir o abastecimento do veículo ${row.placa} em ${row.dataAbastecimento}?`);
    if (confirmado) {
      this.allData = this.allData.filter(item => item.id !== row.id);
      this.data = this.data.filter(item => item.id !== row.id);
    }
  }
}
