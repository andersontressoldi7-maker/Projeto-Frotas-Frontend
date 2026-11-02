import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SharedFormComponent, FormConfig } from '../shared-form.component';
import { ToastService } from '../../components/toast.service';
import { ManutencoesService } from '../../services/manutencoes.service';
import { VeiculosService } from '../../services/veiculos.service';
import { MotoristasService } from '../../services/motoristas.service';
import { TiposManutencaoService } from '../../services/tipos-manutencao.service';
import { ChecklistService } from '../../services/checklist.service';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { extrairMensagemErro } from '../../utils';

@Component({
  selector: 'app-manutencoes-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, SharedFormComponent],
  templateUrl: './manutencoes-form.component.html',
  styleUrls: ['./manutencoes-form.component.scss']
})
export class ManutencoesFormComponent implements OnInit {
  readonly validarRegrasManutencao = (): boolean =>
    !this.carregandoConfiguracoes &&
    !this.carregandoChecklists &&
    this.validarItensFinanceiros() &&
    (!this.checklistObrigatorio || this.listaChecklists.length > 0);

  modoEdicao = false;
  idEmEdicao: number | null = null;
  abaAtiva = 'geral';
  carregando = false;
  carregandoConfiguracoes = true;
  carregandoChecklists = true;
  permitirManutencaoSemChecklist = false;
  salvando = false;

  formulario: any = {
    origem: '',
    veiculo: '',
    motoristaRelator: '',
    tipoManutencao: '',
    descricaoProblema: '',
    prioridade: 'Normal',
    status: 'Aberta',
    dataPrevisaoEntrega: ''
  };

  listaMaoDeObra: any[] = [];
  novoServico = { descricao: '', valor: null as any };

  listaProdutos: any[] = [];
  novoProduto = { descricao: '', quantidade: 1, valorUnitario: null as any };

  checklistsDisponiveis: any[] = [];
  listaChecklists: any[] = [];
  novoChecklist: number | null = null;

