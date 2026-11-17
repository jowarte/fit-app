/**
 * Motor de IA para Reformular Páginas de Vendas (Gemini, OpenAI, Meta Llama via Groq/OpenRouter)
 */

export const AI_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini (Recomendado)',
    defaultModel: 'gemini-1.5-flash',
    apiKeyHelp: 'https://aistudio.google.com/app/apikey',
    placeholderKey: 'AIzaSy...'
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT - GPT-4o Mini)',
    defaultModel: 'gpt-4o-mini',
    apiKeyHelp: 'https://platform.openai.com/api-keys',
    placeholderKey: 'sk-proj-...'
  },
  {
    id: 'groq',
    name: 'Meta Llama 3 (via Groq Cloud - Grátis e Ultrarrápido)',
    defaultModel: 'llama-3.3-70b-versatile',
    apiKeyHelp: 'https://console.groq.com/keys',
    placeholderKey: 'gsk_...'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Llama, Claude, etc)',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    apiKeyHelp: 'https://openrouter.ai/keys',
    placeholderKey: 'sk-or-...'
  }
];

export const PROMPT_TEMPLATES = [
  {
    label: '🔥 Emagrecimento Feminino',
    prompt: 'Crie uma página de vendas altamente persuasiva para mulheres que desejam queimar gordura e definir o corpo treinando em casa ou na academia em 20 a 30 minutos por dia, destacando vídeos realistas passo a passo.'
  },
  {
    label: '🏋️‍♂️ Hipertrofia & Ganho de Massa',
    prompt: 'Crie uma página de vendas com foco em homens que buscam ganho de massa muscular, divisão de treinos ABC/ABCD, execução perfeita para não lesionar e fichas personalizadas.'
  },
  {
    label: '🏠 Treino em Casa Sem Equipamento',
    prompt: 'Página focada em pessoas ocupadas que não têm tempo de ir à academia e querem treinar na sala de casa usando apenas o peso do corpo, com resultados visíveis em 4 semanas.'
  },
  {
    label: '⚡ Promoção Exclusiva / Vagas Limitadas',
    prompt: 'Página agressiva de conversão com senso de urgência, destacando desconto por tempo limitado, acesso completo a mais de 1.800 exercícios e bônus especiais.'
  }
];

const SYSTEM_INSTRUCTION = `Você é um Copywriter Especialista em Marketing Direto e Fitness de nível internacional.
Sua missão é gerar os textos de uma página de vendas de alta conversão para um aplicativo de treinos fitness.
O aplicativo conta com:
- Mais de 1.800 exercícios em vídeos e GIFs em alta definição
- Divisão de treinos para Casa e Academia
- Montador de fichas personalizadas
- Compartilhamento no WhatsApp com vídeos
- Acompanhamento semanal de evolução

Você DEVE retornar OBRIGATORIAMENTE um JSON puro com esta estrutura exata (sem markdown ou texto extra):
{
  "badge": "Texto curto chamativo em caixa alta (ex: MÉTODO EXCLUSIVO)",
  "headline": "Título de alto impacto prometendo a grande transformação (com menos de 15 palavras)",
  "subheadline": "Subtítulo convincente que explica como o app entrega a promessa (2 a 3 frases persuasivas)",
  "cta_text": "Texto do botão de compra (ex: Quero Transformar Meu Corpo)",
  "benefits": [
    { "title": "Benefício 1 (Curto)", "desc": "Explicação do benefício em 1 ou 2 frases persuasivas." },
    { "title": "Benefício 2 (Curto)", "desc": "Explicação do benefício em 1 ou 2 frases persuasivas." },
    { "title": "Benefício 3 (Curto)", "desc": "Explicação do benefício em 1 ou 2 frases persuasivas." },
    { "title": "Benefício 4 (Curto)", "desc": "Explicação do benefício em 1 ou 2 frases persuasivas." }
  ]
}`;

export async function generateSalesCopy({ provider, apiKey, userPrompt }) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Por favor, informe a Chave de API (API Key) do provedor selecionado.');
  }

  const promptContent = `${SYSTEM_INSTRUCTION}\n\nSolicitação do Cliente: ${userPrompt || 'Crie uma página de alta conversão moderna para academia e treino em casa.'}`;

  if (provider === 'gemini') {
    return await callGemini(apiKey.trim(), promptContent);
  } else if (provider === 'openai') {
    return await callOpenAI(apiKey.trim(), promptContent);
  } else if (provider === 'groq') {
    return await callGroq(apiKey.trim(), promptContent);
  } else if (provider === 'openrouter') {
    return await callOpenRouter(apiKey.trim(), promptContent);
  } else {
    throw new Error(`Provedor desconhecido: ${provider}`);
  }
}

async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erro da API Gemini (${response.status})`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('A API Gemini não retornou nenhum texto.');

  return cleanAndParseJson(text);
}

async function callOpenAI(apiKey, prompt) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erro da API OpenAI (${response.status})`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  return cleanAndParseJson(text);
}

async function callGroq(apiKey, prompt) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erro da API Groq (${response.status})`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  return cleanAndParseJson(text);
}

async function callOpenRouter(apiKey, prompt) {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erro da API OpenRouter (${response.status})`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  return cleanAndParseJson(text);
}

function cleanAndParseJson(text) {
  try {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/```\s*$/i, '');
    }
    return JSON.parse(clean);
  } catch (err) {
    console.error('Erro ao converter JSON da IA:', text);
    throw new Error('A IA não retornou um formato JSON válido. Tente novamente.');
  }
}
