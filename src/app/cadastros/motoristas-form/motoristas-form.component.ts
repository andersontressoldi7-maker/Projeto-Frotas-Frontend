import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastsComponent } from '../../components/toasts.component';
import { ToastService } from '../../components/toast.service';
import { CadastrosRapidosStore } from '../../services/cadastros-rapidos.store';
import { calcularStatusDocumento } from './documentos.utils';

export interface DocumentoMotorista {
  id: number;
  motoristaId: string;
  tipo: 'CNH' | 'Curso' | 'Exame';
  titulo: string;
  descricao: string;
  dataEmissao: string;
  dataVencimento: string;
  obrigatorio: boolean;
  membros: string;
  anexo: string;
  anexoUrl?: string;
}

export interface NovoDocumentoMotorista {
  tipo: 'CNH' | 'Curso' | 'Exame';
  titulo: string;
  descricao: string;
  dataEmissao: string;
  dataVencimento: string;
  obrigatorio: boolean;
  membros: string;
  anexo: string;
  anexoUrl?: string;
}

@Component({
  selector: 'app-motoristas-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, SharedFormComponent, ToastsComponent],
  template: `
    <app-sidebar></app-sidebar>
    <app-toasts></app-toasts>
    <div class="dashboard-wrapper">
      <main class="content-layout">
        <div class="container-fluid p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 class="h4 fw-bold mb-1">{{ config.titulo }}</h2>
              <p class="text-muted mb-0">{{ config.subtitulo }}</p>
            </div>
          </div>

          <div class="tabs-wrapper mb-4">
            <button class="tab-btn" [class.active]="abaAtiva === 'dados'" (click)="abaAtiva = 'dados'">
              Dados cadastrais
            </button>
            <button class="tab-btn" [class.active]="abaAtiva === 'controle'" (click)="abaAtiva = 'controle'">
              Controle de documentos
            </button>
          </div>

          <div *ngIf="abaAtiva === 'dados'">
            <app-shared-form [config]="config" [formData]="formulario" [extraValidationFn]="canSave" (salvar)="onSalvar($event)" (cancelar)="onCancelar()"></app-shared-form>
          </div>

          <div *ngIf="abaAtiva === 'controle'" class="controle-docs">
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body">
                    <p class="text-muted small mb-1">Total de documentos</p>
                    <h3 class="fw-bold mb-0">{{ documentos.length }}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body">
                    <p class="text-muted small mb-1">Próximos do vencimento</p>
                    <h3 class="fw-bold mb-0 text-warning">{{ proximosVencimento }}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body">
                    <p class="text-muted small mb-1">Vencidos</p>
                    <h3 class="fw-bold mb-0 text-danger">{{ vencidos }}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 class="fw-bold mb-1">Adicionar documento</h5>
                    <p class="text-muted small mb-0">Cadastre exames, cursos e vencimentos da CNH.</p>
                  </div>
                </div>

                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label">Tipo</label>
                    <select class="form-control" [(ngModel)]="novoDocumento.tipo">
                      <option value="CNH">CNH</option>
                      <option value="Curso">Curso</option>
                      <option value="Exame">Exame</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Título</label>
                    <input class="form-control" type="text" [(ngModel)]="novoDocumento.titulo" placeholder="Ex.: Curso de NR 10" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Data de emissão</label>
                    <input class="form-control" type="date" [(ngModel)]="novoDocumento.dataEmissao" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Vencimento</label>
                    <input class="form-control" type="date" [(ngModel)]="novoDocumento.dataVencimento" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-control" rows="3" [(ngModel)]="novoDocumento.descricao" placeholder="Informações adicionais"></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Membros / responsável</label>
                    <input class="form-control" type="text" [(ngModel)]="novoDocumento.membros" placeholder="Ex.: equipe de RH" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Anexo / documento real</label>
                    <input class="form-control" type="text" [(ngModel)]="novoDocumento.anexo" placeholder="Nome do arquivo ou link" />
                    <input class="form-control mt-2" type="file" (change)="onArquivoSelecionado($event)" />
                    <small class="text-muted d-block mt-2" *ngIf="novoDocumento.anexoUrl">
                      Documento vinculado: <a [href]="novoDocumento.anexoUrl" target="_blank" rel="noopener noreferrer">Abrir arquivo</a>
                    </small>
                  </div>
                  <div class="col-md-6 d-flex align-items-end">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="novoDocumento.obrigatorio" id="checklistObrigatorio" />
                      <label class="form-check-label" for="checklistObrigatorio">Checklist obrigatório</label>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-end mt-4 gap-2">
                  <button *ngIf="documentoEmEdicaoId !== null" class="btn btn-outline-secondary" (click)="cancelarEdicaoDocumento()">Cancelar edição</button>
                  <button class="btn btn-success" (click)="salvarDocumento()">
                    {{ documentoEmEdicaoId !== null ? 'Salvar alterações' : 'Adicionar documento' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="tabs-wrapper mb-4">
              <button class="tab-btn" [class.active]="abaDocumentos === 'cnh'" (click)="abaDocumentos = 'cnh'">CNH</button>
              <button class="tab-btn" [class.active]="abaDocumentos === 'cursos'" (click)="abaDocumentos = 'cursos'">Cursos</button>
              <button class="tab-btn" [class.active]="abaDocumentos === 'exames'" (click)="abaDocumentos = 'exames'">Exames</button>
            </div>

            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="row g-3 align-items-end mb-3">
                  <div class="col-md-5">
                    <label class="form-label">Motorista</label>
                    <select class="form-control" [(ngModel)]="filtroMotorista">
                      <option value="">Todos</option>
                      <option *ngFor="let motorista of motoristasDisponiveis" [value]="motorista.id">{{ motorista.nome }}</option>
                    </select>
                  </div>
                  <div class="col-md-5">
                    <label class="form-label">Situação</label>
                    <select class="form-control" [(ngModel)]="filtroStatus">
                      <option value="">Todas</option>
                      <option value="Vencido">Vencidos</option>
                      <option value="Próximo do vencimento">Próximos do vencimento</option>
                      <option value="Válido">Válidos</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <button class="btn btn-outline-secondary w-100" (click)="limparFiltros()">Limpar</button>
                  </div>
                </div>

                <div *ngIf="abaDocumentos === 'cnh'">
                  <h5 class="fw-bold mb-3">CNH</h5>
                  <div class="table-responsive">
                    <table class="table align-middle">
                      <thead>
                        <tr>
                          <th>Documento</th>
                          <th>Vencimento</th>
                          <th>Status</th>
                          <th>Checklist</th>
                          <th>Membros</th>
                          <th>Anexo</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let item of documentosFiltradosPorTipo('CNH')">
                          <td>
                            <strong>{{ item.titulo }}</strong>
                            <div class="text-muted small">{{ item.descricao }}</div>
                          </td>
                          <td>{{ item.dataVencimento | date:'dd/MM/yyyy' }}</td>
                          <td>
                            <span class="badge" [ngClass]="obterClasseStatus(item)">{{ obterStatusDocumento(item) }}</span>
                          </td>
                          <td>{{ item.obrigatorio ? 'Obrigatório' : 'Opcional' }}</td>
                          <td>{{ item.membros || '—' }}</td>
                          <td>
                            <span *ngIf="item.anexo; else semAnexo">{{ item.anexo }}</span>
                            <ng-template #semAnexo>—</ng-template>
                          </td>
                          <td>
                            <div class="d-flex gap-2">
                              <button class="btn btn-sm btn-outline-primary" (click)="editarDocumento(item)">Editar</button>
                              <button class="btn btn-sm btn-outline-danger" (click)="excluirDocumento(item.id)">Excluir</button>
                            </div>
                          </td>
                        </tr>
                        <tr *ngIf="!documentosFiltradosPorTipo('CNH').length">
                          <td colspan="7" class="text-muted text-center">Nenhuma CNH cadastrada para os filtros aplicados.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div *ngIf="abaDocumentos === 'cursos'">
                  <h5 class="fw-bold mb-3">Cursos</h5>
                  <div class="table-responsive">
                    <table class="table align-middle">
                      <thead>
                        <tr>
                          <th>Documento</th>
                          <th>Vencimento</th>
                          <th>Status</th>
                          <th>Checklist</th>
                          <th>Membros</th>
                          <th>Anexo</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let item of documentosFiltradosPorTipo('Curso')">
                          <td>
                            <strong>{{ item.titulo }}</strong>
                            <div class="text-muted small">{{ item.descricao }}</div>
                          </td>
                          <td>{{ item.dataVencimento | date:'dd/MM/yyyy' }}</td>
                          <td>
                            <span class="badge" [ngClass]="obterClasseStatus(item)">{{ obterStatusDocumento(item) }}</span>
                          </td>
                          <td>{{ item.obrigatorio ? 'Obrigatório' : 'Opcional' }}</td>
                          <td>{{ item.membros || '—' }}</td>
                          <td>
                            <span *ngIf="item.anexo; else semAnexo">{{ item.anexo }}</span>
                            <ng-template #semAnexo>—</ng-template>
                          </td>
                          <td>
                            <div class="d-flex gap-2">
                              <button class="btn btn-sm btn-outline-primary" (click)="editarDocumento(item)">Editar</button>
                              <button class="btn btn-sm btn-outline-danger" (click)="excluirDocumento(item.id)">Excluir</button>
                            </div>
                          </td>
                        </tr>
                        <tr *ngIf="!documentosFiltradosPorTipo('Curso').length">
                          <td colspan="7" class="text-muted text-center">Nenhum curso cadastrado para os filtros aplicados.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div *ngIf="abaDocumentos === 'exames'">
                  <h5 class="fw-bold mb-3">Exames</h5>
                  <div class="table-responsive">
                    <table class="table align-middle">
                      <thead>
                        <tr>
                          <th>Documento</th>
                          <th>Vencimento</th>
                          <th>Status</th>
                          <th>Checklist</th>
                          <th>Membros</th>
                          <th>Anexo</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let item of documentosFiltradosPorTipo('Exame')">
                          <td>
                            <strong>{{ item.titulo }}</strong>
                            <div class="text-muted small">{{ item.descricao }}</div>
                          </td>
                          <td>{{ item.dataVencimento | date:'dd/MM/yyyy' }}</td>
                          <td>
                            <span class="badge" [ngClass]="obterClasseStatus(item)">{{ obterStatusDocumento(item) }}</span>
                          </td>
                          <td>{{ item.obrigatorio ? 'Obrigatório' : 'Opcional' }}</td>
                          <td>{{ item.membros || '—' }}</td>
                          <td>
                            <span *ngIf="item.anexo; else semAnexo">{{ item.anexo }}</span>
                            <ng-template #semAnexo>—</ng-template>
                          </td>
                          <td>
                            <div class="d-flex gap-2">
                              <button class="btn btn-sm btn-outline-primary" (click)="editarDocumento(item)">Editar</button>
                              <button class="btn btn-sm btn-outline-danger" (click)="excluirDocumento(item.id)">Excluir</button>
                            </div>
                          </td>
                        </tr>
                        <tr *ngIf="!documentosFiltradosPorTipo('Exame').length">
                          <td colspan="7" class="text-muted text-center">Nenhum exame cadastrado para os filtros aplicados.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .tabs-wrapper {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      border: 1px solid #d8e0dc;
      background: #fff;
      color: #3f4d4a;
      border-radius: 999px;
      padding: 0.6rem 1rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .tab-btn.active {
      background: #40916c;
      color: #fff;
      border-color: #40916c;
    }

    .controle-docs .card {
      border-radius: 14px;
    }

    .table td,
    .table th {
      vertical-align: middle;
    }
  `]
})
export class MotoristasFormComponent implements OnInit {
  modoEdicao = false;
  idEmEdicao: number | null = null;
  retornoUrl: string | null = null;
  retornoCampo: string | null = null;
  abaAtiva: 'dados' | 'controle' = 'dados';
  abaDocumentos: 'cnh' | 'cursos' | 'exames' = 'cnh';

