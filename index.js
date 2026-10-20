const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// Nome do template aprovado na Meta
const TEMPLATE_NAME = 'ativastock_menu_principal';


// ==========================================
// ENVIAR MENSAGEM DE TEXTO
// ==========================================

async function enviarMensagem(to, texto) {

  try {

    console.log('Tentando enviar mensagem para:', to);

    const response = await axios.post(

      `https://graph.facebook.com/v26.0/${PHONE_NUMBER_ID}/messages`,

      {
        messaging_product: 'whatsapp',

        to: to,

        type: 'text',

        text: {
          body: texto
        }
      },

      {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }

    );

    console.log(
      'MENSAGEM ENVIADA COM SUCESSO:',
      JSON.stringify(response.data, null, 2)
    );

  } catch (error) {

    console.error('ERRO AO ENVIAR MENSAGEM:');

    if (error.response) {

      console.error(
        JSON.stringify(error.response.data, null, 2)
      );

    } else {

      console.error(error.message);

    }

  }

}


// ==========================================
// ENVIAR TEMPLATE DO MENU PRINCIPAL
// ==========================================

async function enviarMenuPrincipal(to) {

  try {

    console.log('Enviando template do menu principal para:', to);

    const response = await axios.post(

      `https://graph.facebook.com/v26.0/${PHONE_NUMBER_ID}/messages`,

      {
        messaging_product: 'whatsapp',

        to: to,

        type: 'template',

        template: {
          name: TEMPLATE_NAME,

          language: {
            code: 'pt_BR'
          }
        }
      },

      {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }

    );

    console.log(
      'TEMPLATE ENVIADO COM SUCESSO:',
      JSON.stringify(response.data, null, 2)
    );

  } catch (error) {

    console.error('ERRO AO ENVIAR TEMPLATE:');

    if (error.response) {

      console.error(
        JSON.stringify(error.response.data, null, 2)
      );

    } else {

      console.error(error.message);

    }

  }

}


// ==========================================
// CONDIÇÕES COMERCIAIS
// ==========================================

async function enviarCondicoesComerciais(to) {

  const texto = `CONDIÇÕES COMERCIAIS — ATIVA STOCK

• Pedido mínimo: R$ 750 + frete.

• Mix de produtos: você pode combinar diferentes produtos e quantidades no mesmo pedido.

• Preços: trabalhamos com faixas de preço conforme a quantidade adquirida de cada produto.

• Disponibilidade: os produtos estão sujeitos à confirmação de estoque no dia do pedido. Cores e variações conforme disponibilidade.

• Pagamento: após a confirmação do orçamento, enviaremos o link de pagamento. As opções são boleto à vista, Pix, crédito à vista ou parcelado (juros por conta do comprador) e débito.

• Entregas: frete FOB, de responsabilidade do comprador. O frete é calculado separadamente conforme o destino.

• Prazos: informados no fechamento do pedido, após consulta da disponibilidade dos produtos.`;

  await enviarMensagem(to, texto);

}


// ==========================================
// CATÁLOGO
// ==========================================

async function enviarCatalogo(to) {

  const texto = `VISUALIZE NOSSO CATÁLOGO

Conheça nossa seleção de produtos para revenda, organizada por categoria para facilitar sua escolha.

Nosso catálogo é atualizado periodicamente e conta com diversas opções para seu negócio.

INFORMAÇÕES IMPORTANTES:

• Possibilidade de combinar diferentes produtos no mesmo pedido.

• Pedido mínimo de R$ 750 + frete.

• Produtos sujeitos à disponibilidade de estoque.

Após escolher os produtos, você poderá solicitar seu orçamento diretamente pelo site.

Catálogo:
https://www.ativastock.com.br`;

  await enviarMensagem(to, texto);

}


// ==========================================
// ATENDENTE
// ==========================================

async function encaminharParaAtendente(to) {

  const texto = `Você está sendo direcionado para um atendente.

Nossa equipe irá atendê-lo e fornecer as informações necessárias. Por favor, aguarde.

Agradecemos o seu contato com a AtivaStock.`;

  await enviarMensagem(to, texto);

}


// ==========================================
// SOLICITAÇÃO DE ORÇAMENTO
// ==========================================

async function tratarSolicitacaoOrcamento(to, texto) {

  console.log('SOLICITAÇÃO DE ORÇAMENTO IDENTIFICADA');

  console.log('Dados recebidos:');
  console.log(texto);

  const resposta = `Recebemos sua solicitação de orçamento.

Você está sendo direcionado para um atendente, que irá informar os valores, disponibilidade dos produtos e condições de entrega.

Por favor, aguarde. Nossa equipe dará continuidade ao seu atendimento.

Agradecemos o seu contato com a AtivaStock.`;

  await enviarMensagem(to, resposta);

}


// ==========================================
// VERIFICAÇÃO DO WEBHOOK
// ==========================================

