<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0
Change Type: MINOR (new principle section added)

Modified Principles: None
Added Sections:
  - VI. Requisitos Tecnológicos (Technology Stack Requirements)
Removed Sections: None

Templates Requiring Updates:
  ✅ plan-template.md - reviewed, constitution check section compatible
  ✅ spec-template.md - reviewed, no changes needed
  ✅ tasks-template.md - reviewed, no changes needed

Follow-up TODOs: None
Rationale: Added minimum technology stack requirements (JavaScript, Node.js, CSS,
Tailwind CSS, shadcn/ui) as new constitutional principle to standardize tooling
and dependencies across all projects.
-->

# Static Application Constitution

## Core Principles

### I. Security-First

- **Credential Management**: Nunca armazenar credenciais em código ou repositório
- **Variáveis de Ambiente**: Todas as credenciais e configurações sensíveis via variáveis de ambiente
- **Validação de Entrada**: Validar e sanitizar todas as entradas antes de queries ao banco
- **Princípio do Menor Privilégio**: Conexões com BD devem ter apenas permissões necessárias

### II. Performance e Cache

- **Cache-First**: Implementar cache para dados raramente alterados
- **Lazy Loading**: Carregar dados sob demanda quando possível
- **Bundle Optimization**: Minimizar e otimizar assets estáticos
- **CDN Ready**: Estrutura de arquivos preparada para distribuição via CDN

### III. Resiliência e Fallback

- **Tratamento de Erros**: Tratamento gracioso de falhas de conexão com cloud DB
- **Retry Logic**: Implementar retry com backoff exponencial para operações críticas
- **Fallback para Dados Estáticos**: Quando possível, manter cópia local/cache para fallback
- **Timeout Configuration**: Definir timeouts apropriados para todas as operações de rede

### IV. Dados Estáticos e Build

- **Build Determinístico**: Processo de build deve ser reproduzível
- **Pré-processamento**: Dados estáticos devem ser processados em build time quando possível
- **Versionamento de Schema**: Manter controle de versão de schemas de BD estáticos
- **Separação de Ambiente**: Configurações distintas para dev/staging/production

### V. Simplicidade e Manutenibilidade

- **YAGNI**: Implementar apenas o necessário
- **Documentação Clara**: Documentar conexões, schemas e configurações necessárias
- **Estrutura de Pastas Padrão**: Seguir convenções para fácil navegação
- **Dependencies Mínimas**: Evitar dependências desnecessárias

### VI. Requisitos Tecnológicos

- **JavaScript**: Linguagem primária para desenvolvimento (ES2020+)
- **Node.js**: Runtime para backend e tooling (versão LTS ativa, mínimo v18.x)
- **CSS + Tailwind CSS**: Estilização usando Tailwind CSS v3+ como framework utilitário
- **shadcn/ui**: Biblioteca de componentes para interfaces consistentes e acessíveis
- **Gestão de Pacotes**: npm ou pnpm para gerenciamento de dependências
- **TypeScript**: Fortemente recomendado para type safety (exceto em casos justificados)
- **Tooling Mínimo**: ESLint para linting, Prettier para formatação
- **Build Tools**: Vite, Next.js, ou ferramentas modernas equivalentes conforme arquitetura

**Rationale**: Padronizar stack tecnológica garante consistência, reduz curva de
aprendizado, facilita manutenção, e permite reutilização de componentes e padrões
entre projetos. A escolha de ferramentas modernas e bem suportadas minimiza débito
técnico e maximiza produtividade.

## Governance

A constituição substitui todas as outras práticas. Qualquer exceção deve ser:

- Documentada com justificativa clara
- Aprovada pelo time técnico
- Temporária com plano de migração

Toda mudança em código deve verificar compliance com estes princípios. Complexidade
adicional requer justificativa técnica sólida.

**Version**: 1.1.0 | **Ratified**: 2025-11-24 | **Last Amended**: 2025-11-24