  formulario: any = {
    nome: '',
    cnh: '',
    validade: '',
    telefone: ''
  };

  novoDocumento: NovoDocumentoMotorista = {
    tipo: 'CNH',
    titulo: '',
    descricao: '',
    dataEmissao: '',
    dataVencimento: '',
    obrigatorio: true,
    membros: '',
    anexo: '',
    anexoUrl: ''
  };

  documentos: DocumentoMotorista[] = [];
  documentoEmEdicaoId: number | null = null;
  motoristasDisponiveis: Array<{ id: string; nome: string }> = [];
  filtroMotorista = '';
  filtroStatus = '';

  config: FormConfig = {
    titulo: 'Novo Motorista',
    subtitulo: 'Cadastro de motoristas',
    secoes: [
      {
        titulo: 'Dados Pessoais',
        campos: [
          { nome: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, tamanho: 'full' },
          { nome: 'cnh', label: 'CNH', tipo: 'text', tamanho: '1/2' },
          { nome: 'validade', label: 'Validade CNH', tipo: 'date', tamanho: '1/2' },
          { nome: 'telefone', label: 'Telefone', tipo: 'text', tamanho: '1/2' }
        ]
      }
    ]
  };

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

    this.motoristasDisponiveis = [
      { id: '1', nome: 'Fulano Mock' },
      { id: '2', nome: 'Maria Souza' }
    ];

