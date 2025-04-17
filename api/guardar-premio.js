const axios = require('axios');

const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
const dataExtensionKey = 'ruleta_final';
const mid = '534014774'; // Business Unit E-commerce

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
      keys: {
        Email: email // IMPORTANTE: respetar el nombre EXACTO del campo clave en la DE
      },
      values: {
        Premio: premio // IMPORTANTE: respetar el nombre EXACTO del atributo
      }
    }
  ];

  const url = `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`;

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, premio } = req.body;

  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  try {
    console.log('📨 Email recibido:', email, '🎁 Premio:', premio);

    const resultado = await guardarPremio(email, premio);

    res.status(200).json({
      mensaje: 'Premio guardado correctamente.',
      resultado
    });
  } catch (error) {
    console.error('🔥 ERROR DETECTADO:', {
      mensaje: error.message,
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
