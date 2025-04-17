const axios = require('axios');

const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
const dataExtensionKey = 'ruleta_final';
const mid = '534014774';

async function obtenerToken() {
  const response = await axios.post(authUrl, {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    account_id: mid
  });

  return response.data.access_token;
}

async function guardarPremio(email, premio) {
  const token = await obtenerToken();

  const payload = [
    {
      keys: { SubscriberKey: email },   // 💥 EL CAMBIO
      values: { Premio: premio }
    }
  ];

  const response = await axios.post(
    `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { Email, Premio } = req.body;

  if (!Email || !Premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  try {
    console.log("📨 Email recibido:", Email, "🎁 Premio:", Premio);

    const resultado = await guardarPremio(Email, Premio);

    res.status(200).json({
      mensaje: 'Premio guardado con éxito',
      resultado
    });

  } catch (error) {
    console.error('🔥 ERROR DETECTADO:', {
      mensaje: error.message,
      stack: error.stack,
      status: error.response?.status,
      data: error.response?.data
    });

    res.status(500).json({
      error: 'Hubo un error en el servidor',
      detalle: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};
