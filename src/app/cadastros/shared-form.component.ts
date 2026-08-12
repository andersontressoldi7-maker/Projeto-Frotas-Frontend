import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  tamanho?: 'full' | '1/2' | '1/3' | '2/3';
  helpText?: string;
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
  imports: [CommonModule, FormsModule],
  templateUrl: './shared-form.component.html',
  styleUrls: ['./shared-form.component.scss']
})
export class SharedFormComponent {
  @Input() config!: FormConfig;
  @Input() dadosFormulario: any = {};
  @Input() funcaoValidacaoExtra?: () => boolean;
  @Output() salvar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

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

  isCampoValido(campo: FormCampo): boolean {
    const val = this.dadosFormulario[campo.nome];
    if (campo.validacao) {
      try {
        return campo.validacao(val);
      } catch {
        return false;
      }
    }

    if (campo.obrigatorio) {
      if (val === null || val === undefined) return false;
      if (typeof val === 'string' && val.trim() === '') return false;
    }

    return true;
  }

  validarFormulario(): boolean {
    if (!this.config || !this.config.secoes) return true;

    for (const secao of this.config.secoes) {
      for (const campo of secao.campos) {
        if (!this.isCampoValido(campo)) return false;
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

  alternarToggle(nomeCampo: string): void {
    if (this.dadosFormulario && typeof this.dadosFormulario[nomeCampo] === 'boolean') {
      this.dadosFormulario[nomeCampo] = !this.dadosFormulario[nomeCampo];
    }
  }

  onSalvar(): void {
    if (this.validarFormulario()) {
      this.salvar.emit(this.dadosFormulario);
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
