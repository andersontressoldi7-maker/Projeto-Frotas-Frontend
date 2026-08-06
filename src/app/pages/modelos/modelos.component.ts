import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { CadastrosRapidosStore } from '../../services/cadastros-rapidos.store';

@Component({
  selector: 'app-modelos',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './modelos.component.html'
})
export class ModelosComponent implements OnInit {
  title = 'Modelos de Checklist';
  subtitle = 'Configuração de formulários de vistoria';
  primaryBtnLabel = 'Novo';

  columns: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'ativo', label: 'Ativo', type: 'text', filterType: 'select', filterOptions: ['Sim', 'Não'] },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  data: any[] = [];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService,
    private store: CadastrosRapidosStore
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.data = this.store.modelos.map(modelo => ({
      id: modelo.id,
      nome: modelo.nome,
      ativo: modelo.ativo ? 'Sim' : 'Não'
    }));
  }

  onPrimaryAction(): void { this.router.navigate(['/modelos/novo']); }
  onFilterApplied(filters: any): void {}

  onEditClick(row: any): void {
    this.router.navigate(['/modelos', row.id, 'editar']);
  }

  async onDeleteClick(row: any): Promise<void> {
    if (this.store.modeloEstaEmUso(row.id)) {
      const desativar = await this.dialogService.confirmar(
        `O modelo "${row.nome}" já foi utilizado em checklists e não pode ser excluído definitivamente. Deseja desativá-lo? Modelos inativos deixam de aparecer na criação de novos checklists.`,
        'Modelo em uso'
      );

      if (desativar) {
        this.store.atualizarModelo(row.id, { ativo: false });
        this.carregarDados();
        this.toastService.success('Modelo desativado.', 'Sucesso');
      }

      return;
    }

    const confirmado = await this.dialogService.confirmar(`Deseja excluir o modelo ${row.nome}?`, 'Excluir modelo');
    if (!confirmado) {
      return;
    }

    this.store.excluirModelo(row.id);
    this.carregarDados();
    this.toastService.success('Modelo excluído.', 'Sucesso');
  }
}