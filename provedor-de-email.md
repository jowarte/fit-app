# Provedor de E-mail do Projeto

**Serviço Utilizado:** Resend
**Link de Acesso / Onboarding:** https://resend.com/onboarding

## Configurações Atuais no Supabase (SMTP)
Este provedor foi configurado no painel do Supabase (Authentication -> Emails -> SMTP) para destravar a personalização dos templates de e-mail e permitir o envio das mensagens em português (ex: Confirmação de Cadastro).

* **Host:** `smtp.resend.com`
* **Porta:** `465`
* **Usuário:** `resend`
* **Remetente padrão para testes:** `onboarding@resend.dev`

---
*Nota: Para usar um e-mail com domínio próprio (ex: contato@appgood.online), é necessário adicionar e verificar o domínio no painel do Resend na aba "Domains".*
