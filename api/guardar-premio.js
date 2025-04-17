const axios = require('axios');

// === CREDENCIALES DE SFMC ===
const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const mid = '534014774';
const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';

// ID REAL de la DE (no key)
const customObjectId = 'ea0c8a60-941b-f011-ba80-f40343d01ab8';

// === FUNCIÓN PARA OBTENER TOKEN ===
async function obtenerToken() {
  console.log('🔐 Obteniendo token...');
  const response = await axios.post(authUrl, {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    account_id: mid
  });
  console.log('✅ Token obtenido');
  return response.data.access_token;
}

// === HANDLER PRINCIPAL ===
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, premio } = req.body;

  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  try {
    console.log('📨 Email recibido:', email, '🎁 Premio:', premio);
    const token = await obtenerToken();

    const payload = [
      {
        keys: { email },
        values: { premio }
      }
    ];

    console.log('📦 Payload a enviar:', JSON.stringify(payload, null, 2));
    const url = `${restUrl}/data/v1/customobjectdata/${customObjectId}/rowset`;
    console.log('🚀 Enviando a URL:', url);

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({ mensaje: 'Registro insertado correctamente', resultado: response.data });

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
