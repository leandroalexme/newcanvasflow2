# CanvasFlow Design Editor

Um editor de design vetorial modular e flexível baseado em canvas para web.

## Visão Geral

O CanvasFlow Design Editor é uma ferramenta de criação de design vetorial que roda diretamente no navegador. 
Foi projetado com foco em:

- **Modularidade**: Arquitetura baseada em componentes isolados para melhor manutenção e extensibilidade
- **Performance**: Otimizado para operações em canvas com alta taxa de quadros
- **Usabilidade**: Interface intuitiva inspirada em ferramentas profissionais de design
- **Extensibilidade**: Facilidade para adicionar novos recursos e ferramentas

## Recursos Atuais

- Sistema de canvas com zoom e pan
- Criação e manipulação de formas vetoriais básicas
- Transformação de objetos (redimensionar, rotacionar, mover)
- Sistema de camadas para organização de elementos
- Painel de propriedades para edição de elementos
- Sistema de histórico de ações (desfazer/refazer)
- Atalhos de teclado para operações comuns

## Começando

### Requisitos

- Node.js 18.x ou superior
- npm 7.x ou superior

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/leandroalexme/newcanvasflow2.git
cd newcanvasflow2
```

2. Instale as dependências
```bash
npm install
```

3. Inicie o servidor de desenvolvimento
```bash
npm start
```

4. Abra o navegador em [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

O projeto segue uma filosofia de modularização estrita:

- `/src/components` - Componentes de UI e elementos da interface
- `/src/core` - Funcionalidades essenciais do editor
- `/src/hooks` - Hooks React personalizados para gerenciamento de estado e interações
- `/src/modules` - Módulos independentes que implementam funcionalidades específicas
- `/src/context` - Contextos React para compartilhamento de estado
- `/src/utils` - Funções utilitárias

## Contribuindo

Contribuições são bem-vindas! Por favor, consulte o arquivo ROADMAP.md para conhecer as direções futuras do projeto.

## Licença

[MIT](LICENSE)
