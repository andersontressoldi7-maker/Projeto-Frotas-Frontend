import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ToastsComponent } from '../../components/toasts.component';
import { ToastService } from '../../components/toast.service';
import { CadastrosRapidosStore } from '../../services/cadastros-rapidos.store';
import { RascunhoService } from '../../services/rascunho.service';
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
  imports: [CommonModule, FormsModule, SidebarComponent, ToastsComponent],
  templateUrl: './viagens-form.component.html',
  styleUrls: ['./viagens-form.component.scss']
})
export class ViagensFormComponent implements OnInit {
  private readonly chaveRascunho = 'rascunho-viagens-form';

  modoEdicao = false;
  abaSelecionada = 'dados';
  abaCustosSelecionada = 'fretes';

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
    observacoesGerais: '',
    fretes: [] as ViagemFreteItem[],
    despesas: [] as ViagemDespesaItem[],
    abastecimentos: [] as ViagemAbastecimentoItem[]
  };

  freteAtual: ViagemFreteItem = { descricao: '', valor: '', origem: '', destino: '', data: '', observacao: '' };
  despesaAtual: ViagemDespesaItem = { tipo: '', valor: '', pagador: 'motorista', observacao: '' };
  abastecimentoAtual: ViagemAbastecimentoItem = { data: '', local: '', tipo: 'Interno', combustivel: '', quantidadeLitros: '', valor: '', observacao: '' };

  get veiculos() {
    return this.store.veiculos;
  }

  get motoristas() {
    return this.store.motoristas;
  }

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
    private store: CadastrosRapidosStore,
    private rascunhoService: RascunhoService
  ) {}

  ngOnInit(): void {
    this.tiposDespesa = this.carregarTiposDespesa();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
      }
    });

    const rascunho = this.rascunhoService.obter<typeof this.formulario>(this.chaveRascunho);
    if (rascunho) {
      this.formulario = { ...this.formulario, ...rascunho };
      this.rascunhoService.limpar(this.chaveRascunho);
    }

    this.route.queryParams.subscribe(params => {
      if (params['retornoCampo'] && params['retornoId']) {
        (this.formulario as any)[params['retornoCampo']] = params['retornoId'];
      }
    });
  }

  irParaCadastro(tipo: 'veiculo' | 'motorista', modo: 'novo' | 'editar', event?: Event): void {
    event?.preventDefault();

    const rota = tipo === 'veiculo' ? '/veiculos' : '/motoristas';
    const idAtual = tipo === 'veiculo' ? this.formulario.veiculo : this.formulario.motorista;

    if (modo === 'editar' && !idAtual) {
      this.toastService.warning(`Selecione um ${tipo === 'veiculo' ? 'veículo' : 'motorista'} antes de editar.`, 'Atenção');
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

    this.formulario.abastecimentos.push({ ...this.abastecimentoAtual });
    this.abastecimentoAtual = { data: '', local: '', tipo: 'Interno', combustivel: '', quantidadeLitros: '', valor: '', observacao: '' };
  }

  removerAbastecimento(index: number): void {
    this.formulario.abastecimentos.splice(index, 1);
  }

  carregarTiposDespesa(): string[] {
    try {
      const salvo = localStorage.getItem('tipos-despesas');
      if (salvo) {
        const dados = JSON.parse(salvo) as Array<{ nome: string }>;
        return dados.map(item => item.nome);
      }
    } catch {}

    return ['Alimentação', 'Pedágio', 'Hospedagem'];
  }

  onSalvar(): void {
    if (this.validarFormulario()) {
      console.log('Salvando viagem:', this.formulario);
      this.router.navigate(['/viagens']);
    }
  }

  onCancelar(): void {
    this.router.navigate(['/viagens']);
  }

  validarFormulario(): boolean {
    return (
      this.formulario.veiculo !== '' &&
      this.formulario.motorista !== '' &&
      this.formulario.origem.trim() !== '' &&
      this.formulario.destino.trim() !== '' &&
      this.formulario.dataSaida !== '' &&
      this.formulario.horaSaida !== ''
    );
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
}
