import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { TiposManutencaoService } from '../../services/tipos-manutencao.service';

@Component({
  selector: 'app-tipos-manutencao',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './tipos-manutencao.component.html'
})
export class TiposManutencaoComponent implements OnInit {
  title = 'Tipos de Manutenção';
  subtitle = 'Categorias de serviços de manutenção';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'descricao', label: 'Descrição', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  filterOptions: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' }
  ];

  data: any[] = [];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService,
    private tiposManutencaoService: TiposManutencaoService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.tiposManutencaoService.listar().subscribe({
      next: (dados) => this.data = dados,
      error: () => this.toastService.error('Não foi possível carregar os tipos de manutenção.', 'Erro')
    });
  }

  onPrimaryAction(): void { this.router.navigate(['/tipos-manutencao/novo']); }
  onFilterApplied(filters: any): void {}

  onEditClick(row: any): void {
    this.router.navigate(['/tipos-manutencao', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o tipo ${row.nome}?`, 'Excluir tipo de manutenção');
    if (!confirmado) {
      return;
    }

    this.tiposManutencaoService.excluir(row.id).subscribe({
      next: () => {
        this.carregarDados();
        this.toastService.success('Tipo de manutenção excluído.', 'Sucesso');
      },
      error: () => this.toastService.error('Não foi possível excluir o tipo de manutenção.', 'Erro')
    });
  }
}
