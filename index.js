const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());


// ======================================================
// CONFIGURAÇÕES
// ======================================================

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

const GRAPH_API_VERSION = 'v26.0';


// ======================================================
// TEMPLATES
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
    console.log('ENVIANDO MENSAGEM DE TEXTO');
    console.log('Destinatário:', to);


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

    console.error('');
    console.error('ERRO AO ENVIAR MENSAGEM DE TEXTO:');


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
// PROCESSAR OPÇÃO DO MENU
// ======================================================

async function processarOpcao(from, opcao) {

  const texto = normalizarTexto(opcao);


  console.log('');
  console.log('OPÇÃO IDENTIFICADA:', opcao);
  console.log('OPÇÃO NORMALIZADA:', texto);


  // ====================================================
  // MENU PRINCIPAL
  // ====================================================

  if (

  texto === 'oi' ||
  texto === 'ola' ||
  texto === 'menu' ||
  texto === 'inicio' ||
  texto === 'menu principal' ||
  texto === 'voltar ao menu' ||
  texto === 'voltar para o menu principal' ||
  texto === 'voltar menu'

) {

    await enviarTemplate(
      from,
      TEMPLATES.menu
    );

    return true;

  }


  // ====================================================
  // CONDIÇÕES COMERCIAIS
  // ====================================================

  if (

    texto === 'condicoes comerciais'

  ) {

    await enviarTemplate(
      from,
      TEMPLATES.condicoes
    );

    return true;

  }


  // ====================================================
  // CATÁLOGO
  // ====================================================

  if (

    texto === 'visualizar catalogo' ||
    texto === 'catalogo'

  ) {

    await enviarTemplate(
      from,
      TEMPLATES.catalogo
    );

    return true;

  }


  // ====================================================
  // ATENDENTE
  // ====================================================

  if (

    texto === 'falar com atendente' ||
    texto === 'atendente'

  ) {

    await enviarTemplate(
      from,
      TEMPLATES.atendente
    );

    return true;

  }


  return false;

}


// ======================================================
// VERIFICAÇÃO DO WEBHOOK
// ======================================================

app.get('/webhook', (req, res) => {

  console.log('');
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


  // ====================================================
  // RESPONDER META IMEDIATAMENTE
  // ====================================================

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
  // VERIFICAR MENSAGEM
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


  // ======================================================
  // MENSAGEM DE TEXTO
  // ======================================================

  if (message.type === 'text') {

    const textoOriginal =
      message.text?.body || '';


    console.log(
      'TEXTO RECEBIDO:',
      textoOriginal
    );


    const processado =
      await processarOpcao(
        from,
        textoOriginal
      );


    if (processado) {

  return;

}


// ====================================================
// MENSAGEM NÃO RECONHECIDA
// RETORNAR AO MENU PRINCIPAL
// ====================================================

console.log(
  'Mensagem não reconhecida. Retornando ao menu principal.'
);

await enviarTemplate(
  from,
  TEMPLATES.menu
);

return;

  }


  // ======================================================
  // BOTÃO
  // ======================================================

  if (message.type === 'button') {

    const textoBotao =
      message.button?.text || '';

    const payloadBotao =
      message.button?.payload || '';


    console.log('');
    console.log('======================================');
    console.log('BOTÃO RECEBIDO');
    console.log('======================================');

    console.log(
      'Texto do botão:',
      textoBotao
    );

    console.log(
      'Payload do botão:',
      payloadBotao
    );


    // Primeiro tenta o payload
    let processado = false;


    if (payloadBotao) {

      processado =
        await processarOpcao(
          from,
          payloadBotao
        );

    }


    // Se o payload não funcionar,
    // tenta o texto visível do botão

    if (!processado && textoBotao) {

      processado =
        await processarOpcao(
          from,
          textoBotao
        );

    }


    if (processado) {

      return;

    }


    console.log(
      'Botão não reconhecido.'
    );


    await enviarMensagem(

      from,

      'Não consegui identificar essa opção. Por favor, envie "oi" para acessar o menu principal.'

    );


    return;

  }


  // ======================================================
  // MENSAGEM INTERATIVA
  // ======================================================

  if (message.type === 'interactive') {

    console.log('');
    console.log('======================================');
    console.log('INTERAÇÃO RECEBIDA');
    console.log('======================================');


    // ----------------------------------------------
    // REPLY BUTTON
    // ----------------------------------------------

    if (message.interactive?.type === 'button_reply') {

      const buttonReply =
        message.interactive.button_reply;


      const id =
        buttonReply?.id || '';

      const title =
        buttonReply?.title || '';


      console.log(
        'ID DO BOTÃO:',
        id
      );

      console.log(
        'TÍTULO DO BOTÃO:',
        title
      );


      let processado = false;


      // Primeiro tenta o ID
      if (id) {

        processado =
          await processarOpcao(
            from,
            id
          );

      }


      // Depois tenta o título
      if (!processado && title) {

        processado =
          await processarOpcao(
            from,
            title
          );

      }


      if (processado) {

        return;

      }


      await enviarMensagem(

        from,

        'Não consegui identificar essa opção. Por favor, envie "oi" para acessar o menu principal.'

      );


      return;

    }


    // ----------------------------------------------
    // LIST REPLY
    // ----------------------------------------------

    if (message.interactive?.type === 'list_reply') {

      const listReply =
        message.interactive.list_reply;


      const id =
        listReply?.id || '';

      const title =
        listReply?.title || '';


      console.log(
        'ID DA LISTA:',
        id
      );

      console.log(
        'TÍTULO DA LISTA:',
        title
      );


      let processado = false;


      if (id) {

        processado =
          await processarOpcao(
            from,
            id
          );

      }


      if (!processado && title) {

        processado =
          await processarOpcao(
            from,
            title
          );

      }


      if (processado) {

        return;

      }


      await enviarMensagem(

        from,

        'Não consegui identificar essa opção. Por favor, envie "oi" para acessar o menu principal.'

      );


      return;

    }


    console.log(
      'Tipo de interação não tratado:',
      message.interactive?.type
    );


    return;

  }


  // ======================================================
  // OUTROS TIPOS
  // ======================================================

  console.log(
    'Tipo de mensagem não tratado:',
    message.type
  );

});


// ======================================================
// SERVIDOR
// ======================================================

const PORT =
  process.env.PORT || 3000;


app.listen(PORT, () => {

  console.log(
    `Servidor Ativa Stock rodando na porta ${PORT}`
  );

});