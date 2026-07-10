# 📁 Estrutura de Cadastros - Frotas Frontend

## Organização

```
src/app/
├── cadastros/                          ← Pasta dos formulários de cadastro
│   ├── checklist-wizard/
│   │   ├── checklist-wizard.component.ts
│   │   ├── checklist-wizard.component.html
│   │   └── checklist-wizard.component.scss
│   │
│   ├── manutencoes-form/
│   │   └── manutencoes-form.component.ts   (usa SharedFormComponent)
│   │
│   ├── viagens-form/
│   │   ├── viagens-form.component.ts
│   │   ├── viagens-form.component.html
│   │   └── viagens-form.component.scss
│   │
│   └── shared-form.component.ts        ← Componente base reutilizável
│
├── pages/
│   ├── checklists/
│   │   ├── checklists.component.ts     ← Listagem
│   │   └── ...
│   ├── viagens/
│   │   ├── viagens.component.ts        ← Listagem
│   │   └── ...
│   ├── manutencoes/
│   │   ├── manutencoes.component.ts    ← Listagem
│   │   └── ...
│   └── ...
│
└── services/
    ├── checklist.service.ts
    ├── viagens.service.ts
    ├── manutencoes.service.ts
    └── referencias.service.ts
```

## Componentes

### 1. **SharedFormComponent** (Base Reutilizável)
Componente genérico de formulário que aceita configuração de campos.

**Localização**: `src/app/cadastros/shared-form.component.ts`

**Tipos de campos suportados**:
- `text`, `email`, `tel`, `number`, `date`, `time`, `datetime-local`
- `textarea`
- `select`
- `pills` (seleção com botões)
- `currency` (com R$)
- `checkbox`, `radio`

**Exemplo de uso**:
```typescript
FormConfig = {
  titulo: 'Nova Manutenção',
  secoes: [
    {
      titulo: 'Informações',
      campos: [
        { nome: 'veiculo', label: 'Veículo', tipo: 'select', obrigatorio: true }
      ]
    }
  ]
}
```

---

### 2. **Checklist Wizard** (Específico)
Formulário wizard com 3 passos para motoristas preencherem vistoria.

**Localização**: `src/app/cadastros/checklist-wizard/`

**Passos**:
1. **Abertura**: Motorista, Veículo, KM, Observação
2. **Itens**: Cards com pills de respostas + Câmera + Observações
3. **Fechamento**: KM Retorno + Observação + Gera manutenções automáticas

**Rotas**:
- `GET /checklists/novo` → Novo checklist
- `GET /checklists/:id/editar` → Editar checklist

---

### 3. **Manutenções Form** (Usa SharedForm)
Formulário simples para criação de manutenções.

**Localização**: `src/app/cadastros/manutencoes-form/`

**Campos**:
- Origem, Veículo, Motorista Relator
- Descrição, Tipo, Prioridade (pills), Status, Data Previsão

**Rotas**:
- `GET /manutencoes/novo` → Nova manutenção
- `GET /manutencoes/:id/editar` → Editar manutenção

---

### 4. **Viagens Form** (Com Tabs)
Formulário com 2 abas para viagens.

**Localização**: `src/app/cadastros/viagens-form/`

**Aba 1 - Dados Principais**:
- Veículo, Motorista, Origem, Destino
- Data/Hora Saída, Previsão Chegada, KM Inicial, Status

**Aba 2 - Custos**:
- Valor Frete, Adiantamento, Resumo Automático
- Observações Gerais

**Rotas**:
- `GET /viagens/novo` → Nova viagem
- `GET /viagens/:id/editar` → Editar viagem

---

## Atalhos de Cadastro Rápido (F8/F9)

Nas telas onde há seleção de um cadastro relacionado (Veículo, Motorista, Modelo de Checklist), o campo de seleção tem um atalho de teclado que abre a tela real de cadastro (não um modal) sem perder o preenchimento em andamento:

- **F9** → Novo (abre `/veiculos/novo`, `/motoristas/novo` ou `/modelos/novo`, dependendo do campo focado).
- **F8** → Editar o registro atualmente selecionado nesse campo (abre `/veiculos/:id/editar` etc.). Se nada estiver selecionado, mostra um aviso pedindo para selecionar antes.

