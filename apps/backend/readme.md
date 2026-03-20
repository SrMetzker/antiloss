# Stratto - Sistema de Controle de Produtos

Este projeto é um sistema de controle de produtos para estabelecimentos, focado em prevenir perdas. Ele utiliza Node.js com Express para gerenciar operações de criação de produtos.

## Funcionalidades

### Criar Produto
- **Endpoint**: `POST /products`
- **Descrição**: Permite criar um novo produto no sistema.
- **Parâmetros obrigatórios** (no corpo da requisição JSON):
  - `name`: Nome do produto (string, obrigatório).
  - `sku`: Código SKU do produto (string, opcional).
  - `price`: Preço do produto (número, obrigatório, deve ser positivo).
  - `establishmentId`: ID do estabelecimento (obrigatório).
  - `createdBy`: ID do usuário criador (obrigatório).
- **Validações**:
  - Nome é obrigatório.
  - Preço deve ser um número válido e não negativo.
  - ID do estabelecimento e usuário criador são obrigatórios.
- **Resposta de sucesso**: Status 201 com os dados do produto criado.
- **Erros**: Retorna erros de validação com mensagens em português.

## Como Usar

1. **Instalação**:
   - Clone o repositório.
   - Execute `npm install` para instalar as dependências.

2. **Configuração**:
   - Configure as variáveis de ambiente (ex.: banco de dados, portas).

3. **Execução**:
   - Inicie o servidor com `npm start`.
   - Faça requisições para os endpoints via ferramentas como Postman ou curl.

4. **Exemplo de Requisição**:
   ```bash
   curl -X POST http://localhost:3000/products \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Produto Exemplo",
       "sku": "SKU123",
       "price": 29.99,
       "establishmentId": "estab123",
       "createdBy": "user456"
     }'