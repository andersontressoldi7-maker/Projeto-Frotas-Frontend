import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';
import { DialogService } from '../../components/dialog/dialog.service';
import { MotoristasService } from '../../services/motoristas.service';

export interface DocumentoMotorista {
  id: number;
  tipo: 'CNH' | 'Curso' | 'Exame';
  titulo: string;
  descricao: string;
  dataEmissao: string;
  dataVencimento: string;
  obrigatorio: boolean;
  membros: string;
  anexo: string;
  anexoUrl?: string;
  status: string;
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
    private motoristasService: MotoristasService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.retornoUrl = params['retorno'] || null;
      this.retornoCampo = params['campo'] || null;
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.config.titulo = 'Editar Motorista';

        this.motoristasService.obter(this.idEmEdicao).subscribe({
          next: (motorista) => {
            this.formulario = {
              nome: motorista.nome,
              cnh: motorista.cnh,
              validade: motorista.validade_cnh,
              telefone: motorista.telefone
            };
          },
          error: () => this.toastService.error('Não foi possível carregar o motorista.', 'Erro')
        });

        this.carregarDocumentos();
      } else {
        this.modoEdicao = false;
        this.config.titulo = 'Novo Motorista';
        this.formulario = { nome: '', cnh: '', validade: '', telefone: '' };
      }
    });
  }

  private carregarDocumentos(): void {
    if (this.idEmEdicao === null) {
      return;
    }

    this.motoristasService.listarDocumentos(this.idEmEdicao).subscribe({
      next: (documentos) => this.documentos = documentos.map(doc => this.mapearDocumento(doc)),
      error: () => this.toastService.error('Não foi possível carregar os documentos.', 'Erro')
    });
  }

  private mapearDocumento(doc: any): DocumentoMotorista {
    return {
      id: doc.id,
      tipo: doc.tipo,
      titulo: doc.titulo,
      descricao: doc.descricao,
      dataEmissao: doc.data_emissao,
      dataVencimento: doc.data_vencimento,
      obrigatorio: doc.obrigatorio,
      membros: doc.membros,
      anexo: doc.anexo,
      anexoUrl: doc.anexo_url,
      status: doc.status
    };
  }

  get documentosFiltrados(): DocumentoMotorista[] {
    return this.documentos.filter(item => !this.filtroStatus || item.status === this.filtroStatus);
  }

  documentosFiltradosPorTipo(tipo: DocumentoMotorista['tipo']): DocumentoMotorista[] {
    return this.documentosFiltrados.filter(item => item.tipo === tipo);
  }

  get proximosVencimento(): number {
    return this.documentos.filter(item => item.status === 'Próximo do vencimento').length;
  }

  get vencidos(): number {
    return this.documentos.filter(item => item.status === 'Vencido').length;
  }

  onSalvar(dados: any): void {
    if (!this.canSave()) {
      this.toastService.error('Preencha o nome do motorista antes de salvar.', 'Erro');
      return;
    }

    const payload = {
      nome: dados.nome,
      cnh: dados.cnh,
      validade_cnh: dados.validade,
      telefone: dados.telefone
    };

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.motoristasService.atualizar(this.idEmEdicao, payload)
      : this.motoristasService.criar(payload);

    requisicao.subscribe({
      next: (motorista) => {
        this.toastService.success('Motorista salvo com sucesso.', 'Sucesso');

        if (this.retornoUrl && this.retornoCampo) {
          this.router.navigate([this.retornoUrl], { queryParams: { retornoCampo: this.retornoCampo, retornoId: motorista.id } });
        } else if (!this.modoEdicao) {
          this.router.navigate(['/motoristas', motorista.id, 'editar']);
        } else {
          this.router.navigate(['/motoristas']);
        }
      },
      error: (erro) => this.toastService.error(erro?.error?.message || 'Não foi possível salvar o motorista.', 'Erro')
    });
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
    if (this.idEmEdicao === null) {
      this.toastService.error('Salve o motorista antes de adicionar documentos.', 'Erro');
      return;
    }

    if (!this.novoDocumento.titulo.trim() || !this.novoDocumento.dataVencimento) {
      this.toastService.error('Informe o título e a data de vencimento do documento.', 'Erro');
      return;
    }

    this.motoristasService.salvarDocumento(this.idEmEdicao, this.novoDocumento).subscribe({
      next: () => {
        this.toastService.success('Documento adicionado ao controle.', 'Sucesso');
        this.carregarDocumentos();
        this.limparNovoDocumento();
      },
      error: (erro) => this.toastService.error(erro?.error?.message || 'Não foi possível salvar o documento.', 'Erro')
    });
  }

  async excluirDocumento(id: number): Promise<void> {
    if (this.idEmEdicao === null) {
      return;
    }

    const confirmado = await this.dialogService.confirmar('Deseja excluir este documento?', 'Excluir documento');
    if (!confirmado) {
      return;
    }

    this.motoristasService.excluirDocumento(this.idEmEdicao, id).subscribe({
      next: () => {
        this.toastService.success('Documento excluído.', 'Sucesso');
        this.carregarDocumentos();
      },
      error: () => this.toastService.error('Não foi possível excluir o documento.', 'Erro')
    });
  }

  limparNovoDocumento(): void {
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
    this.filtroStatus = '';
  }

  obterStatusDocumento(documento: DocumentoMotorista): string {
    return documento.status;
  }

  obterClasseStatus(documento: DocumentoMotorista): string {
    const status = documento.status;

    if (status === 'Vencido') {
      return 'bg-danger-subtle text-danger';
    }

    if (status === 'Próximo do vencimento') {
      return 'bg-warning-subtle text-warning';
    }

    return 'bg-success-subtle text-success';
  }
}