  configFormulario: FormConfig = {
    titulo: 'Nova Manutenção',
    subtitulo: 'Gestão de manutenções e ocorrências',
    botaoPrincipalLabel: 'Salvar Tudo',
    botaoCancelLabel: 'Cancelar',
    secoes: [
      {
        titulo: 'Informações da Manutenção',
        campos: [
          { nome: 'origem', label: 'Origem', tipo: 'text', tamanho: '1/2' },
          { nome: 'veiculo', label: 'Veículo', tipo: 'select', obrigatorio: true, tamanho: '1/2', opcoes: [] },
          { nome: 'motoristaRelator', label: 'Motorista Relator', tipo: 'select', tamanho: '1/2', opcoes: [] },
          { nome: 'tipoManutencao', label: 'Tipo de Manutenção', tipo: 'select', tamanho: '1/2', opcoes: [] },
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private manutencoesService: ManutencoesService,
    private veiculosService: VeiculosService,
    private motoristasService: MotoristasService,
    private tiposManutencaoService: TiposManutencaoService,
    private checklistService: ChecklistService,
    private configuracoesService: ConfiguracoesService
  ) {}

  ngOnInit(): void {
    this.configuracoesService.carregar().subscribe({
      next: resposta => {
        const configuracao = resposta.configuracoes['permitir_manutencao_sem_checklist'];
        this.permitirManutencaoSemChecklist =
          configuracao === true || configuracao === 1 || configuracao === '1';
        this.carregandoConfiguracoes = false;
      },
      error: erro => {
        this.carregandoConfiguracoes = false;
        this.toastService.erro(
          `Não foi possível carregar as configurações de manutenção: ${extrairMensagemErro(erro)}`,
          'Erro'
        );
      }
    });

    this.veiculosService.listar().subscribe(dados => {
      this.configFormulario.secoes[0].campos[1].opcoes = dados.map(v => ({ id: v.id, label: `${v.placa} - ${v.modelo || ''}` }));
    });

    this.motoristasService.listar().subscribe(dados => {
      this.configFormulario.secoes[0].campos[2].opcoes = dados.map(m => ({ id: m.id, label: m.nome }));
    });

    this.tiposManutencaoService.listar().subscribe(dados => {
      this.configFormulario.secoes[0].campos[3].opcoes = dados.map(t => ({ id: t.id, label: t.nome }));
    });

    this.checklistService.listar().subscribe({
      next: resposta => {
        this.checklistsDisponiveis = resposta.data;
        this.carregandoChecklists = false;
      },
      error: erro => {
        this.carregandoChecklists = false;
        this.toastService.erro(
          `Não foi possível carregar os checklists disponíveis: ${extrairMensagemErro(erro)}`,
          'Erro'
        );
      }
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.configFormulario.titulo = 'Editar Manutenção';
        this.carregando = true;

        this.manutencoesService.obter(this.idEmEdicao).subscribe({
          next: (manutencao) => {
            this.formulario = {
              origem: manutencao.origem,
              veiculo: manutencao.veiculo_id,
              motoristaRelator: manutencao.motorista_relator_id,
              tipoManutencao: manutencao.tipo_manutencao_id,
              descricaoProblema: manutencao.descricao_problema,
              prioridade: manutencao.prioridade,
              status: manutencao.status,
              dataPrevisaoEntrega: manutencao.data_previsao_entrega
            };
            this.listaMaoDeObra = (manutencao.servicos || []).map((s: any) => ({ descricao: s.descricao, valor: s.valor }));
            this.listaProdutos = (manutencao.produtos || []).map((p: any) => ({ descricao: p.descricao, quantidade: p.quantidade, valorUnitario: p.valor_unitario }));
            this.listaChecklists = manutencao.checklists || [];
            this.carregando = false;
          },
          error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar a manutenção.', 'Erro'); }
        });
      }
    });
  }

  calcularTotal(): number {
    const totalServicos = this.listaMaoDeObra.reduce((acc, item) => acc + item.valor, 0);
    const totalProdutos = this.listaProdutos.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
    return totalServicos + totalProdutos;
  }

  adicionarServico(): void {
    if (!this.novoServico.descricao.trim() || !this.numeroValido(this.novoServico.valor)) {
      this.toastService.avisar('Informe a descrição do serviço e um valor maior ou igual a zero.', 'Dados inválidos');
      return;
    }

    if (this.novoServico.descricao && this.novoServico.valor !== null) {
      this.listaMaoDeObra.push({ ...this.novoServico });
      this.novoServico = { descricao: '', valor: null };
    }
  }

  removerServico(index: number): void {
    this.listaMaoDeObra.splice(index, 1);
  }

  adicionarProduto(): void {
    if (
      !this.novoProduto.descricao.trim() ||
      !this.numeroValido(this.novoProduto.quantidade, true) ||
      !this.numeroValido(this.novoProduto.valorUnitario)
    ) {
      this.toastService.avisar('Informe a descrição, quantidade maior que zero e valor não negativo.', 'Dados inválidos');
      return;
    }

    if (this.novoProduto.descricao && this.novoProduto.valorUnitario !== null) {
      this.listaProdutos.push({ ...this.novoProduto });
      this.novoProduto = { descricao: '', quantidade: 1, valorUnitario: null };
    }
  }

  removerProduto(index: number): void {
    this.listaProdutos.splice(index, 1);
  }

  vincularChecklist(): void {
    if (this.novoChecklist) {
      const checklist = this.checklistsDisponiveis.find(c => c.id === this.novoChecklist);
      if (checklist && !this.listaChecklists.some(c => c.id === checklist.id)) {
        this.listaChecklists.push(checklist);
      }
      this.novoChecklist = null;
    }
  }

  removerChecklist(index: number): void {
    this.listaChecklists.splice(index, 1);
  }

  get checklistObrigatorio(): boolean {
    return !this.permitirManutencaoSemChecklist && this.formulario.status !== 'Finalizada';
  }

  onSalvar(dadosGerais: any): void {
    if (this.salvando || this.carregandoConfiguracoes || this.carregandoChecklists) {
      return;
    }

    if (!this.validarItensFinanceiros()) {
      this.abaAtiva = 'servicos';
      this.toastService.avisar('Verifique descrições, quantidades e valores de serviços e produtos.', 'Dados inválidos');
      return;
    }

    if (this.checklistObrigatorio && this.listaChecklists.length === 0) {
      this.abaAtiva = 'checklists';
      this.toastService.avisar(
        'Vincule ao menos um checklist para abrir ou reabrir esta manutenção.',
        'Checklist obrigatório'
      );
      return;
    }

    const payload = {
      origem: dadosGerais.origem,
      veiculo_id: dadosGerais.veiculo,
      motorista_relator_id: dadosGerais.motoristaRelator || null,
      tipo_manutencao_id: dadosGerais.tipoManutencao || null,
      descricao_problema: dadosGerais.descricaoProblema,
      prioridade: dadosGerais.prioridade,
      status: dadosGerais.status,
      data_previsao_entrega: dadosGerais.dataPrevisaoEntrega || null,
      maoDeObra: this.listaMaoDeObra,
      produtos: this.listaProdutos.map(p => ({ descricao: p.descricao, quantidade: p.quantidade, valor_unitario: p.valorUnitario })),
      checklistsIds: this.listaChecklists.map(c => c.id)
    };

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.manutencoesService.atualizar(this.idEmEdicao, payload)
      : this.manutencoesService.criar(payload);

    this.salvando = true;
    requisicao.subscribe({
      next: () => {
        this.toastService.sucesso('Manutenção salva com sucesso.', 'Sucesso');
        this.router.navigate(['/manutencoes']);
      },
      error: (erro) => {
        this.salvando = false;
        this.toastService.erro(erro?.error?.message || 'Não foi possível salvar a manutenção.', 'Erro');
      }
    });
  }

  private validarItensFinanceiros(): boolean {
    return this.listaMaoDeObra.every(item =>
      Boolean(item.descricao?.trim()) && this.numeroValido(item.valor)
    ) && this.listaProdutos.every(item =>
      Boolean(item.descricao?.trim()) &&
      this.numeroValido(item.quantidade, true) &&
      this.numeroValido(item.valorUnitario)
    );
  }

  private numeroValido(valor: number | string | null, maiorQueZero = false): boolean {
    if (valor === null || valor === '') {
      return false;
    }
    const numero = Number(valor);
    return Number.isFinite(numero) && (maiorQueZero ? numero > 0 : numero >= 0);
  }

  onCancelar(): void {
    this.router.navigate(['/manutencoes']);
  }
}
