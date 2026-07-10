import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';

@Component({
  selector: 'app-manutencoes-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, SharedFormComponent],
  template: `
    <app-sidebar></app-sidebar>
    <div class="dashboard-wrapper">
      <main class="content-layout">
        <div class="container-fluid p-4">
          
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">{{ configFormulario.titulo }}</h2>
            <div class="bg-success text-white px-4 py-2 rounded shadow-sm">
              <h4 class="mb-0">Total: {{ calcularTotal() | currency:'BRL' }}</h4>
            </div>
          </div>

          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <a class="nav-link cursor-pointer" [class.active]="abaAtiva === 'geral'" (click)="abaAtiva = 'geral'">Informações Gerais</a>
            </li>
            <li class="nav-item">
              <a class="nav-link cursor-pointer" [class.active]="abaAtiva === 'servicos'" (click)="abaAtiva = 'servicos'">Mão de Obra</a>
            </li>
            <li class="nav-item">
              <a class="nav-link cursor-pointer" [class.active]="abaAtiva === 'produtos'" (click)="abaAtiva = 'produtos'">Produtos</a>
            </li>
            <li class="nav-item">
              <a class="nav-link cursor-pointer" [class.active]="abaAtiva === 'checklists'" (click)="abaAtiva = 'checklists'">Checklists Vinculados</a>
            </li>
          </ul>

          <div class="tab-content">
            
            <div *ngIf="abaAtiva === 'geral'">
              <app-shared-form 
                [config]="configFormulario"
                [formData]="formulario"
                (salvar)="onSalvar($event)"
                (cancelar)="onCancelar()">
              </app-shared-form>
            </div>

            <div *ngIf="abaAtiva === 'servicos'" class="card p-4">
              <h5 class="mb-3">Adicionar Mão de Obra</h5>
              <div class="row mb-4">
                <div class="col-md-6">
                  <input type="text" class="form-control" placeholder="Descrição do serviço" [(ngModel)]="novoServico.descricao">
                </div>
                <div class="col-md-4">
                  <input type="number" class="form-control" placeholder="Valor (R$)" [(ngModel)]="novoServico.valor">
                </div>
                <div class="col-md-2">
                  <button class="btn btn-primary w-100" (click)="adicionarServico()">Adicionar</button>
                </div>
              </div>

              <table class="table table-hover mt-3">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th width="100">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let servico of listaMaoDeObra; let i = index">
                    <td>{{ servico.descricao }}</td>
                    <td>{{ servico.valor | currency:'BRL' }}</td>
                    <td>
                      <button class="btn btn-sm btn-danger" (click)="removerServico(i)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="abaAtiva === 'produtos'" class="card p-4">
              <h5 class="mb-3">Adicionar Produto/Peça</h5>
              <div class="row mb-4">
                <div class="col-md-5">
                  <input type="text" class="form-control" placeholder="Descrição do produto" [(ngModel)]="novoProduto.descricao">
                </div>
                <div class="col-md-2">
                  <input type="number" class="form-control" placeholder="Qtd" [(ngModel)]="novoProduto.quantidade">
                </div>
                <div class="col-md-3">
                  <input type="number" class="form-control" placeholder="Valor Unit. (R$)" [(ngModel)]="novoProduto.valorUnitario">
                </div>
                <div class="col-md-2">
                  <button class="btn btn-primary w-100" (click)="adicionarProduto()">Adicionar</button>
                </div>
              </div>

              <table class="table table-hover mt-3">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Qtd</th>
                    <th>Valor Unit.</th>
                    <th>Subtotal</th>
                    <th width="100">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let prod of listaProdutos; let i = index">
                    <td>{{ prod.descricao }}</td>
                    <td>{{ prod.quantidade }}</td>
                    <td>{{ prod.valorUnitario | currency:'BRL' }}</td>
                    <td>{{ (prod.quantidade * prod.valorUnitario) | currency:'BRL' }}</td>
                    <td>
                      <button class="btn btn-sm btn-danger" (click)="removerProduto(i)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="abaAtiva === 'checklists'" class="card p-4">
              <h5 class="mb-3">Vincular Checklist</h5>
              <div class="row mb-4">
                <div class="col-md-10">
                  <select class="form-select" [(ngModel)]="novoChecklist">
                    <option value="" disabled selected>Selecione um checklist existente</option>
                    <option value="Checklist de Pneus #098">Checklist de Pneus #098</option>
                    <option value="Checklist Motor #105">Checklist Motor #105</option>
                    <option value="Checklist Preventivo #220">Checklist Preventivo #220</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <button class="btn btn-primary w-100" (click)="vincularChecklist()">Vincular</button>
                </div>
              </div>

              <table class="table table-hover mt-3">
                <thead>
                  <tr>
                    <th>Identificação do Checklist</th>
                    <th width="100">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let check of listaChecklists; let i = index">
                    <td>{{ check.nome }}</td>
                    <td>
                      <button class="btn btn-sm btn-danger" (click)="removerChecklist(i)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { margin-top: 0; }
    .cursor-pointer { cursor: pointer; }
    .nav-tabs .nav-link { color: var(--bs-body-color); }
    .nav-tabs .nav-link.active { font-weight: bold; color: #0ea5a4; }
  `]
})
export class ManutencoesFormComponent implements OnInit {
  modoEdicao = false;
  abaAtiva = 'geral';
  
