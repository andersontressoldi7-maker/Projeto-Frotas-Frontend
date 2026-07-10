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
  template: `
    <div class="form-wrapper">
      <div class="form-header">
        <div>
          <h2 class="h4 fw-bold mb-1">{{ config.titulo }}</h2>
          <p *ngIf="config.subtitulo" class="text-muted small mb-0">{{ config.subtitulo }}</p>
        </div>
        <button class="btn btn-outline-secondary btn-sm" (click)="onCancelar()">
          <i class="bi bi-x-lg"></i> Cancelar
        </button>
      </div>

      <div class="form-container">
        <div *ngFor="let secao of config.secoes" class="card border-0 shadow-sm mb-3">
          <div class="card-body p-4">
            <h5 class="card-title mb-4">{{ secao.titulo }}</h5>
            
            <div class="form-row">
              <div *ngFor="let campo of secao.campos" [ngClass]="obterClasseTamanho(campo)">
                <div class="form-group">
                  <label class="form-label" [class.required]="campo.obrigatorio">
                    {{ campo.label }}
                  </label>

                  <input 
                    *ngIf="['text', 'email', 'tel', 'number', 'date', 'time', 'datetime-local'].includes(campo.tipo)"
                    [type]="campo.tipo"
                    class="form-control"
                    [(ngModel)]="formData[campo.nome]"
                    [placeholder]="campo.placeholder || ''"
                    [readOnly]="campo.readOnly || false"
                    [required]="campo.obrigatorio || false">

                  <div *ngIf="campo.obrigatorio && !isCampoValido(campo)" class="text-danger small mt-1">
                    {{ campo.mensagemErro || (campo.label + ' é obrigatório.') }}
                  </div>

                  <textarea 
                    *ngIf="campo.tipo === 'textarea'"
                    class="form-control"
                    [(ngModel)]="formData[campo.nome]"
                    [placeholder]="campo.placeholder || ''"
                    rows="4"
                    [required]="campo.obrigatorio || false"></textarea>

                  <div *ngIf="campo.obrigatorio && !isCampoValido(campo) && campo.tipo === 'textarea'" class="text-danger small mt-1">
                    {{ campo.mensagemErro || (campo.label + ' é obrigatório.') }}
                  </div>

                  <select 
                    *ngIf="campo.tipo === 'select'"
                    class="form-control"
                    [(ngModel)]="formData[campo.nome]"
                    [required]="campo.obrigatorio || false">
                    <option value="">Selecione...</option>
                    <option *ngFor="let opt of campo.opcoes" [value]="opt.id">{{ opt.label }}</option>
                  </select>
                  <div *ngIf="campo.obrigatorio && !isCampoValido(campo) && campo.tipo === 'select'" class="text-danger small mt-1">
                    {{ campo.mensagemErro || (campo.label + ' é obrigatório.') }}
                  </div>

                  <div 
                    *ngIf="campo.tipo === 'pills'"
                    class="pills-container">
                    <button 
                      *ngFor="let opt of campo.opcoes"
                      type="button"
                      class="pill-btn"
                      [class.ativo]="formData[campo.nome] === opt.id"
                      (click)="formData[campo.nome] = opt.id">
                      {{ opt.label }}
                    </button>
                  </div>

                  <div 
                    *ngIf="campo.tipo === 'currency'"
                    class="input-group">
                    <span class="input-group-text">R$</span>
                    <input 
                      type="number"
                      class="form-control"
                      [(ngModel)]="formData[campo.nome]"
                      [placeholder]="campo.placeholder || '0,00'"
                      step="0.01"
                      min="0"
                      [required]="campo.obrigatorio || false">
                  </div>

                  <label 
                    *ngIf="campo.tipo === 'checkbox'"
                    class="checkbox-label">
                    <input 
                      type="checkbox"
                      [(ngModel)]="formData[campo.nome]">
                    <span>{{ campo.label }}</span>
                  </label>

                  <div *ngIf="campo.tipo === 'toggle'" class="toggle-wrapper">
                    <button type="button" class="toggle-switch" [class.active]="!!formData[campo.nome]" (click)="alternarToggle(campo.nome)">
                      <span class="toggle-knob"></span>
                    </button>
                    <span class="toggle-label">{{ campo.label }}</span>
                  </div>

                  <small *ngIf="campo.helpText" class="text-muted d-block mt-2">
                    {{ campo.helpText }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-light border" (click)="onCancelar()">
          {{ config.botaoCancelLabel || 'Cancelar' }}
        </button>
        <button 
          class="btn btn-success"
          (click)="onSalvar()"
          [disabled]="!validarFormulario()">
          <i class="bi bi-check-circle"></i> 
          {{ config.botaoPrincipalLabel || (config.modoEdicao ? 'Atualizar' : 'Criar') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 2rem;

      .btn {
        flex-shrink: 0;
      }
    }

    .form-container {
      margin-bottom: 2rem;

      .card {
        border-radius: 12px;
        border: 1px solid #e0e0e0 !important;
      }

      .card-title {
        font-weight: 600;
        color: #333;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;

      &.row-2col {
        grid-template-columns: repeat(2, 1fr);
      }

      &.row-3col {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-weight: 500;
      color: #333;
      font-size: 0.95rem;

      &.required::after {
        content: ' *';
        color: #dc3545;
      }
    }

    .form-control,
    .input-group-text {
      border-radius: 8px;
      border: 1px solid #ddd;
      transition: all 0.2s;

      &:focus {
        border-color: #40916c;
        box-shadow: 0 0 0 3px rgba(64, 145, 108, 0.1);
      }
    }

    .pills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;

      .pill-btn {
        padding: 0.5rem 1.25rem;
        border: 2px solid #ddd;
        background: white;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
          border-color: #40916c;
          color: #40916c;
        }

        &.ativo {
          background: #40916c;
          border-color: #40916c;
          color: white;
        }
      }
    }

    .input-group {
      .input-group-text {
        background: #f8f9fa;
      }
    }

    .toggle-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-height: 38px;
    }

    .toggle-switch {
      width: 48px;
      height: 28px;
      border: 0;
      border-radius: 999px;
      background: #cfd8d3;
      padding: 3px;
      position: relative;
      transition: background 0.2s ease;
      cursor: pointer;

      &.active {
        background: #40916c;
      }

      .toggle-knob {
        display: block;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        transition: transform 0.2s ease;
        transform: translateX(0);
      }

      &.active .toggle-knob {
        transform: translateX(20px);
      }
    }

    .toggle-label {
      font-weight: 500;
      color: #333;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;

      button {
        padding: 0.75rem 2rem;
        font-weight: 600;
        border-radius: 8px;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &.btn-success {
          background: #40916c;
          border-color: #40916c;

          &:hover:not(:disabled) {
            background: #2d6a52;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .form-header {
        flex-direction: column;
        gap: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr !important;
      }
    }
    @media (max-width: 576px) {
      .form-container .card-body {
        padding: 1rem !important;
      }

      .form-actions {
        flex-direction: column-reverse;
        align-items: stretch;
      }

      .form-actions button {
        width: 100%;
      }

      .form-header h2 {
        font-size: 1.1rem;
      }
    }
  `]
})
export class SharedFormComponent {
  @Input() config!: FormConfig;
  @Input() formData: any = {};
  @Input() extraValidationFn?: () => boolean;
  @Output() salvar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  obterClasseTamanho(campo: FormCampo): string {
    const tamanho = campo.tamanho || 'full';
    const map: Record<string, string> = {
      'full': 'col-12 mb-3',
      '1/2': 'col-md-6 mb-3',
      '1/3': 'col-md-4 mb-3',
      '2/3': 'col-md-8 mb-3'
    };
    return map[tamanho] || map['full'];
  }

  isCampoValido(campo: FormCampo): boolean {
    const val = this.formData[campo.nome];
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

    if (this.extraValidationFn) {
      try {
        return this.extraValidationFn();
      } catch {
        return false;
      }
    }

    return true;
  }

  alternarToggle(nomeCampo: string): void {
    if (this.formData && typeof this.formData[nomeCampo] === 'boolean') {
      this.formData[nomeCampo] = !this.formData[nomeCampo];
    }
  }

  onSalvar(): void {
    if (this.validarFormulario()) {
      this.salvar.emit(this.formData);
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
