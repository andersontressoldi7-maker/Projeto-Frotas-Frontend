import { Injectable } from '@angular/core';

export interface VeiculoRef {
  id: number;
  placa: string;
  modelo: string;
  nroFrota?: string;
}

export interface MotoristaRef {
  id: number;
  nome: string;
}

export interface ModeloChecklistRef {
  id: number;
  nome: string;
  tipo: string;
}

@Injectable({
  providedIn: 'root'
})
export class CadastrosRapidosStore {
  veiculos: VeiculoRef[] = [
    { id: 1, nroFrota: '001', placa: 'ABC-1234', modelo: 'Volvo FH' },
    { id: 2, nroFrota: '002', placa: 'XYZ-5678', modelo: 'Mercedes Actros' },
    { id: 3, nroFrota: '003', placa: 'DEF-9012', modelo: 'Scania R440' }
  ];

  motoristas: MotoristaRef[] = [
    { id: 1, nome: 'João Silva' },
    { id: 2, nome: 'Maria Souza' },
    { id: 3, nome: 'Carlos Pereira' }
  ];

  modelos: ModeloChecklistRef[] = [
    { id: 1, nome: 'Checklist Diário Completo', tipo: 'Completo' },
    { id: 2, nome: 'Checklist Somente Saída', tipo: 'SomenteSaida' }
  ];

  obterVeiculo(id: number): VeiculoRef | undefined {
    return this.veiculos.find(v => v.id === id);
  }

  adicionarVeiculo(dados: Omit<VeiculoRef, 'id'>): VeiculoRef {
    const novo: VeiculoRef = { ...dados, id: Math.max(0, ...this.veiculos.map(v => v.id)) + 1 };
    this.veiculos.push(novo);
    return novo;
  }

  atualizarVeiculo(id: number, dados: Partial<VeiculoRef>): void {
    const indice = this.veiculos.findIndex(v => v.id === id);
    if (indice > -1) {
      this.veiculos[indice] = { ...this.veiculos[indice], ...dados, id };
    }
  }

  obterMotorista(id: number): MotoristaRef | undefined {
    return this.motoristas.find(m => m.id === id);
  }

  adicionarMotorista(dados: Omit<MotoristaRef, 'id'>): MotoristaRef {
    const novo: MotoristaRef = { ...dados, id: Math.max(0, ...this.motoristas.map(m => m.id)) + 1 };
    this.motoristas.push(novo);
    return novo;
  }

  atualizarMotorista(id: number, dados: Partial<MotoristaRef>): void {
    const indice = this.motoristas.findIndex(m => m.id === id);
    if (indice > -1) {
      this.motoristas[indice] = { ...this.motoristas[indice], ...dados, id };
    }
  }

  obterModelo(id: number): ModeloChecklistRef | undefined {
    return this.modelos.find(m => m.id === id);
  }

  adicionarModelo(dados: Omit<ModeloChecklistRef, 'id'>): ModeloChecklistRef {
    const novo: ModeloChecklistRef = { ...dados, id: Math.max(0, ...this.modelos.map(m => m.id)) + 1 };
    this.modelos.push(novo);
    return novo;
  }

  atualizarModelo(id: number, dados: Partial<ModeloChecklistRef>): void {
    const indice = this.modelos.findIndex(m => m.id === id);
    if (indice > -1) {
      this.modelos[indice] = { ...this.modelos[indice], ...dados, id };
    }
  }
}
