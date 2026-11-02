import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { IaCadastroComponent } from '../../components/ia-cadastro/ia-cadastro.component';
import { ToastService } from '../../components/toast.service';
import { RascunhoService } from '../../services/rascunho.service';
import { VeiculosService } from '../../services/veiculos.service';
import { MotoristasService } from '../../services/motoristas.service';
import { TiposDespesasService } from '../../services/tipos-despesas.service';
import { ViagensService } from '../../services/viagens.service';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { extrairMensagemErro } from '../../utils';
import {
  calcularComissao,
  calcularSaldoViagem,
  calcularTotalAbastecimentos,
  calcularTotalDespesas,
  calcularTotalFretes,
  ViagemAbastecimentoItem,
  ViagemDespesaItem,
  ViagemFreteItem
} from './viagens-form.utils';

@Component({
  selector: 'app-viagens-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, IaCadastroComponent],
  templateUrl: './viagens-form.component.html',
  styleUrls: ['./viagens-form.component.scss']
})
export class ViagensFormComponent implements OnInit {
  private readonly chaveRascunho = 'rascunho-viagens-form';

  modoEdicao = false;
  idEmEdicao: number | null = null;
  abaSelecionada = 'dados';
  abaCustosSelecionada = 'fretes';
  carregando = false;
  carregandoConfiguracoes = true;
  falhaConfiguracoes = false;
  salvando = false;
  exigirBafometro = false;

  formulario = {
    veiculo: '',
    motorista: '',
    origem: '',
    destino: '',
    dataSaida: '',
    horaSaida: '',
    previsaoChegada: '',
    kmInicial: '',
    status: 'Agendada',
    tipoCarga: '',
    descricaoCarga: '',
    pesoVolume: '',
    formaPagamentoFrete: 'À vista',
    adiantamentoPago: '',
    percentualComissao: '',
    statusComissao: 'Pendente',
    testeBafometroAprovado: false,
    observacoesGerais: '',
    fretes: [] as ViagemFreteItem[],
    despesas: [] as ViagemDespesaItem[],
    abastecimentos: [] as ViagemAbastecimentoItem[]
  };

  freteAtual: ViagemFreteItem = { descricao: '', valor: '', origem: '', destino: '', data: '', observacao: '' };
  despesaAtual: ViagemDespesaItem = { tipo: '', valor: '', pagador: 'motorista', observacao: '' };
  abastecimentoAtual: ViagemAbastecimentoItem = { data: '', local: '', tipo: 'Interno', combustivel: '', quantidadeLitros: '', valor: '', observacao: '' };

  veiculos: any[] = [];
  motoristas: any[] = [];

  status = [
    { id: 'Agendada', label: 'Agendada' },
    { id: 'Em Rota', label: 'Em Rota' },
    { id: 'Finalizada', label: 'Finalizada' }
  ];

  formasPagamento = [
    { id: 'À vista', label: 'À vista' },
    { id: 'Faturado', label: 'Faturado' },
    { id: 'A combinar', label: 'A combinar' }
  ];

  statusComissao = [
    { id: 'Pendente', label: 'Pendente' },
    { id: 'Pago', label: 'Pago' },
    { id: 'Parcial', label: 'Parcial' }
  ];

  tiposCarga = [
    { id: 'Granel', label: 'Granel' },
    { id: 'Perecível', label: 'Perecível' },
    { id: 'Frágil', label: 'Frágil' },
    { id: 'Química', label: 'Química' },
    { id: 'Carga geral', label: 'Carga geral' }
  ];

  tiposDespesa: string[] = [];

  combustiveis = ['Diesel S10', 'Diesel S500', 'Gasolina', 'Etanol', 'Arla 32'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private rascunhoService: RascunhoService,
    private veiculosService: VeiculosService,
    private motoristasService: MotoristasService,
    private tiposDespesasService: TiposDespesasService,
    private viagensService: ViagensService,
    private configuracoesService: ConfiguracoesService
  ) {}

  ngOnInit(): void {
    this.configuracoesService.carregar().subscribe({
      next: resposta => {
        const configuracao = resposta.configuracoes['exigir_bafometro'];
        this.exigirBafometro = configuracao === true || configuracao === 1 || configuracao === '1';
        this.carregandoConfiguracoes = false;
      },
      error: erro => {
        this.carregandoConfiguracoes = false;
        this.falhaConfiguracoes = true;
        this.toastService.erro(
          `Não foi possível carregar as configurações de viagem: ${extrairMensagemErro(erro)}`,
          'Erro'
        );
      }
    });

    this.veiculosService.listar().subscribe(dados => this.veiculos = dados);
    this.motoristasService.listar().subscribe(dados => this.motoristas = dados);
    this.tiposDespesasService.listar().subscribe(dados => this.tiposDespesa = dados.map(t => t.nome));

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.carregarViagem(this.idEmEdicao);
        return;
      }

