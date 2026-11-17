# 🏋️‍♂️ TreinoApp Pro - Plataforma Fitness White-Label

Plataforma completa de treinos com mais de 1.800 exercícios em vídeo e GIF, montador de fichas, compartilhamento de rotinas no WhatsApp, inteligência artificial integrada para reformular páginas de vendas e painel administrativo completo.

---

## 🚀 Instalação Rápida em 1 Clique (Vercel)

Clique no botão abaixo para clonar e instalar o aplicativo diretamente na sua conta da Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjowarte%2Ffit-app&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY&envDescription=Insira%20a%20URL%20e%20a%20Chave%20Anon%20do%20seu%20projeto%20no%20Supabase&envLink=https%3A%2F%2Fsupabase.com%2Fdashboard%2Fproject%2F_%2Fsettings%2Fapi&project-name=meu-treino-app&repository-name=meu-treino-app)

---

## 📋 Passo a Passo de Configuração (3 Minutos)

### Passo 1: Criar o Banco de Dados no Supabase
1. Crie uma conta gratuita em [supabase.com](https://supabase.com).
2. Crie um novo projeto (ex: `fit-app`).
3. No menu lateral esquerdo, clique no ícone **SQL Editor** (`>_`).
4. Abra o arquivo `supabase_schema.sql`, copie todo o conteúdo, cole no SQL Editor e clique em **RUN**.
5. Em seguida, abra o arquivo `supabase_exercises.sql`, cole no SQL Editor e clique em **RUN** (para cadastrar os 1.850 exercícios e vídeos).

### Passo 2: Fazer o Deploy na Vercel
1. Clique no botão **Deploy with Vercel** acima (ou use o link gerado).
2. A Vercel solicitará duas variáveis de ambiente encontradas em **Project Settings -> API** no Supabase:
   * `VITE_SUPABASE_URL`: URL do seu projeto (ex: `https://xxxx.supabase.co`)
   * `VITE_SUPABASE_ANON_KEY`: Sua chave pública `anon` (ou `publishable`)
3. Clique em **Deploy**. Em 45 segundos seu aplicativo estará no ar!

### Passo 3: Acessar o Painel de Administrador
1. Abra o link gerado pela Vercel e acesse a página de login:
   * **E-mail padrão:** `admin@admin.com`
   * **Senha padrão:** `admin123`
2. No painel de administração (`/admin`), acesse **Configurações** e altere o seu e-mail e sua senha para garantir a segurança da sua conta.
3. Personalize a **Logo**, a **Capa**, as **Cores** e a **Página de Vendas com IA** como desejar!

---

## 📱 Tecnologias Utilizadas
* **Frontend:** React + Vite, Lucide Icons, CSS Variables
* **Banco de Dados & Autenticação:** Supabase
* **Hospedagem:** Vercel
* **CDN de Mídias (Vídeos e GIFs):** Servidor centralizado em alta performance com HTTPS
