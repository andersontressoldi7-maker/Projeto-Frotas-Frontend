import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { TiposDespesasService } from '../../services/tipos-despesas.service';

@Component({
  selector: 'app-tipos-despesas',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './tipos-despesas.component.html'
})
export class TiposDespesasComponent implements OnInit {
  titulo = 'Tipos de Despesas';
  subtitulo = 'Cadastre os tipos de despesas usados nas viagens';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  opcoesFiltro: GridFilterOption[] = [
    { key: 'nome', label: 'Nome', type: 'text' }
  ];

  dados: any[] = [];
  carregando = true;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService,
    private tiposDespesasService: TiposDespesasService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.tiposDespesasService.listar().subscribe({
      next: (dados) => { this.dados = dados; this.carregando = false; },
      error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar os tipos de despesas.', 'Erro'); }
    });
  }

  aoAcaoPrimaria(): void {
    this.router.navigate(['/tipos-despesas/novo']);
  }

  aoAplicarFiltro(filtros: any): void {}

  aoClicarEditar(linha: any): void {
    this.router.navigate(['/tipos-despesas', linha.id, 'editar']);
  }

  async aoClicarExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o tipo de despesa ${linha.nome}?`, 'Excluir tipo de despesa');
    if (!confirmado) {
      return;
    }

    this.tiposDespesasService.excluir(linha.id).subscribe({
      next: () => {
        this.carregarDados();
        this.toastService.sucesso('Tipo de despesa excluído.', 'Sucesso');
      },
      error: () => this.toastService.erro('Não foi possível excluir o tipo de despesa.', 'Erro')
    });
  }
}
