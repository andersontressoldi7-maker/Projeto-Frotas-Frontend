import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedGridComponent } from '../../components/shared-grid/shared-grid.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { GridColumn } from '../../interfaces/grid.interface';
import { DialogService } from '../../components/dialog/dialog.service';
import { ToastService } from '../../components/toast.service';
import { MotoristasService } from '../../services/motoristas.service';

@Component({
  selector: 'app-motoristas',
  standalone: true,
  imports: [CommonModule, SharedGridComponent, SidebarComponent, HeaderComponent],
  templateUrl: './motoristas.component.html'
})
export class MotoristasComponent implements OnInit {
  titulo = 'Motoristas';
  subtitulo = 'Cadastro e controle de documentos';
  rotuloBotaoPrimario = 'Novo';

  colunas: GridColumn[] = [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'cnh', label: 'CNH', type: 'text' },
    { key: 'validade_cnh', label: 'Validade', type: 'date' },
    { key: 'telefone', label: 'Telefone', type: 'text' },
    { key: 'acoes', label: 'Ações', type: 'acoes' }
  ];

  dados: any[] = [];
  carregando = true;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private toastService: ToastService,
    private motoristasService: MotoristasService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.motoristasService.listar().subscribe({
      next: (dados) => { this.dados = dados; this.carregando = false; },
      error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar os motoristas.', 'Erro'); }
    });
  }

  aoAcaoPrimaria(): void { this.router.navigate(['/motoristas/novo']); }
  aoAplicarFiltro(filtros: any): void {}

  aoClicarEditar(linha: any): void {
    this.router.navigate(['/motoristas', linha.id, 'editar']);
  }

  async aoClicarExcluir(linha: any): Promise<void> {
    const confirmado = await this.dialogService.confirmar(`Deseja excluir o motorista ${linha.nome}?`, 'Excluir motorista');
    if (!confirmado) {
      return;
    }

    this.motoristasService.excluir(linha.id).subscribe({
      next: () => {
        this.carregarDados();
        this.toastService.sucesso('Motorista excluído.', 'Sucesso');
      },
      error: () => this.toastService.erro('Não foi possível excluir o motorista.', 'Erro')
    });
  }
}