app.get('/webhook', (req, res) => {

  console.log('REQUISIÇÃO DE VERIFICAÇÃO RECEBIDA');

  const mode = req.query['hub.mode'];

  const token = req.query['hub.verify_token'];

  const challenge = req.query['hub.challenge'];


  if (
    mode === 'subscribe' &&
    token === VERIFY_TOKEN
  ) {

    console.log('WEBHOOK_VERIFIED');

    return res
      .status(200)
      .send(challenge);

  }


  console.log('ERRO NA VERIFICAÇÃO DO WEBHOOK');

  return res.sendStatus(403);

});


// ==========================================
// RECEBER MENSAGEM
// ==========================================

app.post('/webhook', async (req, res) => {

  console.log('');
  console.log('======================================');
  console.log('WEBHOOK RECEBIDO');
  console.log('======================================');

  console.log(
    JSON.stringify(req.body, null, 2)
  );


  // Responde imediatamente para a Meta
  res.sendStatus(200);


  const value =
    req.body?.entry?.[0]?.changes?.[0]?.value;


  if (!value) {

    console.log(
      'Nenhum valor encontrado no webhook.'
    );

    return;

  }


  // ==========================================
  // STATUS DE MENSAGEM
  // ==========================================

  if (value.statuses) {

    console.log(
      'Webhook contém STATUS de mensagem.'
    );

    return;

  }


  // ==========================================
  // LOCALIZAR MENSAGEM
  // ==========================================

  const message = value.messages?.[0];


  if (!message) {

    console.log(
      'Nenhuma mensagem encontrada no webhook.'
    );

    return;

  }


  const from = message.from;


  console.log('');
  console.log('REMETENTE:', from);

  console.log(
    'TIPO DA MENSAGEM:',
    message.type
  );


  // ==========================================
  // MENSAGEM DE TEXTO
  // ==========================================

  if (message.type === 'text') {

    const texto = message.text.body.trim();

    console.log(
      'TEXTO RECEBIDO:',
      texto
    );


    // ==========================================
    // SOLICITAÇÃO DE ORÇAMENTO
    // ==========================================

    if (
      texto
        .toUpperCase()
        .includes('SOLICITAÇÃO DE ORÇAMENTO — ATIVA STOCK')
      ||
      texto
        .toUpperCase()
        .includes('SOLICITACAO DE ORCAMENTO — ATIVA STOCK')
      ||
      texto
        .toUpperCase()
        .includes('SOLICITACAO DE ORCAMENTO - ATIVA STOCK')
    ) {

      await tratarSolicitacaoOrcamento(
        from,
        texto
      );

      return;

    }


    // ==========================================
    // MENU PRINCIPAL
    // ==========================================

    if (
      texto.toLowerCase() === 'oi' ||
      texto.toLowerCase() === 'olá' ||
      texto.toLowerCase() === 'ola' ||
      texto.toLowerCase() === 'menu' ||
      texto.toLowerCase() === 'início' ||
      texto.toLowerCase() === 'inicio'
    ) {

      await enviarMenuPrincipal(from);

      return;

    }


    // ==========================================
    // OUTRAS MENSAGENS
    // ==========================================

    await enviarMensagem(
      from,
      'Olá! Para continuar seu atendimento, utilize o menu da AtivaStock.'
    );

    return;

  }


  // ==========================================
  // MENSAGEM INTERATIVA
  // ==========================================

  if (message.type === 'interactive') {

    console.log(
      'MENSAGEM INTERATIVA RECEBIDA'
    );


    // ==========================================
    // RESPOSTA DE BOTÃO
    // ==========================================

    if (message.interactive.type === 'button_reply') {

      const buttonId =
        message.interactive.button_reply.id;

      const buttonTitle =
        message.interactive.button_reply.title;


      console.log(
        'ID DO BOTÃO:',
        buttonId
      );

      console.log(
        'TÍTULO DO BOTÃO:',
        buttonTitle
      );


      // ==========================================
      // CONDIÇÕES COMERCIAIS
      // ==========================================

      if (
        buttonId === 'condicoes_comerciais' ||
        buttonTitle.toLowerCase().includes('condições comerciais')
      ) {

        await enviarCondicoesComerciais(from);

        return;

      }


      // ==========================================
      // VISUALIZAR CATÁLOGO
      // ==========================================

      if (
        buttonId === 'visualizar_catalogo' ||
        buttonTitle.toLowerCase().includes('visualizar catálogo') ||
        buttonTitle.toLowerCase().includes('visualizar catalogo')
      ) {

        await enviarCatalogo(from);

        return;

      }


      // ==========================================
      // FALAR COM ATENDENTE
      // ==========================================

      if (
        buttonId === 'falar_atendente' ||
        buttonTitle.toLowerCase().includes('falar com atendente')
      ) {

        await encaminharParaAtendente(from);

        return;

      }


      // ==========================================
      // MENU PRINCIPAL
      // ==========================================

      if (
        buttonId === 'menu_principal' ||
        buttonTitle.toLowerCase().includes('menu principal') ||
        buttonTitle.toLowerCase().includes('voltar ao menu')
      ) {

        await enviarMenuPrincipal(from);

        return;

      }


      console.log(
        'BOTÃO NÃO RECONHECIDO:',
        buttonId
      );

    }

  }

});


// ==========================================
// SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor AtivaStock rodando na porta ${PORT}`
  );

});