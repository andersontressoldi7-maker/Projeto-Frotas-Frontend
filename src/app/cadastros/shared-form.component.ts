import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaCadastroComponent } from '../components/ia-cadastro/ia-cadastro.component';
import { DialogService } from '../components/dialog/dialog.service';

export interface FormCampo {
  nome: string;
  label: string;
  tipo: 'text' | 'email' | 'tel' | 'number' | 'date' | 'time' | 'datetime-local' | 'textarea' | 'select' | 'currency' | 'pills' | 'checkbox' | 'radio' | 'toggle';
  obrigatorio?: boolean;
  placeholder?: string;
  valor?: any;
  opcoes?: Array<{ id: any; label: string }>;
  classe?: string;
  readOnly?: boolean;
  validacao?: (valor: any) => boolean;
  mensagemErro?: string;
  min?: number;
  max?: number;
  tamanho?: 'full' | '1/2' | '1/3' | '2/3';
  helpText?: string;
  mascara?: (valor: string) => string;
  exibirSe?: (dadosFormulario: any) => boolean;
  atalhoCadastro?: { rota: string };
}

export interface FormSecao {
  titulo: string;
  campos: FormCampo[];
}

export interface FormConfig {
  titulo: string;
  subtitulo?: string;
  secoes: FormSecao[];
  botaoPrincipalLabel?: string;
  botaoCancelLabel?: string;
  modoEdicao?: boolean;
}

@Component({
  selector: 'app-shared-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IaCadastroComponent],
  templateUrl: './shared-form.component.html',
  styleUrls: ['./shared-form.component.scss']
})
export class SharedFormComponent implements OnChanges {
  constructor(private dialogService: DialogService) {}

  @Input() config!: FormConfig;
  @Input() dadosFormulario: any = {};
  @Input() funcaoValidacaoExtra?: () => boolean;
  @Input() carregando = false;
  @Input() salvando = false;
  @Output() salvar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() criarNovoCampo = new EventEmitter<{ campo: FormCampo; modo: 'novo' | 'editar' }>();

  private submissaoPendente = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salvando']?.currentValue === false) {
      this.submissaoPendente = false;
    }
  }

  obterClasseTamanho(campo: FormCampo): string {
    const tamanho = campo.tamanho || 'full';
    const mapa: Record<string, string> = {
      'full': 'col-12 mb-3',
      '1/2': 'col-md-6 mb-3',
      '1/3': 'col-md-4 mb-3',
      '2/3': 'col-md-8 mb-3'
    };
    return mapa[tamanho] || mapa['full'];
  }

  exibirCampo(campo: FormCampo): boolean {
    return !campo.exibirSe || campo.exibirSe(this.dadosFormulario);
  }

  isCampoValido(campo: FormCampo): boolean {
    const val = this.dadosFormulario[campo.nome];
    const vazio = val === null || val === undefined || (typeof val === 'string' && val.trim() === '');

    if (campo.obrigatorio && vazio) {
      return false;
    }

    if (vazio) {
      return true;
    }

    if (campo.tipo === 'number' || campo.tipo === 'currency') {
      const numero = Number(val);
      if (!Number.isFinite(numero)) {
        return false;
      }
      const minimo = campo.min ?? 0;
      if (numero < minimo) {
        return false;
      }
      if (campo.max !== undefined && numero > campo.max) {
        return false;
      }
    }

    if (campo.tipo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim())) {
      return false;
    }

    if (campo.validacao) {
      try {
        return campo.validacao(val);
      } catch {
        return false;
      }
    }

    return true;
  }

  mensagemErroCampo(campo: FormCampo): string {
    if (campo.mensagemErro) {
      return campo.mensagemErro;
    }

    const valor = this.dadosFormulario[campo.nome];
    if (valor === null || valor === undefined || (typeof valor === 'string' && !valor.trim())) {
      return `${campo.label} é obrigatório.`;
    }
    if (campo.tipo === 'email') {
      return 'Informe um email válido.';
    }
    if (campo.tipo === 'number' || campo.tipo === 'currency') {
      if (campo.max !== undefined && Number(valor) > campo.max) {
        return `${campo.label} deve ser no máximo ${campo.max}.`;
      }
      return `${campo.label} deve ser maior ou igual a ${campo.min ?? 0}.`;
    }
    return `Informe um valor válido para ${campo.label.toLocaleLowerCase('pt-BR')}.`;
  }

  validarFormulario(): boolean {
    if (!this.config || !this.config.secoes) return true;

    for (const secao of this.config.secoes) {
      for (const campo of secao.campos) {
        if (this.exibirCampo(campo) && !this.isCampoValido(campo)) return false;
      }
    }

    if (this.funcaoValidacaoExtra) {
      try {
        return this.funcaoValidacaoExtra();
      } catch {
        return false;
      }
    }

    return true;
  }

  onCriarNovoCampo(campo: FormCampo, modo: 'novo' | 'editar'): void {
    this.criarNovoCampo.emit({ campo, modo });
  }

  onCampoAlterado(campo: FormCampo, valor: any): void {
    this.dadosFormulario[campo.nome] = campo.mascara ? campo.mascara(valor) : valor;
  }

  alternarToggle(nomeCampo: string): void {
    if (this.dadosFormulario && typeof this.dadosFormulario[nomeCampo] === 'boolean') {
      this.dadosFormulario[nomeCampo] = !this.dadosFormulario[nomeCampo];
    }
  }

  onSalvar(): void {
    if (this.salvando || this.submissaoPendente || !this.validarFormulario()) {
      return;
    }

    this.submissaoPendente = true;
    this.salvar.emit(this.dadosFormulario);
  }

  async onCancelar(): Promise<void> {
    if (await this.dialogService.confirmarSaida()) {
      this.cancelar.emit();
    }
  }
}
