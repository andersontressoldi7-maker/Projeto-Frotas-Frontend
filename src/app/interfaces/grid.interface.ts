export interface GridColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'acoes';
  filterType?: 'text' | 'number' | 'date' | 'select' | 'multi-select';
  filterOptions?: string[];
}

export interface GridFilterOption {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multi-select';
  options?: any[];
}