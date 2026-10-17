const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;


// ==========================================
// ENVIAR MENSAGEM PARA O WHATSAPP
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

    console.error(
      'ERRO AO ENVIAR MENSAGEM:'
    );

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


  const message =
    req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];


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

    const texto = message.text.body;

    console.log(
      'TEXTO RECEBIDO:',
      texto
    );


    await enviarMensagem(
      from,
      'Olá! 👋 A AtivaStock recebeu sua mensagem com sucesso!'
    );

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