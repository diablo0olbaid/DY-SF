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

async function verificarDEExiste(token) {
  const response = await axios.get(
    `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

async function guardarPremio(email, premio, token) {
  const payload = [
    {
      keys: { Email: email },
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

  // Asegurar parseo correcto del body (especialmente en Vercel)
  const body = req.body || JSON.parse(await new Promise(resolve => {
    let data = ''
    req.on('data', chunk => data += chunk)
    req.on('end', () => resolve(data))
  }));

  const { email, premio } = body;

  try {
    console.log("📨 Email recibido:", email, "🎁 Premio:", premio);

    const result = await guardarPremio(email, premio);

    res.status(200).json({
      mensaje: 'Premio guardado exitosamente',
      resultado: result
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

