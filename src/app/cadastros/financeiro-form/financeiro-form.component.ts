import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { IaCadastroComponent } from '../../components/ia-cadastro/ia-cadastro.component';
import { DialogService } from '../../components/dialog/dialog.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ToastService } from '../../components/toast.service';
import { DadosMovimentacao, FinanceiroService } from '../../services/financeiro.service';

@Component({
  selector: 'app-financeiro-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, IaCadastroComponent],
  templateUrl: './financeiro-form.component.html',
  styleUrl: './financeiro-form.component.scss'
})
export class FinanceiroFormComponent implements OnInit {
  id: number | null = null;
  origem = '';
  origemTipo: string | null = null;
  origemId: number | null = null;
  carregando = false;
  salvando = false;
  dados: DadosMovimentacao = {
    tipo: 'Receita', titulo: '', categoria: null, data_vencimento: '', data_pagamento: null, valor: 0
  };

  constructor(
    private rota: ActivatedRoute,
    private navegador: Router,
    private financeiro: FinanceiroService,
    private avisos: ToastService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    const id = Number(this.rota.snapshot.paramMap.get('id'));
    if (id) {
      this.id = id;
      this.carregarMovimentacao(id);
      return;
    }
    if (this.rota.snapshot.queryParamMap.get('tipo') === 'Despesa') this.dados.tipo = 'Despesa';
  }

  private carregarMovimentacao(id: number): void {
    this.carregando = true;
    this.financeiro.obter(id).subscribe({
      next: item => {
        this.origem = item.origem;
        this.origemTipo = item.origem_tipo;
        this.origemId = item.origem_id;
        this.dados = {
          tipo: item.tipo,
          titulo: item.titulo,
          categoria: item.categoria,
          data_vencimento: item.data_vencimento.slice(0, 10),
          data_pagamento: item.data_pagamento?.slice(0, 10) || null,
          valor: Number(item.valor)
        };
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.avisos.erro('Não foi possível carregar a movimentação.', 'Erro');
      }
    });
  }

  salvar(): void {
    if (this.salvando || !this.dados.titulo.trim() || !this.dados.data_vencimento || Number(this.dados.valor) <= 0) {
      this.avisos.erro('Informe título, vencimento e um valor maior que zero.', 'Dados inválidos');
      return;
    }
    const dados = {
      ...this.dados,
      titulo: this.dados.titulo.trim(),
      categoria: this.dados.categoria?.trim() || null,
      data_pagamento: this.dados.data_pagamento || null,
      valor: Number(this.dados.valor)
    };
    this.salvando = true;
    const requisicao = this.id ? this.financeiro.atualizar(this.id, dados) : this.financeiro.criar(dados);
    requisicao.subscribe({
      next: () => {
        this.avisos.sucesso('Movimentação salva.', 'Sucesso');
        this.voltar();
      },
      error: erro => {
        this.salvando = false;
        this.avisos.erro(erro?.error?.message || 'Não foi possível salvar a movimentação.', 'Erro');
      }
    });
  }

  voltar(): void { this.navegador.navigate(['/financeiro']); }

  async cancelar(): Promise<void> {
    if (await this.dialogService.confirmarSaida()) {
      this.voltar();
    }
  }

  abrirOrigem(): void {
    if (!this.origemTipo || !this.origemId) return;
    const modulo = this.origemTipo.startsWith('Viagem') || this.origemTipo === 'AbastecimentoViagem'
      ? 'viagens'
      : this.origemTipo === 'Manutencao' ? 'manutencoes' : 'abastecimentos';
    this.navegador.navigate([`/${modulo}`, this.origemId, 'editar']);
  }
}
