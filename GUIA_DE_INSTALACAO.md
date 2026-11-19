# 🚀 Guia Oficial de Instalação e Configuração Completa — FitApp

O guia definitivo passo a passo para colocar a sua cópia do aplicativo no ar em menos de **5 minutos**, configurar os acessos de Super Admin, conectar os Webhooks de vendas e automações, adicionar as chaves de Inteligência Artificial e ativar o Pixel da Meta.

---

## 📋 Sumário Rápido
1. [Pré-requisitos Gratuitos](#-1-pré-requisitos-gratuitos)
2. [Instalação Passo a Passo (Supabase + Vercel)](#-2-instalação-passo-a-passo)
3. [Acesso à Conta Super Admin](#-3-primeiro-acesso-como-super-admin)
4. [Como Configurar os Webhooks](#-4-como-configurar-os-webhooks)
   - [Webhook de Liberação Automática de Vendas (Cakto, Kiwify, Hotmart)](#a-webhook-de-vendas-liberação-automática)
   - [Webhook de Notificação e Lembretes (n8n / Bot Vende / WhatsApp)](#b-webhook-de-notificações-n8n--bot-vende)
5. [Como Adicionar as Chaves de Inteligência Artificial (IA)](#-5-como-adicionar-as-chaves-de-ia)
6. [Como Configurar o Pixel do Facebook (Meta Ads)](#-6-como-configurar-o-pixel-do-facebook-ads)
7. [Como Criar e Gerenciar os Planos](#-7-como-criar-e-gerenciar-os-planos)
8. [Gerenciamento de Clientes e Equipe](#-8-gerenciamento-de-clientes-e-equipe)
9. [Como Funcionam as Atualizações Oficiais](#-9-como-funcionam-as-atualizações-oficiais)

---

## 🛠️ 1. Pré-requisitos Gratuitos
* Uma conta no [Supabase](https://supabase.com) (Banco de dados e autenticação na nuvem).
* Uma conta no [GitHub](https://github.com) (Onde o código do aplicativo fica guardado).
* Uma conta na [Vercel](https://vercel.com) (Hospedagem global rápida e gratuita com SSL).

---

## ⚙️ 2. Instalação Passo a Passo

### Parte A: Banco de Dados no Supabase
1. Acesse [supabase.com](https://supabase.com) e clique em **"New Project"**.
2. Preencha o nome do projeto (ex: `FitApp`), crie uma senha forte e escolha a região **`South America (São Paulo)`**.
3. Clique em **"Create new project"** e aguarde 1 minuto até ficar pronto.
4. No menu lateral esquerdo, clique no ícone **SQL Editor** ➔ **New Query**.
5. Abra o arquivo **`supabase_schema.sql`** do projeto, copie todo o código, cole no SQL Editor e clique no botão verde **"RUN"**.
   > ✅ **Pronto!** Automaticamente são criadas todas as tabelas, os mais de **1.800 exercícios com GIFs e vídeos**, os planos padrão e a sua conta oficial de Administrador.
6. No menu lateral do Supabase, clique na engrenagem **Project Settings** ➔ **API**.
7. Copie e guarde esses dois dados essenciais:
   - **Project URL** (ex: `https://abcdefghijk.supabase.co`)
   - **anon public key** (chave longa começando com `eyJ...`)

---

### Parte B: Publicar o Aplicativo na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com seu GitHub.
2. Clique no botão azul **"Add New..."** ➔ **"Project"**.
3. Localize o repositório do seu app e clique em **"Import"**.
4. No campo **Environment Variables** (Variáveis de Ambiente), adicione as 2 variáveis com os dados do Supabase:
   * **Key:** `VITE_SUPABASE_URL` | **Value:** (Cole a Project URL do Supabase)
   * **Key:** `VITE_SUPABASE_ANON_KEY` | **Value:** (Cole a anon public key do Supabase)
   *(Clique no botão **Add** após preencher cada uma).*
5. Clique no botão azul **"Deploy"**.
6. Aguarde cerca de 1 minuto. A Vercel vai gerar o link oficial do seu aplicativo pronto para uso!

---

## 🔑 3. Primeiro Acesso como Super Admin

1. Abra o link gerado pela Vercel no navegador do computador ou celular.
2. Acesse a tela de **Login** (`/login`).
3. Digite as credenciais oficiais de Administrador mestre:
   * 📧 **E-mail:** `admin@admin.com`
   * 🔒 **Senha:** `admin123`
4. Ao entrar, você verá o selo **"Super Admin"** e terá acesso ao menu administrativo completo:
   * **Dashboard:** Visão geral de alunos, treinos e serviços ativos.
   * **Exercícios:** Biblioteca completa de 1.800+ exercícios organizados por pastas.
   * **Planos:** Criação de planos de assinatura ou gratuitos.
   * **Página de Vendas:** Estúdio de IA, edição de copy e Pixel da Meta.
   * **Configurações:** Nome do app, logotipo, cor primária e Webhooks.
   * **Clientes:** Lista de alunos, status (ativo/bloqueado) e histórico.
   * **Atualizações:** Verificação oficial de melhorias do sistema.

---

## ⚡ 4. Como Configurar os Webhooks

O aplicativo conta com dois tipos de Webhooks para deixar seu negócio 100% automático:

### A) Webhook de Vendas (Liberação Automática)
*Para quando o aluno comprar na Kiwify, Cakto, Hotmart ou Eduzz, ter o acesso liberado no app na mesma hora:*

1. No seu Painel Admin, acesse **"Configurações"** (`/admin/settings`).
2. Role até o **Bloco 5: Webhook de Recebimento de Vendas**.
3. Copie a URL gerada (formato: `https://<seu-projeto>.supabase.co/functions/v1/cakto-webhook`).
4. **Na sua plataforma de checkout (Kiwify, Cakto, Hotmart, etc.):**
   - Acesse **Configurações do Produto** ➔ **Webhooks / Integrações**.
   - Adicione a URL que você copiou no passo 3.
   - Marque o evento: **"Compra Aprovada" / "Pagamento Aprovado"**.
   - Pegue o **ID do Produto** que a plataforma exibe.
5. **No Painel Admin ➔ Planos (`/admin/plans`):**
   - Edite o plano correspondente e preencha o campo **"ID do Produto no Checkout / Webhook"** com o mesmo código da plataforma.
   - ✅ Pronto! Assim que a compra for aprovada, o comprador recebe acesso imediato com o plano contratado.

---

### B) Webhook de Notificações (n8n / Bot Vende / WhatsApp)
*Para enviar uma mensagem automática de boas-vindas no WhatsApp do aluno ou disparar automações assim que ele se cadastrar:*

1. No seu Painel Admin, acesse **"Configurações"** (`/admin/settings`).
2. Localize os campos de Webhooks de automação:
   - **Webhook n8n / Make:** Cole a URL do seu webhook HTTP (ex: `https://seu-n8n.com/webhook/aluno-novo`).
   - **Webhook Bot Vende (Noé):** Cole a URL da sua automação do Bot Vende caso utilize.
3. Clique em **"Salvar Configurações"**.
4. Sempre que um novo aluno fizer o cadastro (mesmo de teste grátis), o aplicativo dispara automaticamente para o seu webhook:
   ```json
   {
     "event": "user_registered",
     "email": "aluno@email.com",
     "name": "Nome do Aluno",
     "phone": "5511999999999",
     "created_at": "2026-11-19T10:00:00Z"
   }
   ```
   *O aplicativo possui sistema de contingência direta com fallback que garante que a notificação chegue mesmo se a função de nuvem oscilar.*

---

## 🤖 5. Como Adicionar as Chaves de IA

O aplicativo possui um **Estúdio de Inteligência Artificial** embutido em **Admin > Página de Vendas** (`/admin/sales`) que gera copies persuasivas e argumentos de venda em segundos.

### Opção 1: Google Gemini (100% Gratuito — Recomendado)
1. Acesse o site oficial: [aistudio.google.com](https://aistudio.google.com).
2. Faça login com qualquer conta Google.
3. No topo esquerdo, clique no botão azul **"Get API key"** ➔ **"Create API key"**.
4. Copie a chave gerada (começa com `AIzaSy...`).
5. No seu aplicativo em **Admin ➔ Página de Vendas**:
   - Selecione o provedor: **Google Gemini (Recomendado)**.
   - Cole a sua chave no campo **"Chave de API (API Key)"**.
   - Escolha um dos modelos prontos (Emagrecimento Feminino, Hipertrofia, Treino em Casa, etc.).
   - Clique em **"✨ Reformular Página de Vendas com IA"**.
   - Em 5 segundos os títulos, promessas e benefícios são gerados! Clique em **Salvar**.

### Opção 2: Groq Cloud (Gratuito e Ultra Rápido)
1. Acesse [console.groq.com](https://console.groq.com) e crie uma conta grátis.
2. Vá em **API Keys** ➔ **Create API Key**.
3. Copie a chave (`gsk_...`), selecione **Groq (Llama 3.3)** no app e cole a chave.

### Opção 3: OpenAI (ChatGPT)
1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Gere sua Secret Key (`sk-...`), selecione **OpenAI (GPT-4o Mini)** no app e cole a chave.

---

## 🎯 6. Como Configurar o Pixel do Facebook Ads

1. Acesse o seu Painel Admin ➔ **"Página de Vendas"** (`/admin/sales`).
2. Role até o card **"Pixel do Facebook / Meta Ads"**.
3. Cole apenas os números do seu identificador de Pixel (ex: `2119024148651706`).
4. Clique em **"Salvar Pixel"**.
5. Aparecerá a confirmação verde: **"● Pixel Ativo: [seu número]"**.
6. **O que o Pixel faz automaticamente:**
   * 👁️ **`PageView`**: Rastreia visitas em `/` e `/planos`.
   * 🛒 **`InitiateCheckout`**: Rastreia quando o visitante clica no botão "Assinar Agora" de qualquer plano (enviando nome e valor do plano).
   * 🎯 **`CompleteRegistration` / `Lead`**: Rastreia novos cadastros concluídos no app.
7. Você pode clicar no botão **"Testar Disparo"** para verificar na hora se o Pixel está respondendo no Meta Pixel Helper do navegador.

---

## 💳 7. Como Criar e Gerenciar os Planos

Acesse a aba **"Planos"** (`/admin/plans`):
1. Clique em **"+ Novo Plano"** ou **"Editar"** em um plano existente.
2. Defina:
   - **Nome do Plano:** Ex: `Plano VIP Casa + Academia`.
   - **Preço (R$):** Ex: `29,90` ou `0,00` para planos gratuitos.
   - **Ciclo:** `Mensal`, `Trimestral`, `Semestral` ou `Anual`.
   - **Link de Checkout:** O link do seu botão de pagamento na Kiwify/Cakto/Hotmart.
   - **Permissões de Treino:** Marque o que o plano libera (Treino em Casa, Academia, Criar Rotinas, Treino Avançado).
   - **Período de Teste Grátis (Trial):** Ative se quiser conceder dias gratuitos (ex: 7 dias) antes do bloqueio por mensalidade.
3. Use o botão **"SIMULAR EXPERIÊNCIA"** no card do plano para navegar pelo app exatamente com a visão daquele aluno.

---

## 👥 8. Gerenciamento de Clientes e Equipe

* **Clientes (`/admin/clients`):**
  - Veja todos os alunos cadastrados com e-mail, telefone e data de entrada.
  - **Bloquear / Desbloquear:** Suspenda o acesso de alunos inadimplentes com 1 clique.
  - **Alterar Plano:** Mude o aluno de Free para VIP manualmente a qualquer momento.
  - **Estender Teste:** Adicione mais dias de teste grátis caso o aluno solicite.

* **Gerenciar Equipe (`/admin/team`):**
  - Adicione outros professores, personais ou administradores associando permissões exclusivas.

---

## 🔄 9. Como Funcionam as Atualizações Oficiais

* O aplicativo conta com verificação automática de versões conectada aos repositórios oficiais.
* Quando o criador do software lançar uma nova versão oficial com melhorias, você verá o aviso no topo do painel: **"🚀 Nova Atualização do App Disponível (vX.X.X)"**.
* Para aplicar na sua cópia sem perder nenhum dado de aluno:
  1. Abra o seu repositório no GitHub.
  2. Clique no botão **"Sync Fork" ➔ "Update branch"**.
  3. A Vercel atualiza seu aplicativo em 60 segundos automaticamente!
