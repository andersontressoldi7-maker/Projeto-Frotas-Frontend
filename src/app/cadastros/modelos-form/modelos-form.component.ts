import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastsComponent } from '../../components/toasts.component';
import { ToastService } from '../../components/toast.service';
import { CadastrosRapidosStore } from '../../services/cadastros-rapidos.store';

@Component({
  selector: 'app-modelos-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, SharedFormComponent, ToastsComponent],
  template: `
    <app-sidebar></app-sidebar>
    <app-toasts></app-toasts>
    <div class="dashboard-wrapper">
      <main class="content-layout">
        <div class="container-fluid p-4">
          <app-shared-form [config]="config" [formData]="formulario" [extraValidationFn]="podeSalvar" (salvar)="aoSalvar($event)" (cancelar)="aoCancelar()"></app-shared-form>

          <div class="card mt-4">
            <div class="card-body">
              <h5 class="card-title">Itens do Modelo</h5>
              <p class="text-muted">Adicione ao menos um item. Cada item só pode ser adicionado uma vez.</p>

              <div *ngIf="mensagemErro" class="alert alert-danger">{{ mensagemErro }}</div>

              <div class="d-flex gap-2 mb-3">
                <select class="form-select" [(ngModel)]="idItemSelecionado">
                  <option [ngValue]="null">Selecione o item...</option>
                  <option *ngFor="let it of itensDisponiveis" [ngValue]="it.id">{{ it.nome }} ({{ it.categoria }})</option>
                </select>
                <button class="btn btn-success" (click)="adicionarItem()">Adicionar</button>
              </div>

              <ul class="list-group">
                <li *ngFor="let it of itens; let i = index" class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ it.nome }}</strong>
                    <div class="text-muted small">{{ it.categoria }}</div>
                  </div>
                  <button class="btn btn-sm btn-outline-danger" (click)="removerItem(i)">Remover</button>
                </li>
                <li *ngIf="itens.length === 0" class="list-group-item text-muted">Nenhum item adicionado.</li>
              </ul>
            </div>
          </div>

        </div>
      </main>
    </div>
  `
})
export class ModelosFormComponent implements OnInit {
  modoEdicao = false;
  idEmEdicao: number | null = null;
  retornoUrl: string | null = null;
  retornoCampo: string | null = null;

  formulario: any = {
    nome: '',
    tipo: 'Completo',
    ativo: true
  };

  config: FormConfig = {
    titulo: 'Novo Modelo',
    subtitulo: 'Configuração de modelos de checklist',
    secoes: [
      {
        titulo: 'Detalhes do Modelo',
        campos: [
          { nome: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, tamanho: 'full' },
          { 
            nome: 'tipo', 
            label: 'Tipo do Modelo', 
            tipo: 'select', 
            obrigatorio: true, 
            opcoes: [
              { id: 'Completo', label: 'Completo (Saída e Retorno)' },
              { id: 'Simples', label: 'Simples (Somente Saída)' }
            ], 
            tamanho: '1/2' 
          },
          { nome: 'ativo', label: 'Ativo', tipo: 'select', opcoes: [{id: true,label:'Sim'},{id:false,label:'Não'}], tamanho: '1/2' }
        ]
      }
    ]
  };

  itensDisponiveis = [
    { id: 1, nome: 'Lampadas', categoria: 'Elétrica' },
    { id: 2, nome: 'Pneus', categoria: 'Pneus' },
    { id: 3, nome: 'Freios', categoria: 'Sistema de Freio' }
  ];

  idItemSelecionado: number | null = null;
  itens: Array<any> = [];
  mensagemErro = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private store: CadastrosRapidosStore
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.retornoUrl = params['retorno'] || null;
      this.retornoCampo = params['campo'] || null;
    });

    this.route.params.subscribe(parametros => {
      if (parametros['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(parametros['id']);
        this.config.titulo = 'Editar Modelo';

        const existente = this.store.obterModelo(this.idEmEdicao);

        const dadosSimulados = {
          nome: existente?.nome ?? 'Checklist Diário',
          tipo: existente?.tipo ?? 'Completo',
          ativo: true,
          itens: [ { id: 1, nome: 'Lampadas', categoria: 'Elétrica' }, { id: 2, nome: 'Pneus', categoria: 'Pneus' } ]
        };

        this.formulario = { nome: dadosSimulados.nome, tipo: dadosSimulados.tipo, ativo: dadosSimulados.ativo };
        this.itens = dadosSimulados.itens.slice();
      }
    });
  }

  aoSalvar(dados: any): void {
    this.mensagemErro = '';
    if (!this.itens || this.itens.length === 0) {
      this.mensagemErro = 'O modelo precisa ter ao menos um item de checklist.';
      this.toastService.error(this.mensagemErro, 'Erro');
      return;
    }

    let idSalvo: number;
    if (this.modoEdicao && this.idEmEdicao !== null) {
      this.store.atualizarModelo(this.idEmEdicao, { nome: dados.nome, tipo: dados.tipo });
      idSalvo = this.idEmEdicao;
    } else {
      const novo = this.store.adicionarModelo({ nome: dados.nome, tipo: dados.tipo });
      idSalvo = novo.id;
    }

    this.toastService.success('Modelo salvo com sucesso.', 'Sucesso');

    if (this.retornoUrl && this.retornoCampo) {
      setTimeout(() => this.router.navigate([this.retornoUrl], { queryParams: { retornoCampo: this.retornoCampo, retornoId: idSalvo } }), 300);
    } else {
      setTimeout(() => this.router.navigate(['/modelos']), 300);
    }
  }

  aoCancelar(): void {
    if (this.retornoUrl) {
      this.router.navigate([this.retornoUrl]);
    } else {
      this.router.navigate(['/modelos']);
    }
  }

  adicionarItem(): void {
    this.mensagemErro = '';
    if (!this.idItemSelecionado) {
      this.mensagemErro = 'Selecione o item para adicionar.';
      this.toastService.warning(this.mensagemErro, 'Atenção');
      return;
    }

    const jaExiste = this.itens.find(i => i.id === this.idItemSelecionado);
    if (jaExiste) {
      this.mensagemErro = 'Este item já foi adicionado ao modelo.';
      this.toastService.warning(this.mensagemErro, 'Atenção');
      return;
    }

    const encontrado = this.itensDisponiveis.find(i => i.id === this.idItemSelecionado);
    if (encontrado) {
      this.itens.push({ ...encontrado });
      this.idItemSelecionado = null;
      this.toastService.info(`Item "${encontrado.nome}" adicionado ao modelo.`, 'Item adicionado');
    }
  }

  removerItem(indice: number): void {
    this.itens.splice(indice, 1);
    this.toastService.info('Item removido do modelo.', 'Removido');
  }

  podeSalvar = (): boolean => {
    if (!this.itens || this.itens.length === 0) return false;
    if (!this.formulario || !this.formulario.nome || this.formulario.nome.trim().length === 0) return false;
    if (!this.formulario.tipo) return false;
    return true;
  }
}