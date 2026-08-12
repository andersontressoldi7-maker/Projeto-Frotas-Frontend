import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ToastService } from '../../components/toast.service';
import { RascunhoService } from '../../services/rascunho.service';
import { VeiculosService } from '../../services/veiculos.service';
import { MotoristasService } from '../../services/motoristas.service';
import { AbastecimentosService } from '../../services/abastecimentos.service';

@Component({
  selector: 'app-abastecimento-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './abastecimento-wizard.component.html',
  styleUrls: ['./abastecimento-wizard.component.scss']
})
export class AbastecimentoWizardComponent implements OnInit {
  private readonly chaveRascunho = 'rascunho-abastecimento-wizard';

  modoEdicao = false;
  idEmEdicao: number | null = null;
  passoAtual = 1;
  totalPassos = 3;

  formulario = {
    veiculo: '',
    motorista: '',
    dataAbastecimento: this.dataAtual(),
    tipoAbastecimento: '',
    km: '',
    combustivel: '',
    valorLitro: '',
    qtLitros: '',
    notaFiscal: '',
    fornecedor: '',
    observacao: ''
  };

  veiculos: any[] = [];
  motoristas: any[] = [];

  tiposAbastecimento = ['Interno', 'Externo'];

  combustiveis = ['Diesel S10', 'Diesel S500', 'Gasolina', 'Etanol', 'Arla 32'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private rascunhoService: RascunhoService,
    private veiculosService: VeiculosService,
    private motoristasService: MotoristasService,
    private abastecimentosService: AbastecimentosService
  ) {}

  ngOnInit(): void {
    this.veiculosService.listar().subscribe(dados => this.veiculos = dados);
    this.motoristasService.listar().subscribe(dados => this.motoristas = dados);

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicao = true;
        this.idEmEdicao = Number(params['id']);
        this.carregarAbastecimento(this.idEmEdicao);
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

  private carregarAbastecimento(id: number): void {
    this.abastecimentosService.obter(id).subscribe({
      next: (abastecimento) => {
        this.formulario = {
          veiculo: abastecimento.veiculo_id,
          motorista: abastecimento.motorista_id,
          dataAbastecimento: abastecimento.data_abastecimento,
          tipoAbastecimento: abastecimento.tipo_abastecimento,
          km: abastecimento.km,
          combustivel: abastecimento.combustivel,
          valorLitro: abastecimento.valor_litro,
          qtLitros: abastecimento.qt_litros,
          notaFiscal: abastecimento.nota_fiscal,
          fornecedor: abastecimento.fornecedor,
          observacao: abastecimento.observacao
        };
      },
      error: () => this.toastService.erro('Não foi possível carregar o abastecimento.', 'Erro')
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

  private dataAtual(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoje.getDate().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  get veiculoSelecionado(): any {
    return this.veiculos.find(v => v.id.toString() === this.formulario.veiculo);
  }

  get valorTotalCombustivel(): number {
    const valorLitro = parseFloat(this.formulario.valorLitro) || 0;
    const qtLitros = parseFloat(this.formulario.qtLitros) || 0;
    return valorLitro * qtLitros;
  }

  proximoPasso(): void {
    if (this.validarPasso()) {
      this.passoAtual++;
    }
  }

  passoAnterior(): void {
    if (this.passoAtual > 1) {
      this.passoAtual--;
    }
  }

  irParaPasso(passo: number): void {
    if (passo < this.passoAtual) {
      this.passoAtual = passo;
    }
  }

  validarPasso(): boolean {
    if (this.passoAtual === 1) {
      return this.formulario.veiculo !== '' &&
        this.formulario.motorista !== '' &&
        this.formulario.dataAbastecimento !== '' &&
        this.formulario.tipoAbastecimento !== '' &&
        this.formulario.km !== '';
    }
    if (this.passoAtual === 2) {
      return this.formulario.combustivel !== '' &&
        this.formulario.valorLitro !== '' &&
        this.formulario.qtLitros !== '';
    }
    return true;
  }

  finalizar(): void {
    if (!this.validarPasso()) {
      return;
    }

    const payload = {
      veiculo_id: this.formulario.veiculo,
      motorista_id: this.formulario.motorista || null,
      data_abastecimento: this.formulario.dataAbastecimento,
      tipo_abastecimento: this.formulario.tipoAbastecimento,
      km: this.formulario.km || null,
      combustivel: this.formulario.combustivel,
      valor_litro: this.formulario.valorLitro,
      qt_litros: this.formulario.qtLitros,
      nota_fiscal: this.formulario.notaFiscal || null,
      fornecedor: this.formulario.fornecedor || null,
      observacao: this.formulario.observacao || null
    };

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.abastecimentosService.atualizar(this.idEmEdicao, payload)
      : this.abastecimentosService.criar(payload);

    requisicao.subscribe({
      next: () => {
        this.toastService.sucesso('Abastecimento salvo com sucesso.', 'Sucesso');
        this.router.navigate(['/abastecimentos']);
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível salvar o abastecimento.', 'Erro')
    });
  }

  cancelar(): void {
    this.router.navigate(['/abastecimentos']);
  }
}
