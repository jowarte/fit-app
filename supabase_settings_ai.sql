-- ==============================================================================
-- ATUALIZAÇÃO: Configurações de Identidade Visual, SEO e IA para a Página de Vendas
-- Execute este script no SQL Editor do Supabase se desejar persistir tudo no banco
-- ==============================================================================

ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'TreinoApp';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS app_logo_url TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS app_cover_url TEXT DEFAULT '/cover.png';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#00ff88';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT 'TreinoApp - Seu Treino Em Qualquer Lugar';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Plataforma completa de treinos com mais de 1.800 exercícios em vídeo e GIF, fichas personalizadas e resultados rápidos.';

-- Configurações da IA
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'gemini';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS ai_api_key TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS ai_prompt TEXT DEFAULT '';

-- Conteúdo da Página de Vendas (Gerado por IA)
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_badge TEXT DEFAULT 'O APP MAIS COMPLETO DO BRASIL';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_headline TEXT DEFAULT 'Transforme seu corpo com o método definitivo de treino.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_subheadline TEXT DEFAULT 'Pare de pular treinos. Tenha acesso a vídeos realistas de alta qualidade, crie rotinas personalizadas e mantenha o foco inabalável.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_cta_text TEXT DEFAULT 'Ver Planos';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_benefits JSONB DEFAULT '[]'::jsonb;
