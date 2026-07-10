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
  selector: 'app-checklist-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ToastsComponent],
  templateUrl: './checklist-wizard.component.html',
  styleUrls: ['./checklist-wizard.component.scss']
})
export class ChecklistWizardComponent implements OnInit {
  private readonly chaveRascunho = 'rascunho-checklist-wizard';

  faseAtual: 'saida' | 'retorno' = 'saida';
  passoAtual = 1;

  motorista = {
    nome: 'João Silva',
    id: 'MOT-001'
  };

  formulario = {
    modelo: '',
    veiculo: '',
    kmAtual: '',
    observacaoSaida: '',
    kmRetorno: '',
    observacaoRetorno: ''
  };

  get veiculos() {
    return this.store.veiculos;
  }

  get modelos() {
    return this.store.modelos;
  }

  itensChecklistSaida = this.criarItensChecklist();
  itensChecklistRetorno = this.criarItensChecklist();

  itemAberto: any = null;
  observacaoItem: string = '';
  abaAtiva: 'preenchimento' | 'tempo' = 'preenchimento';

  tempoPreenchimento = {
    aberturaSaida: '07:10',
    encerramentoSaida: '07:24',
    aberturaRetorno: '18:40',
    encerramentoRetorno: '18:58',
    tempoSaidaMinutos: 14,
    tempoRetornoMinutos: 18,
    tempoTotalMinutos: 32
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private store: CadastrosRapidosStore,
    private rascunhoService: RascunhoService
  ) {}

  ngOnInit(): void {
    const rascunho = this.rascunhoService.obter<typeof this.formulario>(this.chaveRascunho);
    if (rascunho) {
      this.formulario = { ...this.formulario, ...rascunho };
      this.rascunhoService.limpar(this.chaveRascunho);
    } else if (!this.formulario.veiculo && this.veiculos[0]) {
      this.formulario.veiculo = this.veiculos[0].id.toString();
    }

    this.route.queryParams.subscribe(params => {
      if (params['retornoCampo'] && params['retornoId']) {
        (this.formulario as any)[params['retornoCampo']] = params['retornoId'];
      }
    });
  }

  irParaCadastro(tipo: 'veiculo' | 'modelo', modo: 'novo' | 'editar', event?: Event): void {
    event?.preventDefault();

    const rota = tipo === 'veiculo' ? '/veiculos' : '/modelos';
    const idAtual = tipo === 'veiculo' ? this.formulario.veiculo : this.formulario.modelo;

    if (modo === 'editar' && !idAtual) {
      this.toastService.warning(`Selecione um ${tipo === 'veiculo' ? 'veículo' : 'modelo'} antes de editar.`, 'Atenção');
      return;
    }

    this.rascunhoService.salvar(this.chaveRascunho, this.formulario);

    const destino = modo === 'novo' ? `${rota}/novo` : `${rota}/${idAtual}/editar`;
    this.router.navigate([destino], { queryParams: { retorno: this.router.url.split('?')[0], campo: tipo } });
  }

  private criarItensChecklist(): any[] {
    return [
      { id: 1, nome: 'Estado dos Pneus', tipo: 'pills', valor: '', obrigatoriaFoto: true, temFoto: false, respostas: ['Bom', 'Regular', 'Ruim'] },
      { id: 2, nome: 'Nível de Combustível', tipo: 'pills', valor: '', obrigatoriaFoto: false, temFoto: false, respostas: ['Reserva', '1/4', '1/2', '3/4', 'Cheio'] },
      { id: 3, nome: 'Iluminação Frontal', tipo: 'pills', valor: '', obrigatoriaFoto: true, temFoto: false, respostas: ['Bom', 'Regular', 'Ruim'] },
      { id: 4, nome: 'Iluminação Traseira', tipo: 'pills', valor: '', obrigatoriaFoto: true, temFoto: false, respostas: ['Bom', 'Regular', 'Ruim'] },
      { id: 5, nome: 'Espelhos Retrovisores', tipo: 'pills', valor: '', obrigatoriaFoto: false, temFoto: false, respostas: ['Bom', 'Regular', 'Ruim'] },
      { id: 6, nome: 'Freios', tipo: 'pills', valor: '', obrigatoriaFoto: false, temFoto: false, respostas: ['Bom', 'Regular', 'Ruim'] }
    ];
  }

  mudarFase(fase: 'saida' | 'retorno'): void {
    this.faseAtual = fase;
    this.passoAtual = 1;
  }

  eModeloCompleto(): boolean {
    const modeloSelecionado = this.modelos.find(m => m.id.toString() === this.formulario.modelo);
    return modeloSelecionado?.tipo === 'Completo';
  }

  eModeloSimples(): boolean {
    const modeloSelecionado = this.modelos.find(m => m.id.toString() === this.formulario.modelo);
    return modeloSelecionado?.tipo === 'Simples' || modeloSelecionado?.tipo === 'SomenteSaida' || modeloSelecionado?.tipo === 'Somente Saída';
  }

  formatarTempo(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}min`;
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

  validarPasso(): boolean {
    if (this.faseAtual === 'saida') {
      if (this.passoAtual === 1) {
        return this.formulario.modelo !== '' && this.formulario.veiculo !== '' && this.formulario.kmAtual !== '';
      }
      if (this.passoAtual === 2) {
        return this.itensChecklistSaida.every(item => item.valor !== '');
      }
    } else if (this.faseAtual === 'retorno') {
      if (this.eModeloCompleto()) {
        return this.formulario.kmRetorno !== '' && this.itensChecklistRetorno.every(item => item.valor !== '');
      }
      return this.formulario.kmRetorno !== '';
    }
    return true;
  }

  selecionarResposta(item: any, resposta: string): void {
    item.valor = resposta;
  }

  abrirFotoItem(item: any): void {
    this.itemAberto = item;
    const input = document.getElementById('foto-input') as HTMLInputElement;
    input?.click();
  }

  aoSelecionarFoto(evento: any): void {
    if (this.itemAberto && evento.target.files.length > 0) {
      this.itemAberto.temFoto = true;
    }
  }

  abrirObservacaoItem(item: any): void {
    this.itemAberto = item;
    this.observacaoItem = '';
  }

  salvarObservacao(): void {
    if (this.itemAberto) {
      this.itemAberto.observacao = this.observacaoItem;
      this.itemAberto = null;
    }
  }

  finalizarSaida(): void {
    const modeloEhSimples = this.eModeloSimples();
    
    console.log('Saída finalizada:', {
      status: modeloEhSimples ? 'Concluído' : 'Em Andamento',
      motorista: this.motorista,
      modeloSelecionado: this.formulario.modelo,
      veiculo: this.formulario.veiculo,
      kmSaida: this.formulario.kmAtual,
      itensSaida: this.itensChecklistSaida
    });

    this.router.navigate(['/checklists']);
  }

  finalizarRetorno(): void {
    console.log('Retorno finalizado e checklist fechado:', {
      status: 'Concluído',
      kmRetorno: this.formulario.kmRetorno,
      observacaoRetorno: this.formulario.observacaoRetorno,
      itensRetorno: this.itensChecklistRetorno
    });

    this.router.navigate(['/checklists']);
  }

  cancelar(): void {
    this.router.navigate(['/checklists']);
  }
}