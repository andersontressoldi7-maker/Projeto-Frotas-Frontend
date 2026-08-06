import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';

@Component({
  selector: 'app-motoristas',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './motoristas.component.html'
})
export class MotoristasComponent {
  title = 'Motoristas';
  subtitle = 'Cadastro e controle de documentos';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'cnh', label: 'CNH', type: 'text' },
    { key: 'validade', label: 'Validade', type: 'date' },
    { key: 'telefone', label: 'Telefone', type: 'text' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  data: any[] = [
    { id: 1, nome: 'fred', cnh: '000000000', validade: '20/05/2026', telefone: '61999647075', status: 'Ativo' }
  ];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService
  ) {}

  onPrimaryAction(): void { this.router.navigate(['/motoristas/novo']); }
  onFilterApplied(filters: any): void {}

  onEditClick(row: any): void {
    this.router.navigate(['/motoristas', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o motorista ${row.nome}?`, 'Excluir motorista');
    if (!confirmado) {
      return;
    }

    this.data = this.data.filter(item => item.id !== row.id);
    this.toastService.success('Motorista excluído.', 'Sucesso');
  }
}