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
  selector: 'app-itens',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './itens.component.html'
})
export class ItensComponent {
  title = 'Itens de Checklist';
  subtitle = 'Perguntas reutilizáveis nos modelos de checklist';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'categoria', label: 'Categoria', type: 'text' },
    { key: 'tipo', label: 'Tipo', type: 'text' },
    { key: 'geraManutencao', label: 'Gera manutenção', type: 'text' },
    { key: 'ativo', label: 'Ativo', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'categoria', label: 'Categoria', type: 'text' },
    { key: 'geraManutencao', label: 'Gera manutenção', type: 'select', options: [
      { label: 'Sim', value: 'Sim' },
      { label: 'Não', value: 'Não' }
    ]}
  ];

  data: any[] = [
    { id: 1, nome: 'item 1', categoria: 'pneu', tipo: 'Bom / Regular / Ruim', geraManutencao: 'Sim', ativo: 'Sim' }
  ];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService
  ) {}

  onPrimaryAction(): void { this.router.navigate(['/itens/novo']); }
  onFilterApplied(filters: any): void {}

  onEditClick(row: any): void {
    this.router.navigate(['/itens', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o item ${row.nome}?`, 'Excluir item');
    if (!confirmado) {
      return;
    }

    this.data = this.data.filter(item => item.id !== row.id);
    this.toastService.success('Item excluído.', 'Sucesso');
  }
}