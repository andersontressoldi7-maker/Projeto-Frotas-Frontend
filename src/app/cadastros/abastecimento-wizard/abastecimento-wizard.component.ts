import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ToastsComponent } from '../../components/toasts.component';
import { ToastService } from '../../components/toast.service';
import { CadastrosRapidosStore } from '../../services/cadastros-rapidos.store';
import { RascunhoService } from '../../services/rascunho.service';

@Component({
  selector: 'app-abastecimento-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ToastsComponent],
  templateUrl: './abastecimento-wizard.component.html',
  styleUrls: ['./abastecimento-wizard.component.scss']
})
export class AbastecimentoWizardComponent implements OnInit {
  private readonly chaveRascunho = 'rascunho-abastecimento-wizard';

  modoEdicao = false;
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

  get veiculos() {
    return this.store.veiculos;
  }

  get motoristas() {
    return this.store.motoristas;
  }

  tiposAbastecimento = ['Interno', 'Externo'];

  combustiveis = ['Diesel S10', 'Diesel S500', 'Gasolina', 'Etanol', 'Arla 32'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private store: CadastrosRapidosStore,
    private rascunhoService: RascunhoService
  ) {}

  ngOnInit(): void {
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

    console.log('Abastecimento salvo:', {
      ...this.formulario,
      valorTotal: this.valorTotalCombustivel
    });

    this.router.navigate(['/abastecimentos']);
  }

  cancelar(): void {
    this.router.navigate(['/abastecimentos']);
  }
}
