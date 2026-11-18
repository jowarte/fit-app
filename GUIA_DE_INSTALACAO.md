# 🚀 Guia de Instalação e Configuração Completa — FitApp

Guia definitivo passo a passo para colocar sua cópia do aplicativo no ar em menos de **5 minutos**, configurar seus planos, conectar com sua plataforma de vendas e usar Inteligência Artificial para gerar páginas de alta conversão.

---

## 📋 Sumário
1. [Pré-requisitos Gratuitos](#-pré-requisitos-todos-gratuitos)
2. [Passo 1: Banco de Dados no Supabase](#️-passo-1-configurar-o-banco-de-dados-supabase)
3. [Passo 2: Hospedagem na Vercel](#-passo-2-publicar-o-aplicativo-vercel)
4. [Passo 3: Primeiro Acesso como Super Admin](#-passo-3-primeiro-acesso-como-super-administrador)
5. [Passo 4: Como Criar e Configurar os Planos](#-passo-4-como-criar-e-gerenciar-planos)
6. [Passo 5: Conectar o Webhook na Plataforma de Vendas (Cakto, Kiwify, Hotmart)](#-passo-5-conectar-o-webhook-na-plataforma-de-vendas)
7. [Passo 6: Estúdio de IA — Gerar Página de Vendas com Inteligência Artificial](#-passo-6-estúdio-de-ia--gerar-páginas-de-alta-conversão)
8. [Passo 7: Configurações Gerais da sua Marca (Logo, Cores e Pixel)](#-passo-7-personalização-da-marca--pixel-do-facebook)
9. [Perguntas Frequentes (FAQ)](#-perguntas-frequentes-faq)

---

## 📋 Pré-requisitos (Todos Gratuitos)
- Conta no [Supabase](https://supabase.com) (Banco de dados PostgreSQL na nuvem).
- Conta no [GitHub](https://github.com) (Para guardar o código do app).
- Conta na [Vercel](https://vercel.com) (Para publicar o app com HTTPS e velocidade global).

---

## 🛠️ PASSO 1: Configurar o Banco de Dados (Supabase)

1. Acesse [supabase.com](https://supabase.com), faça login e clique em **"New Project"**.
2. Preencha os campos:
   - **Name:** Nome do seu app (ex: `FitApp Pro`).
   - **Database Password:** Escolha uma senha segura e anote.
   - **Region:** Selecione `South America (São Paulo)` para menor latência.
   - Clique em **"Create new project"** e aguarde cerca de 1 minuto.
3. No menu lateral esquerdo do Supabase, clique no ícone **SQL Editor** ➔ **New Query**.
4. Abra o arquivo **`supabase_schema.sql`**, copie todo o conteúdo dele, cole no editor e clique no botão verde **"RUN"**.
   > ✅ **Pronto!** Automaticamente são criadas todas as tabelas, os mais de **1.800 exercícios com vídeos e GIFs**, os planos padrão e a sua conta oficial de Administrador.
5. No menu lateral, clique na engrenagem **Project Settings** ➔ **API**.
6. Copie e guarde esses dois dados essenciais:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon public key** (uma chave longa começando com `eyJ...`)

---

## 🌐 PASSO 2: Publicar o Aplicativo (Vercel)

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique no botão azul **"Add New..."** ➔ **"Project"**.
3. Localize o repositório do seu aplicativo e clique em **"Import"**.
4. Em **Project Name**, escolha o nome do link (ex: `meutreino-app`).
5. Clique na sanfona **"Environment Variables"** (Variáveis de Ambiente) e adicione as 2 chaves do Supabase:
   - **Key:** `VITE_SUPABASE_URL` | **Value:** (Cole sua Project URL)
   - **Key:** `VITE_SUPABASE_ANON_KEY` | **Value:** (Cole sua anon public key)
   *(Clique em **Add** para cada uma).*
6. Clique no botão azul **"Deploy"**.
7. Aguarde cerca de 1 minuto. A Vercel vai gerar o link oficial do seu app com certificado de segurança SSL!

---

## 🔑 PASSO 3: Primeiro Acesso como Super Administrador

1. Abra o link gerado pela Vercel no navegador ou celular.
2. Acesse a tela de **Login** (`/login`).
3. Digite as credenciais padrão de Super Administrador:
   - 📧 **E-mail:** `admin@admin.com`
   - 🔒 **Senha:** `admin123`
4. Ao entrar, você verá o botão azul **"Painel Admin (Super)"** no topo da tela inicial. Clique nele para gerenciar toda a plataforma!

---

## 💳 PASSO 4: Como Criar e Gerenciar Planos

No menu do Admin, acesse a aba **"Planos"** (`/admin/plans`). Você pode editar os planos existentes ou criar novos:

1. Clique em **"+ Novo Plano"** ou no botão **"Editar"** de um plano existente.
2. Preencha as informações:
   - **Nome do Plano:** Ex: `Plano Mensal VIP`, `Semestral`, `Anual`.
   - **Preço (R$):** Ex: `29,90` ou `0,00` se for gratuito.
   - **Ciclo:** `Mensal`, `Trimestral`, `Semestral` ou `Anual`.
   - **Link de Checkout:** Cole o link direto da sua plataforma de vendas (Kiwify, Cakto, Hotmart, etc.). Quando o aluno clicar em "Assinar", ele será redirecionado para esse link.
   - **ID do Produto no Checkout / Webhook:** Código/ID do produto na sua plataforma de pagamento (necessário para a liberação automática pós-compra).
   - **Permissões de Acesso:** Marque o que esse plano libera:
     - [x] Acesso ao Treino em Casa
     - [x] Acesso ao Treino na Academia
     - [x] Criar Treinos Personalizados
     - [x] Compartilhar no WhatsApp
     - [x] Acesso ao Treino Avançado
   - **Período de Teste Grátis (Trial):** Marque se quiser liberar X dias de teste grátis (ex: 7 dias) antes do bloqueio por mensalidade.
3. Clique em **"Salvar Plano"**.
4. **💡 Dica:** Use o botão **"SIMULAR EXPERIÊNCIA"** no card do plano para testar exatamente a visão que o aluno terá dentro do app!

---

## ⚡ PASSO 5: Conectar o Webhook na Plataforma de Vendas

Para que o aluno compre no seu checkout e **tenha o acesso liberado automaticamente no app sem você precisar fazer nada manual**:

1. Acesse o seu Painel Admin ➔ **"Configurações"** (`/admin/settings`).
2. Role até o **Bloco 5: Webhook de Recebimento de Vendas**.
3. Copie a URL gerada (ela terá o formato: `https://<seu-projeto>.supabase.co/functions/v1/cakto-webhook`).
4. **Na sua Plataforma de Vendas (Cakto, Kiwify, Hotmart, Eduzz, etc.):**
   - Acesse as configurações do seu produto ➔ **Webhooks / Integrações**.
   - Clique em **"Criar Webhook"** ou **"Adicionar Webhook"**.
   - No campo **URL do Webhook**, cole o link copiado no passo 3.
   - Selecione o evento: **"Compra Aprovada" / "Pagamento Aprovado"**.
   - Salve o Webhook.
5. **No seu Painel Admin ➔ Planos (`/admin/plans`):**
   - Certifique-se de que o campo **"ID do Produto no Checkout / Webhook"** do seu plano está preenchido com o mesmo ID do produto que consta na plataforma de vendas.
   - ✅ Assim que uma compra for aprovada, o sistema localiza o comprador pelo e-mail e ativa o plano dele automaticamente!

---

## 🤖 PASSO 6: Estúdio de IA — Gerar Páginas de Alta Conversão

Você pode reformular todos os textos, títulos, promessas e benefícios da sua página de vendas usando Inteligência Artificial em segundos:

1. No menu do Admin, clique em **"Página de Vendas"** (`/admin/sales`).
2. No topo da página há o **"Estúdio de IA para Página de Vendas"**.
3. **Como conseguir a chave de IA gratuita:**
   - **Google Gemini (Recomendado e Gratuito):**
     1. Acesse [aistudio.google.com](https://aistudio.google.com).
     2. Faça login com sua conta Google e clique em **"Get API key"** ➔ **"Create API key"**.
     3. Copie a chave gerada.
   - *(Ou escolha Meta Llama 3 via Groq Cloud ou OpenAI ChatGPT se preferir).*
4. **No Painel Admin:**
   - Selecione o provedor: **Google Gemini (Recomendado)**.
   - Cole a sua chave no campo **"Chave de API (API Key)"**.
   - **Escolha um Modelo Rápido:**
     - 👙 *Emagrecimento Feminino (Queima de Gordura em 20-30 min)*
     - 🏋️‍♂️ *Hipertrofia & Ganho de Massa*
     - 🏠 *Treino Rápido em Casa sem Equipamentos*
     - 🔥 *Oferta Irresistível & Urgência com Desconto*
     - *(Ou escreva a sua própria instrução personalizada no campo de texto).*
5. Clique no botão brilhante **"✨ Reformular Página de Vendas com IA"**.
6. Em cerca de 5 segundos, a IA gera:
   - 🎯 Nova **Headline** persuasiva de alto impacto;
   - 📢 Nova **Subheadline** engajante;
   - 🏷️ Novo **Selo/Badge** no topo;
   - 🚀 Novo texto do **Botão de Ação (CTA)**;
   - 💡 4 novos **Benefícios explicativos** sob medida para o público escolhido!
7. Revise os textos gerados e clique no botão verde **"Salvar Página de Vendas"**.
8. Pronto! A sua Landing Page pública (`/` e `/planos`) já estará atualizada com a nova copy de vendas!

---

## 🎨 PASSO 7: Personalização da Marca & Pixel do Facebook

No menu do Admin ➔ **"Configurações"** (`/admin/settings`):

1. **Identidade Visual:**
   - **Nome da Aplicação:** Nome da sua marca ou academia (substitui em todas as telas).
   - **URL do Logotipo:** Link da imagem da sua logo (PNG transparente fica perfeito).
   - **Cor Primária:** Escolha a cor predominante do seu app no seletor de cores (ex: Verde Neon, Ciano, Vermelho, Laranja, etc.).
2. **Meta Pixel (Facebook Ads):**
   - Cole o seu **Pixel ID** (ex: `123456789012345`) no campo **"ID do Pixel do Facebook"**.
   - O sistema dispara eventos automáticos de **PageView** e visualizações na página de vendas para você otimizar suas campanhas de anúncios.
3. **Webhooks de Notificação (Opcional):**
   - **n8n / Make / Bot Vende (Noé):** Cole a URL do seu webhook para receber os dados de nome, e-mail e telefone de cada novo aluno assim que ele se cadastrar.
   - O app conta com disparo direto protegido com fallback para garantir entrega 100%.

---

## ❓ Perguntas Frequentes (FAQ)

### 1. Os mais de 1.800 vídeos e GIFs já entram funcionando?
**Sim, 100%!** Todos os exercícios já vêm pré-cadastrados no script SQL e utilizam a CDN global em nuvem de alta velocidade. Nenhum vídeo ocupa espaço no seu computador ou servidor.

### 2. O cronômetro de descanso apita?
**Sim!** Ao finalizar a contagem (`00:00`), o cronômetro emite um apito esportivo de academia e vibra no celular do aluno, além de possuir botão de silenciar caso o aluno prefira.

### 3. Como o aluno que não pagar é bloqueado?
- Se o período de teste (trial) expirar ou o admin alterar o status para `blocked` em **Gerenciar Clientes**, o sistema barra o acesso do aluno imediatamente e mostra o botão para regularizar a assinatura na página de planos.

### 4. Como atualizar o aplicativo no futuro?
Basta acessar a aba **Atualizações** (`/admin/updates`) no seu painel Admin e clicar em **"Atualizar Minha Cópia"** com 1 clique!