  formulario = {
    origem: 'Checklist #123',
    veiculo: '',
    motoristaRelator: '',
    descricaoProblema: '',
    tipoManutencao: '',
    prioridade: 'Normal',
    status: 'Aberta',
    dataPrevisaoEntrega: ''
  };

  listaMaoDeObra: any[] = [];
  novoServico = { descricao: '', valor: null as any };

  listaProdutos: any[] = [];
  novoProduto = { descricao: '', quantidade: 1, valorUnitario: null as any };

  listaChecklists: any[] = [
    { nome: 'Checklist #123' }
  ];
  novoChecklist = '';

  configFormulario: FormConfig = {
    titulo: 'Nova Manutenção',
    subtitulo: 'Gestão de manutenções e ocorrências',
    botaoPrincipalLabel: 'Salvar Tudo',
    botaoCancelLabel: 'Cancelar',
    secoes: [
      {
        titulo: 'Informações da Manutenção',
        campos: [
          { nome: 'origem', label: 'Origem', tipo: 'text', readOnly: true, tamanho: '1/2' },
          { nome: 'veiculo', label: 'Veículo', tipo: 'select', obrigatorio: true, tamanho: '1/2', opcoes: [{ id: 1, label: 'ABC-1234 - Volvo FH' }] },
          { nome: 'motoristaRelator', label: 'Motorista Relator', tipo: 'select', tamanho: '1/2', opcoes: [{ id: 1, label: 'João Silva' }] },
          { nome: 'tipoManutencao', label: 'Tipo de Manutenção', tipo: 'select', obrigatorio: true, tamanho: '1/2', opcoes: [{ id: 1, label: 'Mecânica Geral' }] },
          { nome: 'descricaoProblema', label: 'Descrição do Problema', tipo: 'textarea', obrigatorio: true, tamanho: 'full' }
        ]
      },
      {
        titulo: 'Status e Prioridade',
        campos: [
          { nome: 'prioridade', label: 'Prioridade', tipo: 'pills', tamanho: '1/3', opcoes: [{ id: 'Baixa', label: 'Baixa' }, { id: 'Normal', label: 'Normal' }, { id: 'Crítica', label: 'Crítica' }] },
          { nome: 'status', label: 'Status', tipo: 'select', tamanho: '1/3', opcoes: [{ id: 'Aberta', label: 'Aberta' }, { id: 'Em Execução', label: 'Em Execução' }, { id: 'Finalizada', label: 'Finalizada' }] },
          { nome: 'dataPrevisaoEntrega', label: 'Data de Previsão', tipo: 'date', tamanho: '1/3' }
        ]
      }
    ]
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.configFormulario.titulo = 'Editar Manutenção';
      }
    });
  }

  calcularTotal(): number {
    const totalServicos = this.listaMaoDeObra.reduce((acc, item) => acc + item.valor, 0);
    const totalProdutos = this.listaProdutos.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
    return totalServicos + totalProdutos;
  }

  adicionarServico(): void {
    if (this.novoServico.descricao && this.novoServico.valor > 0) {
      this.listaMaoDeObra.push({ ...this.novoServico });
      this.novoServico = { descricao: '', valor: null };
    }
  }

  removerServico(index: number): void {
    this.listaMaoDeObra.splice(index, 1);
  }

  adicionarProduto(): void {
    if (this.novoProduto.descricao && this.novoProduto.valorUnitario > 0 && this.novoProduto.quantidade > 0) {
      this.listaProdutos.push({ ...this.novoProduto });
      this.novoProduto = { descricao: '', quantidade: 1, valorUnitario: null };
    }
  }

  removerProduto(index: number): void {
    this.listaProdutos.splice(index, 1);
  }

  vincularChecklist(): void {
    if (this.novoChecklist) {
      this.listaChecklists.push({ nome: this.novoChecklist });
      this.novoChecklist = '';
    }
  }

  removerChecklist(index: number): void {
    this.listaChecklists.splice(index, 1);
  }

  onSalvar(dadosGerais: any): void {
    const payloadCompleto = {
      ...dadosGerais,
      maoDeObra: this.listaMaoDeObra,
      produtos: this.listaProdutos,
      checklistsVinculados: this.listaChecklists,
      valorTotal: this.calcularTotal()
    };
    
    console.log(payloadCompleto);
    this.router.navigate(['/manutencoes']);
  }

  onCancelar(): void {
    this.router.navigate(['/manutencoes']);
  }
}