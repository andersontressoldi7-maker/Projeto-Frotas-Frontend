import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridColumn, GridFilterOption } from '../../interfaces/grid.interface';

@Component({
  selector: 'app-shared-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shared-grid.component.html',
  styleUrls: ['./shared-grid.component.scss']
})
export class SharedGridComponent implements OnInit {
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

  filterOptions: GridFilterOption[] = [];
  activeFilters: { option: GridFilterOption }[] = [];
  currentFiltersModel: { [key: string]: any } = {};
  isFilterExpanded: boolean = false;

  ngOnInit(): void {
    this.generateFiltersFromColumns();
  }

  generateFiltersFromColumns(): void {
    this.filterOptions = this.columns
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
          options = this.extractUniqueValues(col.key);
        }

        return { key: col.key, label: col.label, type, options };
      });
  }

  extractUniqueValues(key: string): string[] {
    const values = this.data.map(item => item[key]).filter(val => val !== undefined && val !== null && val !== '');
    return [...new Set(values)].map(val => String(val));
  }

  toggleFilters(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  getAvailableFilters(): GridFilterOption[] {
    return this.filterOptions.filter(opt => !this.activeFilters.some(f => f.option.key === opt.key));
  }

  addFilter(option: GridFilterOption): void {
    this.activeFilters.push({ option });
    this.currentFiltersModel[option.key] = option.type === 'multi-select' ? [] : '';
    this.applyFilters();
  }

  removeFilter(index: number, key: string): void {
    this.activeFilters.splice(index, 1);
    delete this.currentFiltersModel[key];
    this.applyFilters();
  }

  toggleMultiSelectValue(key: string, value: string): void {
    const currentValues: string[] = this.currentFiltersModel[key] || [];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    
    this.currentFiltersModel[key] = [...currentValues];
    this.applyFilters();
  }

  isMultiSelectChecked(key: string, value: string): boolean {
    return (this.currentFiltersModel[key] || []).includes(value);
  }

  clearAllFilters(): void {
    this.activeFilters = [];
    this.currentFiltersModel = {};
    this.applyFilters();
  }

  applyFilters(): void {
    this.filterApplied.emit(this.currentFiltersModel);
  }
}