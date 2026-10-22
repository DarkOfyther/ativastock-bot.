const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

const GRAPH_API_VERSION = 'v26.0';


// ======================================================
// IDS DOS TEMPLATES
// ======================================================

const TEMPLATES = {

  menu: {
    id: '4770516739844282',
    name: 'ativastock_menu_principal',
    language: 'pt_BR'
  },

  condicoes: {
    id: '1120628563713870',
    name: 'ativastock_condicoes_comerciais',
    language: 'pt_BR'
  },

  catalogo: {
    id: '1114521937976970',
    name: 'ativastock_catalogo',
    language: 'pt_BR'
  },

  atendente: {
    id: '1858199415615505',
    name: 'ativastock_atendente',
    language: 'pt_BR'
  },

  recebimentoOrcamento: {
    id: '2955667834790480',
    name: 'ativastock_orcamento_recebido',
    language: 'pt_BR'
  }

};


// ======================================================
// NORMALIZAR TEXTO
// ======================================================

function normalizarTexto(texto) {

  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

}


// ======================================================
// ENVIAR TEMPLATE
// ======================================================

async function enviarTemplate(to, template) {

  try {

    console.log('');
    console.log('======================================');
    console.log('ENVIANDO TEMPLATE');
    console.log('======================================');

    console.log('Destinatário:', to);
    console.log('Template:', template.name);
    console.log('Idioma:', template.language);
    console.log('ID:', template.id);

    const response = await axios.post(

      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,

      {
        messaging_product: 'whatsapp',

        to: to,

        type: 'template',

        template: {

          name: template.name,

          language: {
            code: template.language
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

    console.log('');
    console.log('TEMPLATE ENVIADO COM SUCESSO:');

    console.log(
      JSON.stringify(response.data, null, 2)
    );

    return response.data;

  } catch (error) {

    console.error('');
    console.error('======================================');
    console.error('ERRO AO ENVIAR TEMPLATE');
    console.error('======================================');

    if (error.response) {

      console.error(
        JSON.stringify(error.response.data, null, 2)
      );

    } else {

      console.error(error.message);

    }

  }

}


// ======================================================
// ENVIAR MENSAGEM DE TEXTO
// ======================================================

async function enviarMensagem(to, texto) {

  try {

    console.log('');
    console.log('Enviando mensagem de texto para:', to);

    const response = await axios.post(

      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,

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

    return response.data;

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


// ======================================================
// VERIFICAÇÃO DO WEBHOOK
// ======================================================

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


// ======================================================
// RECEBER WEBHOOK
// ======================================================

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
      'Nenhum value encontrado no webhook.'
    );

    return;

  }


  // ====================================================
  // STATUS DE MENSAGENS
  // ====================================================

  if (value.statuses) {

    console.log(
      'Webhook contém atualização de status.'
    );

    return;

  }


  // ====================================================
  // MENSAGEM RECEBIDA
  // ====================================================

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


  // ====================================================
  // BOTÕES INTERATIVOS
  // ====================================================

  if (message.type === 'interactive') {

    const interactive = message.interactive;

    console.log(
      'TIPO DO INTERACTIVE:',
      interactive?.type
    );


    // ==================================================
    // BOTÃO DE RESPOSTA
    // ==================================================

    if (interactive?.type === 'button_reply') {

      const buttonId =
        interactive.button_reply?.id || '';

      const buttonTitle =
        interactive.button_reply?.title || '';

      console.log(
        'ID DO BOTÃO:',
        buttonId
      );

      console.log(
        'TÍTULO DO BOTÃO:',
        buttonTitle
      );


      const opcao = normalizarTexto(
        `${buttonId} ${buttonTitle}`
      );


      // ================================================
      // VOLTAR PARA O MENU
      // ================================================

      if (
        opcao.includes('voltar_para_o_menu') ||
        opcao.includes('voltar_para_menu') ||
        opcao.includes('voltar_menu') ||
        opcao.includes('voltar para o menu') ||
        opcao.includes('voltar menu')
      ) {

        console.log(
          'BOTÃO VOLTAR AO MENU IDENTIFICADO'
        );

        await enviarTemplate(
          from,
          TEMPLATES.menu
        );

        return;

      }


      // ================================================
      // CONDIÇÕES COMERCIAIS
      // ================================================

      if (
        opcao.includes('condicoes_comerciais') ||
        opcao.includes('condicoes comerciais')
      ) {

        await enviarTemplate(
          from,
          TEMPLATES.condicoes
        );

        return;

      }


      // ================================================
      // CATÁLOGO
      // ================================================

      if (
        opcao.includes('catalogo') ||
        opcao.includes('catálogo')
      ) {

        await enviarTemplate(
          from,
          TEMPLATES.catalogo
        );

        return;

      }


      // ================================================
      // ATENDENTE
      // ================================================

      if (
        opcao.includes('atendente') ||
        opcao.includes('falar com atendente')
      ) {

        await enviarTemplate(
          from,
          TEMPLATES.atendente
        );

        return;

      }


      console.log(
        'Botão interativo não reconhecido.'
      );

      return;

    }

  }


  // ====================================================
  // MENSAGEM DO TIPO BUTTON
  // ====================================================

  if (message.type === 'button') {

    const buttonText =
      message.button?.text || '';

    const buttonPayload =
      message.button?.payload || '';

    console.log(
      'TEXTO DO BOTÃO:',
      buttonText
    );

    console.log(
      'PAYLOAD DO BOTÃO:',
      buttonPayload
    );


    const opcao = normalizarTexto(
      `${buttonText} ${buttonPayload}`
    );


    // ================================================
    // VOLTAR AO MENU
    // ================================================

    if (
      opcao.includes('voltar para o menu') ||
      opcao.includes('voltar menu') ||
      opcao.includes('voltar_para_o_menu') ||
      opcao.includes('voltar_menu')
    ) {

      console.log(
        'BOTÃO VOLTAR AO MENU IDENTIFICADO'
      );

      await enviarTemplate(
        from,
        TEMPLATES.menu
      );

      return;

    }

  }


  // ====================================================
  // MENSAGEM DE TEXTO
  // ====================================================

  if (message.type === 'text') {

    const textoOriginal =
      message.text?.body || '';

    const texto =
      normalizarTexto(textoOriginal);


    console.log(
      'TEXTO RECEBIDO:',
      textoOriginal
    );

    console.log(
      'Mensagem normalizada:',
      texto
    );


    // ================================================
    // MENU PRINCIPAL
    // ================================================

    if (
      texto === 'oi' ||
      texto === 'ola' ||
      texto === 'menu' ||
      texto === 'inicio'
    ) {

      await enviarTemplate(
        from,
        TEMPLATES.menu
      );

      return;

    }


    // ================================================
    // CONDIÇÕES COMERCIAIS
    // ================================================

    if (
      texto === 'condicoes comerciais'
    ) {

      await enviarTemplate(
        from,
        TEMPLATES.condicoes
      );

      return;

    }


    // ================================================
    // CATÁLOGO
    // ================================================

    if (
      texto === 'visualizar catalogo' ||
      texto === 'catalogo'
    ) {

      await enviarTemplate(
        from,
        TEMPLATES.catalogo
      );

      return;

    }


    // ================================================
    // ATENDENTE
    // ================================================

    if (
      texto === 'falar com atendente' ||
      texto === 'atendente'
    ) {

      await enviarTemplate(
        from,
        TEMPLATES.atendente
      );

      return;

    }


    // ================================================
    // VOLTAR AO MENU
    // ================================================

    if (
      texto === 'voltar ao menu' ||
      texto === 'menu principal'
    ) {

      await enviarTemplate(
        from,
        TEMPLATES.menu
      );

      return;

    }


    // ================================================
    // MENSAGEM NÃO RECONHECIDA
    // ================================================

    await enviarMensagem(
      from,
      'Não consegui identificar sua opção. Por favor, envie "oi" para acessar o menu principal.'
    );

    return;

  }


  // ====================================================
  // OUTROS TIPOS DE MENSAGEM
  // ====================================================

  console.log(
    'Tipo de mensagem não tratado:',
    message.type
  );

});


// ======================================================
// SERVIDOR
// ======================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor Ativa Stock rodando na porta ${PORT}`
  );

});