const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// Função auxiliar para enviar mensagens via WhatsApp Cloud API
async function sendWhatsAppMessage(data) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      data,
      {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Mensagem enviada com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao enviar mensagem do WhatsApp:', error.response ? JSON.stringify(error.response.data) : error.message);
  }
}

// 1. Menu Principal (Boas-vindas)
async function sendMainMenu(to) {
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: 'Olá! Seja bem-vindo(a) à *AtivaStock*! 👋\n\nTrabalhamos com o fornecimento de produtos para lojistas, oferecendo uma grande variedade de categorias e a possibilidade de montar pedidos mistos.\n\nComo podemos ajudar seu negócio hoje?',
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'btn_condicoes',
              title: 'Condições Comerciais',
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'btn_catalogo',
              title: 'Visualizar Catálogo',
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'btn_orcamento',
              title: 'Solicitar Orçamento',
            },
          },
        ],
      },
    },
  };
  await sendWhatsAppMessage(data);
}

// Submenu para 'Falar com Atendente'
async function sendSecondaryMenuOption(to) {
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: 'Ou se preferir um atendimento personalizado com nossa equipe:',
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'btn_atendente',
              title: 'Falar c/ Atendente',
            },
          },
        ],
      },
    },
  };
  await sendWhatsAppMessage(data);
}

// 2. Opção 1 - Condições Comerciais
async function sendCondicoesComerciais(to) {
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text:
          '📌 *Condições Comerciais - AtivaStock*\n\n' +
          '• *Pedido Mínimo:* R$ 750,00 + frete.\n' +
          '• *Mix de Produtos:* Você pode combinar diferentes produtos e quantidades no mesmo pedido.\n' +
          '• *Preços:* Trabalhamos com faixas de preço conforme a quantidade adquirida de cada produto.\n' +
          '• *Disponibilidade:* Produtos sujeitos a confirmação de estoque no dia do pedido. Cores e variações conforme disponibilidade.\n' +
          '• *Pagamento:* Após a confirmação do orçamento, enviaremos o link de pagamento (Boleto à vista, PIX, Crédito à vista ou parcelado - juros por conta do comprador, Débito).\n' +
          '• *Entregas:* Frete FOB (Responsabilidade do comprador). O frete é calculado separadamente conforme o destino.\n' +
          '• *Prazos:* Informados no fechamento do pedido, após consulta da disponibilidade dos produtos.',
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'btn_menu_principal',
              title: 'Voltar ao Menu',
            },
          },
        ],
      },
    },
  };
  await sendWhatsAppMessage(data);
}

// 3. Opção 2 - Visualizar Catálogo
async function sendCatalogo(to) {
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text:
          '📦 *Visualizar Catálogo - AtivaStock*\n\n' +
          'Conheça nossa seleção de produtos para revenda, organizada por categoria para facilitar sua escolha. Nosso catálogo é atualizado periodicamente e conta com diversas opções para seu negócio.\n\n' +
          '🌐 *Acesse nosso site/catálogo:* www.ativastock.com.br\n\n' +
          'ℹ️ *Informações Importantes:*\n' +
          '• Possibilidade de combinar diferentes produtos no mesmo pedido.\n' +
          '• Pedido mínimo de R$ 750,00 + frete.\n' +
          '• Produtos sujeitos a disponibilidade do estoque.\n\n' +
          'Após escolher os produtos, solicite seu orçamento!',
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'btn_orcamento',
              title: 'Solicitar Orçamento',
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'btn_menu_principal',
              title: 'Voltar ao Menu',
            },
          },
        ],
      },
    },
  };
  await sendWhatsAppMessage(data);
}

// 4. Opção 3 - Solicitar Orçamento
async function sendOrcamentoInstructions(to) {
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text:
          '📝 *Solicitar Orçamento*\n\n' +
          'Gostou de algum produto do nosso catálogo? Para solicitar seu orçamento, informe na próxima mensagem:\n\n' +
          '1️⃣ Código do produto (SKU)\n' +
          '2️⃣ Quantidade desejada\n' +
          '3️⃣ CEP de entrega\n\n' +
          '⚠️ *Lembrete das Condições Comerciais:*\n' +
          '• Pedido mínimo R$ 750,00 + frete\n' +
          '• Preços diferenciados conforme a quantidade de cada produto\n' +
          '• Disponibilidade sujeita à consulta de estoque\n\n' +
          'Após receber sua lista, nossa equipe encaminhará o orçamento detalhado.',
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'btn_menu_principal',
              title: 'Voltar ao Menu',
            },
          },
        ],
      },
    },
  };
  await sendWhatsAppMessage(data);
}

// 5. Opção 4 - Falar com Atendente
async function sendAtendenteInstructions(to) {
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text:
          '👤 *Falar com Atendente*\n\n' +
          'Descreva brevemente o assunto do seu atendimento.\n\n' +
          'Sua mensagem será encaminhada à nossa equipe humana, que responderá o mais breve possível.\n\n' +
          'Agradecemos o seu contato! AtivaStock.',
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'btn_menu_principal',
              title: 'Voltar ao Menu',
            },
          },
        ],
      },
    },
  };
  await sendWhatsAppMessage(data);
}

// Validar Webhook com a Meta (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Receber e processar mensagens do WhatsApp (POST)
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (message) {
    const from = message.from;
    console.log(`Mensagem recebida de ${from}:`, message);

    // A) Clique em Botão Interativo
    if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
      const buttonId = message.interactive.button_reply.id;

      if (buttonId === 'btn_condicoes') {
        await sendCondicoesComerciais(from);
      } else if (buttonId === 'btn_catalogo') {
        await sendCatalogo(from);
      } else if (buttonId === 'btn_orcamento') {
        await sendOrcamentoInstructions(from);
      } else if (buttonId === 'btn_atendente') {
        await sendAtendenteInstructions(from);
      } else if (buttonId === 'btn_menu_principal') {
        await sendMainMenu(from);
        await sendSecondaryMenuOption(from);
      }
    }
    // B) Mensagem de Texto (ex: "olá", "menu", etc.)
    else if (message.type === 'text') {
      await sendMainMenu(from);
      await sendSecondaryMenuOption(from);
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor AtivaStock rodando na porta ${PORT}`);
});