    this.documentos = [
      {
        id: 1,
        motoristaId: '1',
        tipo: 'CNH',
        titulo: 'CNH',
        descricao: 'Validade da habilitação principal',
        dataEmissao: '2024-01-15',
        dataVencimento: '2026-12-20',
        obrigatorio: true,
        membros: 'Operação',
        anexo: 'cnh.pdf'
      },
      {
        id: 2,
        motoristaId: '1',
        tipo: 'Curso',
        titulo: 'Curso de transporte seguro',
        descricao: 'Reciclagem anual obrigatória',
        dataEmissao: '2025-02-10',
        dataVencimento: '2026-08-12',
        obrigatorio: true,
        membros: 'Treinamento',
        anexo: 'curso-seguro.pdf'
      },
      {
        id: 3,
        motoristaId: '2',
        tipo: 'Exame',
        titulo: 'Exame toxicológico',
        descricao: 'Vencimento trimestral',
        dataEmissao: '2026-06-01',
        dataVencimento: '2026-07-20',
        obrigatorio: true,
        membros: 'Saúde',
        anexo: 'exame-toxico.pdf'
      }
    ];

    this.route.params.subscribe(params => {
      const motoristaId = params['id'] || '1';
      this.filtroMotorista = motoristaId;

      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.config.titulo = 'Editar Motorista';
        const existente = this.store.obterMotorista(this.idEmEdicao);
        const mock = existente || this.motoristasDisponiveis.find(item => item.id === motoristaId) || { id: motoristaId, nome: 'Fulano Mock' };
        this.formulario = {
          nome: mock.nome,
          cnh: '123456',
          validade: '2027-01-01',
          telefone: '61999999999'
        };
      } else {
        this.modoEdicao = false;
        this.config.titulo = 'Novo Motorista';
        this.formulario = { nome: '', cnh: '', validade: '', telefone: '' };
      }
    });
  }

  get documentosFiltrados(): DocumentoMotorista[] {
    return this.documentos.filter(item => {
      const motoristasOk = !this.filtroMotorista || item.motoristaId === this.filtroMotorista;
      const statusOk = !this.filtroStatus || this.obterStatusDocumento(item) === this.filtroStatus;
      return motoristasOk && statusOk;
    });
  }

  documentosFiltradosPorTipo(tipo: DocumentoMotorista['tipo']): DocumentoMotorista[] {
    return this.documentosFiltrados.filter(item => item.tipo === tipo);
  }

  get proximosVencimento(): number {
    return this.documentos.filter(item => this.obterStatusDocumento(item) === 'Próximo do vencimento').length;
  }

  get vencidos(): number {
    return this.documentos.filter(item => this.obterStatusDocumento(item) === 'Vencido').length;
  }

  onSalvar(dados: any): void {
    if (!this.canSave()) {
      this.toastService.error('Preencha o nome do motorista antes de salvar.', 'Erro');
      return;
    }

    this.formulario.controleDocumentos = this.documentos;

    let idSalvo: number;
    if (this.modoEdicao && this.idEmEdicao !== null) {
      this.store.atualizarMotorista(this.idEmEdicao, { nome: dados.nome });
      idSalvo = this.idEmEdicao;
    } else {
      const novo = this.store.adicionarMotorista({ nome: dados.nome });
      idSalvo = novo.id;
    }

    this.toastService.success('Motorista salvo com sucesso.', 'Sucesso');

    if (this.retornoUrl && this.retornoCampo) {
      setTimeout(() => this.router.navigate([this.retornoUrl], { queryParams: { retornoCampo: this.retornoCampo, retornoId: idSalvo } }), 300);
    } else {
      setTimeout(() => this.router.navigate(['/motoristas']), 300);
    }
  }

  onCancelar(): void {
    if (this.retornoUrl) {
      this.router.navigate([this.retornoUrl]);
    } else {
      this.router.navigate(['/motoristas']);
    }
  }

  canSave = (): boolean => {
    return !!(this.formulario && this.formulario.nome && this.formulario.nome.trim().length > 0);
  }

  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    if (!arquivo) {
      return;
    }

    this.novoDocumento.anexo = arquivo.name;
    this.novoDocumento.anexoUrl = URL.createObjectURL(arquivo);
  }

  salvarDocumento(): void {
    if (!this.novoDocumento.titulo.trim() || !this.novoDocumento.dataVencimento) {
      this.toastService.error('Informe o título e a data de vencimento do documento.', 'Erro');
      return;
    }

    const documento: DocumentoMotorista = {
      id: this.documentoEmEdicaoId ?? Date.now(),
      motoristaId: this.filtroMotorista || '1',
      tipo: this.novoDocumento.tipo,
      titulo: this.novoDocumento.titulo,
      descricao: this.novoDocumento.descricao,
      dataEmissao: this.novoDocumento.dataEmissao,
      dataVencimento: this.novoDocumento.dataVencimento,
      obrigatorio: this.novoDocumento.obrigatorio,
      membros: this.novoDocumento.membros,
      anexo: this.novoDocumento.anexo,
      anexoUrl: this.novoDocumento.anexoUrl
    };

    if (this.documentoEmEdicaoId !== null) {
      this.documentos = this.documentos.map(item => item.id === this.documentoEmEdicaoId ? documento : item);
      this.toastService.success('Documento atualizado.', 'Sucesso');
    } else {
      this.documentos.unshift(documento);
      this.toastService.success('Documento adicionado ao controle.', 'Sucesso');
    }

    this.cancelarEdicaoDocumento();
  }

  editarDocumento(documento: DocumentoMotorista): void {
    this.documentoEmEdicaoId = documento.id;
    this.novoDocumento = {
      tipo: documento.tipo,
      titulo: documento.titulo,
      descricao: documento.descricao,
      dataEmissao: documento.dataEmissao,
      dataVencimento: documento.dataVencimento,
      obrigatorio: documento.obrigatorio,
      membros: documento.membros,
      anexo: documento.anexo,
      anexoUrl: documento.anexoUrl || ''
    };
    this.abaAtiva = 'controle';
  }

  excluirDocumento(id: number): void {
    const confirmado = window.confirm('Deseja excluir este documento?');
    if (!confirmado) {
      return;
    }

    this.documentos = this.documentos.filter(item => item.id !== id);
    this.toastService.success('Documento excluído.', 'Sucesso');
  }

  cancelarEdicaoDocumento(): void {
    this.documentoEmEdicaoId = null;
    this.novoDocumento = {
      tipo: 'CNH',
      titulo: '',
      descricao: '',
      dataEmissao: '',
      dataVencimento: '',
      obrigatorio: true,
      membros: '',
      anexo: '',
      anexoUrl: ''
    };
  }

  limparFiltros(): void {
    this.filtroMotorista = this.route.snapshot.params['id'] || '';
    this.filtroStatus = '';
  }

  obterStatusDocumento(documento: DocumentoMotorista): string {
    return calcularStatusDocumento(documento.dataVencimento);
  }

  obterClasseStatus(documento: DocumentoMotorista): string {
    const status = this.obterStatusDocumento(documento);

    if (status === 'Vencido') {
      return 'bg-danger-subtle text-danger';
    }

    if (status === 'Próximo do vencimento') {
      return 'bg-warning-subtle text-warning';
    }

    return 'bg-success-subtle text-success';
  }
}
