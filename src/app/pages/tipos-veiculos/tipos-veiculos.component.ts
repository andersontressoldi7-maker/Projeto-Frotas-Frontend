import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-tipos-veiculos',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './tipos-veiculos.component.html'
})
export class TiposVeiculosComponent {
  title = 'Tipos de Veículos';
  subtitle = 'Categorias para classificar a frota';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'descricao', label: 'Descrição', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' }
  ];

  data: any[] = [
    { id: 1, nome: 'caminao 1', descricao: 'gfsd' }
  ];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService
  ) {}

  onPrimaryAction(): void { this.router.navigate(['/tipos-veiculos/novo']); }
  onFilterApplied(filters: any): void {}

  onEditClick(row: any): void {
    this.router.navigate(['/tipos-veiculos', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o tipo ${row.nome}?`, 'Excluir tipo de veículo');
    if (!confirmado) {
      return;
    }

    this.data = this.data.filter(item => item.id !== row.id);
    this.toastService.success('Tipo de veículo excluído.', 'Sucesso');
  }
}