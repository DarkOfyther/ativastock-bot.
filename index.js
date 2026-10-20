const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;


// ==========================================
// CONFIGURAÇÕES
// ==========================================

const GRAPH_API_URL =
  `https://graph.facebook.com/v26.0/${PHONE_NUMBER_ID}/messages`;


// ==========================================
// ENVIAR TEXTO
// ==========================================

async function enviarTexto(to, texto) {

  try {

    console.log('Enviando texto para:', to);

    const response = await axios.post(

      GRAPH_API_URL,

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
      'TEXTO ENVIADO:',
      JSON.stringify(response.data, null, 2)
    );

  } catch (error) {

    console.error('ERRO AO ENVIAR TEXTO:');

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
// ENVIAR TEMPLATE
// ==========================================

async function enviarTemplate(to) {

  try {

    console.log('Enviando template para:', to);

    const response = await axios.post(

      GRAPH_API_URL,

      {
        messaging_product: 'whatsapp',

        to: to,

        type: 'template',

        template: {

          name: 'ativastock_menu_principal',

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

async function enviarCondicoes(to) {

  const texto = `CONDIÇÕES COMERCIAIS

• Pedido mínimo: R$ 750,00 + frete.

• Mix de produtos: você pode combinar diferentes produtos e quantidades no mesmo pedido.

• Preços: trabalhamos com faixas de preço conforme a quantidade adquirida de cada produto.

• Disponibilidade: os produtos estão sujeitos à confirmação de estoque no dia do pedido. Cores e variações conforme disponibilidade.

• Pagamento: após a confirmação do orçamento, enviaremos o link de pagamento.

Formas de pagamento:
- Boleto à vista
- Pix
- Crédito à vista ou parcelado
- Débito

Juros do parcelamento por conta do comprador.

• Entrega: frete FOB, de responsabilidade do comprador.

• O frete é calculado separadamente conforme o destino.

• Os prazos são informados no fechamento do pedido, após consulta da disponibilidade dos produtos.

Para voltar ao menu principal, envie "menu".`;

  await enviarTexto(to, texto);

}


// ==========================================
// CATÁLOGO
// ==========================================

async function enviarCatalogo(to) {

  const texto = `VISUALIZAR CATÁLOGO

Conheça nossa seleção de produtos para revenda, organizada por categoria para facilitar sua escolha.

Nosso catálogo é atualizado periodicamente e conta com diversas opções para seu negócio.

INFORMAÇÕES IMPORTANTES:

• Possibilidade de combinar diferentes produtos no mesmo pedido.

• Pedido mínimo de R$ 750,00 + frete.

• Produtos sujeitos à disponibilidade de estoque.

Acesse nosso catálogo:

https://www.ativastock.com.br

Após escolher os produtos, você poderá solicitar seu orçamento diretamente pelo site.

Para voltar ao menu principal, envie "menu".`;

  await enviarTexto(to, texto);

}


// ==========================================
// SOLICITAR ORÇAMENTO
// ==========================================

async function enviarOrcamento(to) {

  const texto = `SOLICITAÇÃO DE ORÇAMENTO

Para solicitar seu orçamento, acesse nosso catálogo:

https://www.ativastock.com.br

Escolha os produtos desejados, informe as quantidades e adicione os itens ao carrinho.

Após concluir sua seleção, o site irá gerar automaticamente a solicitação de orçamento para envio pelo WhatsApp.

Nossa equipe receberá sua solicitação e dará continuidade ao atendimento.

Para voltar ao menu principal, envie "menu".`;

  await enviarTexto(to, texto);

}


// ==========================================
// FALAR COM ATENDENTE
// ==========================================

async function enviarAtendente(to) {

  const texto = `ATENDIMENTO

Você está sendo direcionado para um atendente.

Descreva brevemente o assunto do seu atendimento. Sua mensagem será encaminhada para nossa equipe, que responderá assim que possível.

Agradecemos o seu contato.`;

  await enviarTexto(to, texto);

}


// ==========================================
// MENU POR TEXTO
// ==========================================

async function processarTexto(to, texto) {

  const mensagem = texto
    .toLowerCase()
    .trim();

  console.log('Mensagem normalizada:', mensagem);


  // -------------------------------
  // SAUDAÇÃO
  // -------------------------------

  if (
    mensagem === 'oi' ||
    mensagem === 'olá' ||
    mensagem === 'ola' ||
    mensagem === 'menu' ||
    mensagem === 'início' ||
    mensagem === 'inicio'
  ) {

    await enviarTemplate(to);

    return;
  }


  // -------------------------------
  // CONDIÇÕES COMERCIAIS
  // -------------------------------

  if (
    mensagem.includes('condições') ||
    mensagem.includes('condicoes') ||
    mensagem.includes('comerciais')
  ) {

    await enviarCondicoes(to);

    return;
  }


  // -------------------------------
  // CATÁLOGO
  // -------------------------------

  if (
    mensagem.includes('catálogo') ||
    mensagem.includes('catalogo')
  ) {

    await enviarCatalogo(to);

    return;
  }


  // -------------------------------
  // ORÇAMENTO
  // -------------------------------

  if (
    mensagem.includes('orçamento') ||
    mensagem.includes('orcamento')
  ) {

    await enviarOrcamento(to);

    return;
  }


  // -------------------------------
  // ATENDENTE
  // -------------------------------

  if (
    mensagem.includes('atendente') ||
    mensagem.includes('atendimento')
  ) {

    await enviarAtendente(to);

    return;
  }


  // -------------------------------
  // NÃO ENTENDEU
  // -------------------------------

  await enviarTexto(
    to,
    `Não consegui identificar sua opção.

Envie "menu" para visualizar as opções disponíveis.`
  );

}


// ==========================================
// PROCESSAR BOTÃO DO TEMPLATE
// ==========================================

async function processarBotao(to, buttonId, buttonText) {

  console.log('');
  console.log('======================================');
  console.log('BOTÃO CLICADO');
  console.log('======================================');

  console.log('ID:', buttonId);
  console.log('TEXTO:', buttonText);


  // ---------------------------------------
  // CONDIÇÕES COMERCIAIS
  // ---------------------------------------

  if (
    buttonId === 'condicoes_comerciais' ||
    buttonText.toLowerCase().includes('condições') ||
    buttonText.toLowerCase().includes('condicoes')
  ) {

    await enviarCondicoes(to);

    return;
  }


  // ---------------------------------------
  // CATÁLOGO
  // ---------------------------------------

  if (
    buttonId === 'visualizar_catalogo' ||
    buttonText.toLowerCase().includes('catálogo') ||
    buttonText.toLowerCase().includes('catalogo')
  ) {

    await enviarCatalogo(to);

    return;
  }


  // ---------------------------------------
  // ORÇAMENTO
  // ---------------------------------------

  if (
    buttonId === 'solicitar_orcamento' ||
    buttonText.toLowerCase().includes('orçamento') ||
    buttonText.toLowerCase().includes('orcamento')
  ) {

    await enviarOrcamento(to);

    return;
  }


  // ---------------------------------------
  // ATENDENTE
  // ---------------------------------------

  if (
    buttonId === 'falar_atendente' ||
    buttonText.toLowerCase().includes('atendente')
  ) {

    await enviarAtendente(to);

    return;
  }


  // ---------------------------------------
  // FALLBACK
  // ---------------------------------------

  await enviarTexto(
    to,
    'Não consegui identificar essa opção. Envie "menu" para voltar ao menu principal.'
  );

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
// RECEBER WEBHOOK
// ==========================================

app.post('/webhook', async (req, res) => {

  console.log('');
  console.log('======================================');
  console.log('WEBHOOK RECEBIDO');
  console.log('======================================');

  console.log(
    JSON.stringify(req.body, null, 2)
  );


  // ---------------------------------------
  // RESPONDE IMEDIATAMENTE PARA A META
  // ---------------------------------------

  res.sendStatus(200);


  const value =
    req.body?.entry?.[0]?.changes?.[0]?.value;


  if (!value) {

    console.log(
      'Nenhum value encontrado no webhook.'
    );

    return;
  }


  // ========================================
  // VERIFICAR MENSAGEM
  // ========================================

  const message =
    value.messages?.[0];


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


  // ========================================
  // MENSAGEM DE TEXTO
  // ========================================

  if (message.type === 'text') {

    const texto =
      message.text?.body || '';


    console.log(
      'TEXTO RECEBIDO:',
      texto
    );


    await processarTexto(
      from,
      texto
    );


    return;
  }


  // ========================================
  // BOTÃO CLICADO
  // ========================================

  if (message.type === 'button') {

    const buttonText =
      message.button?.text || '';

    const buttonId =
      message.button?.payload || '';


    console.log(
      'BOTÃO RECEBIDO:',
      buttonText
    );

    console.log(
      'PAYLOAD:',
      buttonId
    );


    await processarBotao(
      from,
      buttonId,
      buttonText
    );


    return;
  }


  // ========================================
  // BOTÃO INTERATIVO
  // ========================================

  if (message.type === 'interactive') {

    const interactive =
      message.interactive;


    // --------------------------------------
    // REPLY BUTTON
    // --------------------------------------

    if (
      interactive?.type === 'button_reply'
    ) {

      const buttonId =
        interactive.button_reply?.id || '';

      const buttonText =
        interactive.button_reply?.title || '';


      console.log(
        'BOTÃO INTERATIVO:',
        buttonText
      );

      console.log(
        'ID:',
        buttonId
      );


      await processarBotao(
        from,
        buttonId,
        buttonText
      );


      return;
    }


    // --------------------------------------
    // LIST REPLY
    // --------------------------------------

    if (
      interactive?.type === 'list_reply'
    ) {

      const buttonId =
        interactive.list_reply?.id || '';

      const buttonText =
        interactive.list_reply?.title || '';


      console.log(
        'ITEM DA LISTA:',
        buttonText
      );

      console.log(
        'ID:',
        buttonId
      );


      await processarBotao(
        from,
        buttonId,
        buttonText
      );


      return;
    }

  }


  console.log(
    'Tipo de mensagem ainda não tratado:',
    message.type
  );

});


// ==========================================
// SERVIDOR
// ==========================================

const PORT =
  process.env.PORT || 3000;


app.listen(PORT, () => {

  console.log(
    `Servidor AtivaStock rodando na porta ${PORT}`
  );

});