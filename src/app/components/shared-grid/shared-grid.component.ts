import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';
import { StatusColorService } from '../../services/status-color.service';

@Component({
  selector: 'app-shared-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shared-grid.component.html',
  styleUrls: ['./shared-grid.component.scss']
})
export class SharedGridComponent implements OnInit {
  constructor(private statusColorService: StatusColorService) {}

  obterClassesBadge(col: GridColumn, valor: any): string {
    return this.statusColorService.obterClasses(col.colorGroup || 'statusGenerico', String(valor));
  }

  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() primaryBtnLabel?: string;
  @Input() columns: GridColumn[] = [];
  @Input() data: any[] = [];
  @Input() emptyMessage: string = 'Nenhum registro encontrado.';

  @Output() primaryBtnClick = new EventEmitter<void>();
  @Output() filterApplied = new EventEmitter<any>();
  @Output() editClick = new EventEmitter<any>();
  @Output() deleteClick = new EventEmitter<any>();

  opcoesFiltro: GridFilterOption[] = [];
  filtrosAtivos: { option: GridFilterOption }[] = [];
  modeloFiltrosAtuais: { [key: string]: any } = {};
  modeloFiltrosAplicados: { [key: string]: any } = {};
  filtroExpandido: boolean = false;

  get dadosFiltrados(): any[] {
    const chaves = Object.keys(this.modeloFiltrosAplicados);
    if (chaves.length === 0) {
      return this.data;
    }

    return this.data.filter(row => chaves.every(key => this.linhaCorrespondeAoFiltro(row, key)));
  }

  private linhaCorrespondeAoFiltro(row: any, key: string): boolean {
    const valorFiltro = this.modeloFiltrosAplicados[key];
    const opcao = this.opcoesFiltro.find(opt => opt.key === key);
    const valorLinha = row[key];

    if (opcao?.type === 'multi-select') {
      return !Array.isArray(valorFiltro) || valorFiltro.length === 0 || valorFiltro.includes(String(valorLinha));
    }

    if (valorFiltro === '' || valorFiltro === null || valorFiltro === undefined) {
      return true;
    }

    if (opcao?.type === 'select') {
      return String(valorLinha) === String(valorFiltro);
    }

    if (opcao?.type === 'number') {
      return String(valorLinha) === String(valorFiltro);
    }

    if (opcao?.type === 'date') {
      const dataLinha = new Date(valorLinha).toDateString();
      const dataFiltro = new Date(valorFiltro).toDateString();
      return dataLinha === dataFiltro;
    }

    return String(valorLinha ?? '').toLowerCase().includes(String(valorFiltro).toLowerCase());
  }

  ngOnInit(): void {
    this.gerarFiltrosDasColunas();
  }

  gerarFiltrosDasColunas(): void {
    this.opcoesFiltro = this.columns
      .filter(col => col.key !== 'acoes')
      .map(col => {
        let type: 'text' | 'number' | 'date' | 'select' | 'multi-select' = col.filterType || 'text';
        
        if (!col.filterType) {
          if (col.type === 'number') type = 'number';
          if (col.type === 'date') type = 'date';
          if (col.type === 'badge') type = 'multi-select';
        }

        let options = col.filterOptions;
        if (!options && (type === 'select' || type === 'multi-select')) {
          options = this.extrairValoresUnicos(col.key);
        }

        return { key: col.key, label: col.label, type, options };
      });
  }

  extrairValoresUnicos(key: string): string[] {
    const values = this.data.map(item => item[key]).filter(val => val !== undefined && val !== null && val !== '');
    return [...new Set(values)].map(val => String(val));
  }

  alternarFiltros(): void {
    this.filtroExpandido = !this.filtroExpandido;
  }

  obterFiltrosDisponiveis(): GridFilterOption[] {
    return this.opcoesFiltro.filter(opt => !this.filtrosAtivos.some(f => f.option.key === opt.key));
  }

  adicionarFiltro(option: GridFilterOption): void {
    this.filtrosAtivos.push({ option });
    this.modeloFiltrosAtuais[option.key] = option.type === 'multi-select' ? [] : '';
  }

  removerFiltro(index: number, key: string): void {
    this.filtrosAtivos.splice(index, 1);
    delete this.modeloFiltrosAtuais[key];
    this.aplicarFiltros();
  }

  alternarValorMultiplo(key: string, value: string): void {
    const currentValues: string[] = this.modeloFiltrosAtuais[key] || [];
    const index = currentValues.indexOf(value);

    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }

    this.modeloFiltrosAtuais[key] = [...currentValues];
  }

  valorMultiploMarcado(key: string, value: string): boolean {
    return (this.modeloFiltrosAtuais[key] || []).includes(value);
  }

  limparFiltros(): void {
    this.filtrosAtivos = [];
    this.modeloFiltrosAtuais = {};
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.modeloFiltrosAplicados = { ...this.modeloFiltrosAtuais };
    this.filterApplied.emit(this.modeloFiltrosAtuais);
  }
}