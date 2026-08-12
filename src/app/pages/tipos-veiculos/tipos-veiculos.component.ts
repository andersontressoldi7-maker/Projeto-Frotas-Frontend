import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { TiposVeiculosService } from '../../services/tipos-veiculos.service';

@Component({
  selector: 'app-tipos-veiculos',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './tipos-veiculos.component.html'
})
export class TiposVeiculosComponent implements OnInit {
  titulo = 'Tipos de Veículos';
  subtitulo = 'Categorias para classificar a frota';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'descricao', label: 'Descrição', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  opcoesFiltro: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' }
  ];

  dados: any[] = [];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService,
    private tiposVeiculosService: TiposVeiculosService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.tiposVeiculosService.listar().subscribe({
      next: (dados) => this.dados = dados,
      error: () => this.toastService.erro('Não foi possível carregar os tipos de veículos.', 'Erro')
    });
  }

  aoAcaoPrimaria(): void { this.router.navigate(['/tipos-veiculos/novo']); }
  aoFiltroAplicado(filtros: any): void {}

  aoEditar(linha: any): void {
    this.router.navigate(['/tipos-veiculos', linha.id, 'editar']);
  }

  async aoExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o tipo ${linha.nome}?`, 'Excluir tipo de veículo');
    if (!confirmado) {
      return;
    }

    this.tiposVeiculosService.excluir(linha.id).subscribe({
      next: () => {
        this.carregarDados();
        this.toastService.sucesso('Tipo de veículo excluído.', 'Sucesso');
      },
      error: () => this.toastService.erro('Não foi possível excluir o tipo de veículo.', 'Erro')
    });
  }
}