      const rascunho = this.rascunhoService.obter<typeof this.formulario>(this.chaveRascunho);
      if (rascunho) {
        this.formulario = { ...this.formulario, ...rascunho };
        this.rascunhoService.limpar(this.chaveRascunho);
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['retornoCampo'] && params['retornoId']) {
        (this.formulario as any)[params['retornoCampo']] = params['retornoId'];
      }
    });
  }

  private carregarViagem(id: number): void {
    this.carregando = true;
    this.viagensService.obter(id).subscribe({
      next: (viagem) => {
        this.carregando = false;
        this.formulario = {
          veiculo: viagem.veiculo_id,
          motorista: viagem.motorista_id,
          origem: viagem.origem,
          destino: viagem.destino,
          dataSaida: viagem.data_saida,
          horaSaida: viagem.hora_saida,
          previsaoChegada: this.formatarDataHoraLocal(viagem.previsao_chegada),
          kmInicial: viagem.km_inicial,
          status: viagem.status,
          tipoCarga: viagem.tipo_carga,
          descricaoCarga: viagem.descricao_carga,
          pesoVolume: viagem.peso_volume,
          formaPagamentoFrete: viagem.forma_pagamento_frete,
          adiantamentoPago: viagem.adiantamento_pago,
          percentualComissao: viagem.percentual_comissao,
          statusComissao: viagem.status_comissao,
          testeBafometroAprovado: viagem.teste_bafometro_aprovado === true ||
            viagem.teste_bafometro_aprovado === 1 ||
            viagem.teste_bafometro_aprovado === '1',
          observacoesGerais: viagem.observacoes_gerais,
          fretes: (viagem.fretes || []).map((f: any) => ({ descricao: f.descricao, valor: f.valor, origem: f.origem, destino: f.destino, data: f.data, observacao: f.observacao })),
          despesas: (viagem.despesas || []).map((d: any) => ({ tipo: d.tipo, valor: d.valor, pagador: d.pagador, observacao: d.observacao })),
          abastecimentos: (viagem.abastecimentos || []).map((a: any) => ({ data: a.data_abastecimento, local: '', tipo: a.tipo_abastecimento, combustivel: a.combustivel, quantidadeLitros: a.qt_litros, valor: a.valor_litro, observacao: a.observacao }))
        };
      },
      error: () => { this.carregando = false; this.toastService.erro('Não foi possível carregar a viagem.', 'Erro'); }
    });
  }

  irParaCadastro(tipo: 'veiculo' | 'motorista', modo: 'novo' | 'editar', event?: Event): void {
    event?.preventDefault();

    const rota = tipo === 'veiculo' ? '/veiculos' : '/motoristas';
    const idAtual = tipo === 'veiculo' ? this.formulario.veiculo : this.formulario.motorista;

    if (modo === 'editar' && !idAtual) {
      this.toastService.avisar(`Selecione um ${tipo === 'veiculo' ? 'veículo' : 'motorista'} antes de editar.`, 'Atenção');
      return;
    }

    this.rascunhoService.salvar(this.chaveRascunho, this.formulario);

    const destino = modo === 'novo' ? `${rota}/novo` : `${rota}/${idAtual}/editar`;
    this.router.navigate([destino], { queryParams: { retorno: this.router.url.split('?')[0], campo: tipo } });
  }

  selecionarAba(aba: string): void {
    this.abaSelecionada = aba;
  }

  selecionarAbaCustos(aba: 'fretes' | 'despesas'): void {
    this.abaCustosSelecionada = aba;
  }

  adicionarFrete(): void {
    if (!this.freteAtual.descricao?.trim() && !this.freteAtual.valor) {
      return;
    }

    if (!this.freteAtual.descricao.trim() ||
      this.freteAtual.valor === '' ||
      !this.numeroValido(this.freteAtual.valor)) {
      this.toastService.avisar('Informe a descrição e um valor de frete igual ou maior que zero.', 'Dados inválidos');
      return;
    }

    this.formulario.fretes.push({ ...this.freteAtual });
    this.freteAtual = { descricao: '', valor: '', origem: '', destino: '', data: '', observacao: '' };
  }

  removerFrete(index: number): void {
    this.formulario.fretes.splice(index, 1);
  }

  adicionarDespesa(): void {
    if (!this.despesaAtual.tipo?.trim() && !this.despesaAtual.valor && !this.despesaAtual.observacao?.trim()) {
      return;
    }

    if (!this.despesaAtual.tipo.trim() ||
      this.despesaAtual.valor === '' ||
      !this.numeroValido(this.despesaAtual.valor)) {
      this.toastService.avisar('Informe o tipo e um valor de despesa igual ou maior que zero.', 'Dados inválidos');
      return;
    }

    this.formulario.despesas.push({ ...this.despesaAtual });
    this.despesaAtual = { tipo: '', valor: '', pagador: 'motorista', observacao: '' };
  }

  removerDespesa(index: number): void {
    this.formulario.despesas.splice(index, 1);
  }

  adicionarAbastecimento(): void {
    if (!this.abastecimentoAtual.data && !this.abastecimentoAtual.quantidadeLitros && !this.abastecimentoAtual.valor) {
      return;
    }

    if (
      !this.abastecimentoAtual.data ||
      !this.abastecimentoAtual.combustivel ||
      !this.numeroValido(this.abastecimentoAtual.valor) ||
      !this.numeroValido(this.abastecimentoAtual.quantidadeLitros, true)
    ) {
      this.toastService.avisar('Informe data, combustível, valor não negativo e quantidade de litros maior que zero.', 'Dados inválidos');
      return;
    }

    this.formulario.abastecimentos.push({ ...this.abastecimentoAtual });
    this.abastecimentoAtual = { data: '', local: '', tipo: 'Interno', combustivel: '', quantidadeLitros: '', valor: '', observacao: '' };
  }

  removerAbastecimento(index: number): void {
    this.formulario.abastecimentos.splice(index, 1);
  }

  onSalvar(): void {
    if (this.salvando || this.carregandoConfiguracoes || this.falhaConfiguracoes || !this.validarFormulario()) {
      return;
    }

    const payload = {
      veiculo_id: this.formulario.veiculo,
      motorista_id: this.formulario.motorista,
      origem: this.formulario.origem,
      destino: this.formulario.destino,
      data_saida: this.formulario.dataSaida,
      hora_saida: this.formulario.horaSaida,
      previsao_chegada: this.formulario.previsaoChegada || null,
      km_inicial: this.formulario.kmInicial || null,
      status: this.formulario.status,
      ...(this.deveExigirBafometro
        ? { teste_bafometro_aprovado: this.formulario.testeBafometroAprovado }
        : {}),
      tipo_carga: this.formulario.tipoCarga || null,
      descricao_carga: this.formulario.descricaoCarga || null,
      peso_volume: this.formulario.pesoVolume || null,
      forma_pagamento_frete: this.formulario.formaPagamentoFrete,
      adiantamento_pago: parseFloat(this.formulario.adiantamentoPago as any) || 0,
      percentual_comissao: parseFloat(this.formulario.percentualComissao as any) || 0,
      status_comissao: this.formulario.statusComissao,
      observacoes_gerais: this.formulario.observacoesGerais || null,
      fretes: this.formulario.fretes,
      despesas: this.formulario.despesas,
      abastecimentos: this.formulario.abastecimentos.map(a => ({
        data_abastecimento: a.data,
        tipo_abastecimento: a.tipo,
        combustivel: a.combustivel,
        valor_litro: a.valor,
        qt_litros: a.quantidadeLitros,
        observacao: a.observacao
      }))
    };

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.viagensService.atualizar(this.idEmEdicao, payload)
      : this.viagensService.criar(payload);

    this.salvando = true;
    requisicao.subscribe({
      next: () => {
        this.toastService.sucesso('Viagem salva com sucesso.', 'Sucesso');
        this.router.navigate(['/viagens']);
      },
      error: (erro) => {
        this.salvando = false;
        this.toastService.erro(erro?.error?.message || 'Não foi possível salvar a viagem.', 'Erro');
      }
    });
  }

  onCancelar(): void {
    this.router.navigate(['/viagens']);
  }

  validarFormulario(): boolean {
    return (
      !this.carregandoConfiguracoes &&
      !this.falhaConfiguracoes &&
      this.formulario.veiculo !== '' &&
      this.formulario.motorista !== '' &&
      this.formulario.origem.trim() !== '' &&
      this.formulario.destino.trim() !== '' &&
      this.formulario.dataSaida !== '' &&
      this.formulario.horaSaida !== '' &&
      this.validarCamposNumericos() &&
      this.validarItensAdicionados() &&
      (!this.deveExigirBafometro || this.formulario.testeBafometroAprovado)
    );
  }

  get mensagemErroValidacao(): string | null {
    if (this.falhaConfiguracoes) {
      return 'Não foi possível carregar as configurações da empresa. Tente novamente antes de salvar.';
    }
    if (!this.formulario.veiculo || !this.formulario.motorista) {
      return 'Selecione o veículo e o motorista.';
    }
    if (!this.formulario.origem.trim() || !this.formulario.destino.trim()) {
      return 'Informe a origem e o destino da viagem.';
    }
    if (!this.formulario.dataSaida || !this.formulario.horaSaida) {
      return 'Informe a data e a hora de saída.';
    }
    if (this.formulario.kmInicial !== '' && !this.numeroValido(this.formulario.kmInicial)) {
      return 'A quilometragem inicial deve ser maior ou igual a zero.';
    }
    if (this.formulario.adiantamentoPago !== '' && !this.numeroValido(this.formulario.adiantamentoPago)) {
      return 'O adiantamento deve ser maior ou igual a zero.';
    }
    const comissao = this.formulario.percentualComissao === ''
      ? 0
      : Number(this.formulario.percentualComissao);
    if (!Number.isFinite(comissao) || comissao < 0 || comissao > 100) {
      return 'A comissão deve estar entre 0% e 100%.';
    }
    if (!this.validarItensAdicionados()) {
      return 'Confira os fretes, despesas e abastecimentos: os campos preenchidos devem estar completos e os valores não podem ser negativos.';
    }
    if (this.deveExigirBafometro && !this.formulario.testeBafometroAprovado) {
      return 'Confirme a aprovação do teste do bafômetro para iniciar a viagem.';
    }
    if (!this.validarFormulario()) {
      return 'Revise os campos da viagem antes de salvar.';
    }
    return null;
  }

  get deveExigirBafometro(): boolean {
    return this.exigirBafometro && this.formulario.status === 'Em Rota';
  }

  private validarCamposNumericos(): boolean {
    return (this.formulario.kmInicial === '' || this.numeroValido(this.formulario.kmInicial)) &&
      (this.formulario.adiantamentoPago === '' || this.numeroValido(this.formulario.adiantamentoPago)) &&
      (this.formulario.percentualComissao === '' ||
        (Number.isFinite(Number(this.formulario.percentualComissao)) &&
          Number(this.formulario.percentualComissao) >= 0 &&
          Number(this.formulario.percentualComissao) <= 100));
  }

  private validarItensAdicionados(): boolean {
    return this.formulario.fretes.every(item =>
      Boolean(item.descricao.trim()) && item.valor !== '' && this.numeroValido(item.valor)
    ) && this.formulario.despesas.every(item =>
      Boolean(item.tipo.trim()) && item.valor !== '' && this.numeroValido(item.valor)
    ) && this.formulario.abastecimentos.every(item =>
      Boolean(item.data) &&
      Boolean(item.combustivel) &&
      this.numeroValido(item.valor) &&
      this.numeroValido(item.quantidadeLitros, true)
    );
  }

  private numeroValido(valor: string | number, maiorQueZero = false): boolean {
    if (valor === '') {
      return !maiorQueZero;
    }
    const numero = Number(valor);
    return Number.isFinite(numero) && (maiorQueZero ? numero > 0 : numero >= 0);
  }

  obterValorFrete(): number {
    return calcularTotalFretes(this.formulario.fretes as ViagemFreteItem[]);
  }

  obterValorAdiantamento(): number {
    return parseFloat(this.formulario.adiantamentoPago) || 0;
  }

  obterValorDespesas(): number {
    return calcularTotalDespesas(this.formulario.despesas as ViagemDespesaItem[]);
  }

  obterValorAbastecimentos(): number {
    return calcularTotalAbastecimentos(this.formulario.abastecimentos as ViagemAbastecimentoItem[]);
  }

  obterValorComissao(): number {
    const percentual = parseFloat(this.formulario.percentualComissao) || 0;
    return calcularComissao(this.obterValorFrete(), percentual);
  }

  obterValorTotal(): number {
    return calcularSaldoViagem(
      this.obterValorFrete(),
      this.obterValorAdiantamento(),
      this.formulario.despesas as ViagemDespesaItem[],
      parseFloat(this.formulario.percentualComissao) || 0
    );
  }

  obterValorFormatado(valor: string | number): string {
    const numero = typeof valor === 'number' ? valor : parseFloat(valor) || 0;
    return numero.toFixed(2);
  }

  private formatarDataHoraLocal(valor: string | null | undefined): string {
    if (!valor) {
      return '';
    }

    if (!/(Z|[+-]\d{2}:\d{2})$/i.test(valor)) {
      return valor.replace(' ', 'T').slice(0, 16);
    }

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) {
      return '';
    }

    const doisDigitos = (parte: number): string => String(parte).padStart(2, '0');
    return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
  }
}
