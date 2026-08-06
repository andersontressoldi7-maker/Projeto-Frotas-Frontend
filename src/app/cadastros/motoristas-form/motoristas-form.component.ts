import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';
import { DialogService } from '../../components/dialog/dialog.service';
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
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './motoristas-form.component.html',
  styleUrls: ['./motoristas-form.component.scss']
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
    private dialogService: DialogService,
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

  async excluirDocumento(id: number): Promise<void> {
    const confirmado = await this.dialogService.confirmar('Deseja excluir este documento?', 'Excluir documento');
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
