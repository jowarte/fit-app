# 🚀 Guia de Instalação Rápida — FitApp

Guia passo a passo para colocar sua cópia do aplicativo no ar em menos de **5 minutos**, já com mais de **1.800 exercícios**, vídeos, GIFs e painel administrativo 100% funcionais.

---

## 📋 Pré-requisitos (Todos Gratuitos)
1. Conta no [Supabase](https://supabase.com) (Banco de dados na nuvem).
2. Conta no [GitHub](https://github.com) (Para hospedar o código).
3. Conta na [Vercel](https://vercel.com) (Para publicar o app na internet com HTTPS).

---

## 🛠️ PASSO 1: Configurar o Banco de Dados (Supabase)

1. Acesse [supabase.com](https://supabase.com), faça login e clique em **"New Project"**.
2. Preencha os campos:
   - **Name:** Nome da sua academia/app (ex: `FitApp Pro`).
   - **Database Password:** Crie uma senha segura e anote.
   - **Region:** Selecione `South America (São Paulo)` para máxima velocidade.
   - Clique em **"Create new project"** e aguarde cerca de 1 minuto até o banco inicializar.
3. No menu lateral esquerdo, clique no ícone **SQL Editor** ➔ **New Query**.
4. Abra o arquivo **`supabase_schema.sql`**, copie todo o conteúdo dele, cole no editor do Supabase e clique no botão verde **"RUN"**.
   > ✅ **Pronto!** Automaticamente serão criadas todas as tabelas, os mais de **1.800 exercícios com vídeos e GIFs**, os planos padrão e a sua conta de Super Administrador.
5. No menu lateral esquerdo, clique na engrenagem **Project Settings** ➔ **API**.
6. Copie e guarde esses dois dados:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon public key** (uma chave longa começando com `eyJ...`)

---

## 🌐 PASSO 2: Publicar o Aplicativo (Vercel)

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. No painel principal, clique no botão azul **"Add New..."** ➔ **"Project"**.
3. Localize o repositório do seu aplicativo e clique em **"Import"**.
4. Em **Project Name**, escolha o nome do link do seu app (ex: `minhaacademia-app`).
5. Clique na sanfona **"Environment Variables"** (Variáveis de Ambiente) e adicione as 2 variáveis que você pegou no Supabase:
   - **Key:** `VITE_SUPABASE_URL` | **Value:** (Cole sua Project URL)
   - **Key:** `VITE_SUPABASE_ANON_KEY` | **Value:** (Cole sua anon public key)
   *(Clique em **Add** para cada uma).*
6. Clique no botão azul **"Deploy"**.
7. Aguarde cerca de 1 minuto. A Vercel vai gerar o seu link oficial seguro (com cadeado SSL).

---

## 🔑 PASSO 3: Primeiro Acesso como Super Administrador

1. Abra o link gerado pela Vercel no seu navegador ou celular.
2. Clique em **Entrar** ou acesse a rota `/login`.
3. Utilize as credenciais padrão de Super Administrador:
   - 📧 **E-mail:** `admin@admin.com`
   - 🔒 **Senha:** `admin123`
4. Após o login, você verá o botão azul **"Painel Admin (Super)"** no topo da tela inicial!

---

## ⚙️ PASSO 4: Personalização do seu Negócio

Dentro do seu Painel Admin (`/admin`), você pode configurar tudo:

1. **Configurações Gerais (`/admin/settings`):**
   - Altere o Nome do App (ex: para o nome da sua marca).
   - Insira o link da sua Logotipo e Capa.
   - Escolha a cor predominante da plataforma.
   - Configure seus Webhooks de automação (n8n, Bot Vende ou checkout).
2. **Planos & Vendas (`/admin/plans` e `/admin/sales`):**
   - Altere os preços dos planos (Mensal, Trimestral, Anual).
   - Cole o seu link de checkout (Cakto, Kiwify, Hotmart, Mercado Pago, etc.).
3. **Segurança da sua Senha:**
   - Para sua segurança, altere o e-mail e a senha do administrador nas configurações após o primeiro acesso.

---

## ❓ Perguntas Frequentes (FAQ)

### 1. Os vídeos e GIFs dos exercícios já estão funcionando?
**Sim, 100%!** Todos os mais de 1.800 exercícios estão hospedados em CDN de alta velocidade na nuvem e já vêm vinculados pelo script SQL. Não é necessário fazer upload manual de nenhum vídeo.

### 2. O cronômetro avisa quando acaba o descanso?
**Sim!** O cronômetro esportivo conta com alarme sonoro integrado (apito de academia) e vibração para celulares ao zerar o tempo.

### 3. Como recebo atualizações futuras do sistema?
Basta acessar a aba **Atualizações** (`/admin/updates`) no seu painel Admin. Quando houver uma nova versão, aparecerá um aviso no topo e você poderá atualizar sua cópia com 1 clique!
