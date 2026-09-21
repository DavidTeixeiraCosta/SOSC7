# Chip7 Informática - Sistema de Gestão de Ordens de Serviço (OS)

Sistema completo e profissional para assistência técnica, controle de ordens de serviço, clientes, equipamentos, orçamentos, impressão A4 completa, envio de WhatsApp e integração com Google Drive e backups locais.

---

## 🚀 Como Baixar e Executar nas suas Máquinas (Passo a Passo)

### 1. Pré-requisito (Único)
Você só precisa ter o **Node.js** instalado no computador:
- Se ainda não tiver, acesse: [https://nodejs.org](https://nodejs.org)
- Baixe e instale a versão **LTS** (Recomendada). Basta avançar no instalador padrão (*Next, Next, Finish*).

---

### 2. Baixando o Projeto
- No Google AI Studio, clique no menu superior direito (ícone de engrenagem ou menu de opções) e selecione **"Export"** -> **"Download as ZIP"** (ou clone pelo GitHub).
- Extraia o arquivo ZIP em uma pasta de sua preferência no seu computador (por exemplo: `C:\Chip7OS` ou `Área de Trabalho\Chip7OS`).

---

### 3. Instalando as Dependências (Apenas na 1ª vez)
1. Abra a pasta onde você descompactou os arquivos.
2. No Windows:
   - Clique na barra de endereço da pasta, digite `cmd` e aperte **Enter** (ou clique com botão direito e abra o Terminal/PowerShell).
3. Execute o comando:
   ```bash
   npm install
   ```
   *Aguarde alguns segundos até que todas as bibliotecas necessárias sejam baixadas.*

---

### 4. Iniciando o Sistema
Para abrir e usar o programa no dia a dia, execute no terminal:
```bash
npm run dev
```
O terminal exibirá um link local:
👉 `http://localhost:3000`

Basta abrir esse endereço no seu navegador favorito (Google Chrome, Edge, Brave, etc.).

> **💡 Dica Pro:** Crie um atalho na sua Área de Trabalho com o link `http://localhost:3000` para abrir o sistema em um clique!

---

### 5. Como Gerar Versão Otimizada de Produção (Opcional)
Se preferir rodar em modo de produção rápido e leve:
```bash
npm run build
npm run start
```

---

## 🛠️ Principais Recursos e Funcionalidades

1. **📄 Nova OS a partir do Histórico do Cliente:**
   - Ao consultar qualquer cliente pelo botão **"Do cliente"**, basta clicar na Ordem de Serviço anterior ou no botão **"Copiar p/ Nova OS"**.
   - O sistema abrirá imediatamente a tela de cadastro de Nova OS já com o nome, telefone, CPF, endereço e dados do equipamento (Notebook, Celular, Marca, Modelo, Serial, Senha) preenchidos!

2. **🖨️ Impressão A4 Completa e Perfeita:**
   - Ao clicar em **"Imprimir"**, o sistema gera 1 folha A4 completa, sem cortes, idêntica ao modelo oficial da assistência.
   - Contém cabeçalho Chip7 com logotipo, identificação da OS, dados do cliente, aparelho, senha, defeito relatado, laudo técnico, tabela de peças e serviços discriminados, prazos de garantia (Art. 26 do CDC) e campos formais para assinatura do cliente e da empresa.
   - Compatível com qualquer impressora e com salvamento direto em PDF.

3. **💬 Notificação WhatsApp Automática:**
   - Botão **WhatsApp** com mensagens prontas e personalizáveis por status (Entrada, Orçamento, Aprovado, Liberado/Pronto para Retirada).
   - Abre diretamente o WhatsApp Web ou o app do WhatsApp no celular/computador com o telefone do cliente.

4. **☁️ Google Drive & Backups:**
   - Backup em Nuvem através do Google Drive e exportação de arquivo JSON local.
   - Segurança total para não perder cadastros e atendimentos.
