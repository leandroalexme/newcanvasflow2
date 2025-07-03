# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Features
- Planejamento para implementação de rich text editor com Fabric.js
- Preparação para migração do sistema de canvas para Fabric.js

### Changes
- **(673dafe)** Refatoração completa da estrutura do projeto para melhor organização e modularidade
  - Reorganização de componentes em diretórios estruturados
  - Migração de utilitários para o diretório `/core`
  - Criação de diretório `/modules` para funcionalidades específicas
  - Implementação de contextos React para gerenciamento de estado

### Previous Changes

#### Features
- **(2c2dc2c)** Add shortcut to duplicate elements by dragging with Cmd/Ctrl.
- **(a68b669)** Improve selection logic and bounding box precision.

#### Fixes
- **(a7975fd)** Maintain handle rotation when rotating multiple objects.
- **(f8c0cf3)** Correct selection box rotation after group transform.
- **(0d17142)** Ensure ellipse radiusX/Y changes are tracked in history.

#### Refactor
- **(8c40150)** Remove element duplication functionality.
