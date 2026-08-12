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
  titulo = 'Tipos de Manutenção';
  subtitulo = 'Categorias de serviços de manutenção';
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
    private tiposManutencaoService: TiposManutencaoService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.tiposManutencaoService.listar().subscribe({
      next: (dados) => this.dados = dados,
      error: () => this.toastService.erro('Não foi possível carregar os tipos de manutenção.', 'Erro')
    });
  }

  aoAcaoPrimaria(): void { this.router.navigate(['/tipos-manutencao/novo']); }
  aoAplicarFiltro(filtros: any): void {}

  aoClicarEditar(linha: any): void {
    this.router.navigate(['/tipos-manutencao', linha.id, 'editar']);
  }

  async aoClicarExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o tipo ${linha.nome}?`, 'Excluir tipo de manutenção');
    if (!confirmado) {
      return;
    }

    this.tiposManutencaoService.excluir(linha.id).subscribe({
      next: () => {
        this.carregarDados();
        this.toastService.sucesso('Tipo de manutenção excluído.', 'Sucesso');
      },
      error: () => this.toastService.erro('Não foi possível excluir o tipo de manutenção.', 'Erro')
    });
  }
}
