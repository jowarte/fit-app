import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    // Apenas aceita requisições POST
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    // Pega o JSON enviado pelo Cakto
    const body = await req.json()
    console.log('Webhook Cakto Recebido:', body)

    // Ajuste esses campos dependendo do payload real do Cakto.
    const status = body.event || body.status // ex: 'payment.approved' ou 'approved'
    const customerEmail = body.data?.customer?.email || body.email
    const productId = body.data?.product?.id || body.product_id || body.product?.id || ''

    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'Email não encontrado no payload' }), { status: 400 })
    }

    // Verifica se é uma compra aprovada
    if (status === 'payment.approved' || status === 'approved' || status === 'paid') {
      
      // 1. Busca o ID do usuário na tabela do Supabase (Auth) através do email
      // Como o Deno e a Edge Function têm a chave 'SERVICE_ROLE', temos permissão de admin:
      const { data: users, error: userError } = await supabase.auth.admin.listUsers()
      
      if (userError) throw userError

      const user = users.users.find(u => u.email === customerEmail)

      if (!user) {
        console.log('Usuário comprou mas ainda não criou conta no app:', customerEmail)
        // Aqui você pode decidir criar a conta automaticamente ou apenas ignorar até ele criar.
        return new Response(JSON.stringify({ message: 'Usuário não encontrado no app ainda.' }), { status: 200 })
      }

      // 2. Tenta descobrir qual foi o plano comprado baseado no ID do Produto
      let targetPlanId = null
      if (productId) {
        const { data: plans } = await supabase.from('plans').select('id, webhook_product_id')
        if (plans) {
          const matchingPlan = plans.find(p => p.webhook_product_id === String(productId))
          if (matchingPlan) {
            targetPlanId = matchingPlan.id
            console.log(`Produto ${productId} mapeado para o Plano ${targetPlanId}`)
          }
        }
      }

      // 3. Atualiza o Perfil do usuário
      const updateData: any = { is_premium: true }
      if (targetPlanId) {
        updateData.plan_id = targetPlanId
        // Limpa o status de teste se houver, ativando a assinatura
        updateData.status = 'active' 
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) throw updateError

      console.log(`Usuário ${customerEmail} ativado com sucesso! Plano: ${targetPlanId || 'Padrão'}`)
      return new Response(JSON.stringify({ success: true, message: 'Usuário atualizado com sucesso' }), { status: 200 })
    }

    // Se o pagamento for recusado ou reembolsado (refunded)
    if (status === 'payment.refunded' || status === 'refunded' || status === 'chargeback' || status === 'subscription.canceled') {
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users.users.find(u => u.email === customerEmail)
      if (user) {
        // Bloqueia o acesso ou remove o plano
        await supabase.from('profiles').update({ is_premium: false, plan_id: null, status: 'blocked' }).eq('id', user.id)
      }
      return new Response(JSON.stringify({ message: 'Acesso Premium removido (Reembolso/Cancelamento)' }), { status: 200 })
    }

    return new Response(JSON.stringify({ message: 'Evento ignorado (não é pagamento aprovado/reembolsado)' }), { status: 200 })

  } catch (err) {
    console.error('Erro interno:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