Os atalhos ficam no próprio `<select>` (`(keydown.F9)` / `(keydown.F8)`), então valem quando o campo está focado. Cada campo também tem botões visíveis "Novo (F9)" / "Editar (F8)" para quem não usa o teclado.

**Como o retorno funciona**: ao acionar o atalho, a tela de origem salva um rascunho do formulário (`RascunhoService`, via `sessionStorage`) e navega para a tela de cadastro real passando `?retorno=<rota original>&campo=<nome do campo>`. Depois de salvar, a tela de cadastro (Veículo/Motorista/Modelo) navega de volta para `retorno` com `?retornoCampo=<campo>&retornoId=<novoId>`. A tela de origem restaura o rascunho e aplica o novo id no campo certo — nenhum outro dado já preenchido é perdido.

**Fonte compartilhada dos dados**: `src/app/services/cadastros-rapidos.store.ts` (`CadastrosRapidosStore`) guarda as listas de veículos, motoristas e modelos em memória. As telas de listagem/seleção (Checklist Wizard, Viagens Form, Abastecimento Wizard) leem dessa store, e as telas de cadastro reais (Veículos, Motoristas, Modelos) escrevem nela ao salvar — por isso um registro criado fica disponível para seleção imediatamente em qualquer tela que o utilize.

**Telas com o atalho aplicado**: Checklist Wizard (Veículo, Modelo), Viagens Form (Veículo, Motorista), Abastecimento Wizard (Veículo, Motorista).

---

## Roteamento

```typescript
/checklists                 ← Listagem
/checklists/novo           ← Novo (Wizard)
/checklists/:id/editar     ← Editar (Wizard)

/manutencoes               ← Listagem
/manutencoes/novo          ← Novo (Form)
/manutencoes/:id/editar    ← Editar (Form)

/viagens                   ← Listagem
/viagens/novo              ← Novo (Form com Tabs)
/viagens/:id/editar        ← Editar (Form com Tabs)
```

---

## Services

### ChecklistService
```typescript
listar()
obter(id)
criar(data)
atualizar(id, data)
excluir(id)
```

### ViagensService
```typescript
listar()
obter(id)
criar(data)
atualizar(id, data)
excluir(id)
```

### ManutencoesService
```typescript
listar()
obter(id)
criar(data)
atualizar(id, data)
excluir(id)
```

### ReferenciasService
```typescript
listarVeiculos()
listarMotoristas()
listarTiposManutencao()
obterVeiculo(id)
obterMotorista(id)
```

---

## Padrões de Design

### ✅ Mobile-First
- Todos os formulários são responsivos
- Breakpoints: 768px (tablet), 1024px (desktop)

### ✅ Design System
- Primária: #40916c (Verde)
- Perigo: #dc3545 (Vermelho)
- Cards: border-radius 12px
- Inputs: border-radius 8px
- Animações: 0.2-0.3s ease

### ✅ Sem Comentários em Código
- Código limpo e autodescritivo
- Variáveis em português

### ✅ Validações
- Campos obrigatórios marcados com *
- Validação em tempo real
- Botões desabilitados até preencher

---

## Integração com API

Todos os services fazem requisições para:
- `GET /api/checklists` → Listar
- `POST /api/checklists` → Criar
- `PUT /api/checklists/:id` → Atualizar
- `DELETE /api/checklists/:id` → Excluir

---

## Próximos Passos

1. ✅ Criar interfaces TypeScript para tipagem forte
2. ✅ Adicionar HTTPClientModule em app.config
3. ⏳ Integrar com API real
4. ⏳ Adicionar validações de negócio
5. ⏳ Implementar masks em moeda
6. ⏳ Toast notifications
7. ⏳ Tratamento de erros

---

## Como Usar

### Novo Formulário (Usando SharedForm)
```typescript
import { SharedFormComponent, FormConfig } from '@cadastros/shared-form.component';

@Component({
  imports: [SharedFormComponent]
})
export class MyFormComponent {
  config: FormConfig = { /* ... */ };
  formData = {};
  
  onSalvar(dados: any) { }
  onCancelar() { }
}
```

### Novo Formulário Específico
Crie em `src/app/cadastros/novo-form/` com estrutura própria sem depender de SharedForm.

---

**Estrutura criada em 6 de junho de 2026**
