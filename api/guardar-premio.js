// Archivo: /api/guardar-premio.js
const axios = require('axios');

// ⚙️ Configuración de credenciales y endpoints
const clientId = 'w9urf492nliivr2agtavmc4c';
const clientSecret = 'fxwLyTn9Tkq0eRi5xaF0mdnA';
const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
const dataExtensionKey = 'ruleta_final';

async function obtenerToken() {
  const response = await axios.post(authUrl, {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });
  return response.data.access_token;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, premio } = req.body;
  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  try {
    console.log('📩 Email recibido:', email, '🎁 Premio:', premio);
    console.log('🔐 Obteniendo token...');
    const token = await obtenerToken();
    console.log('🔐 Token OK');

    const payload = [{
      keys: { email },
      values: { premio }
    }];

    const url = `${restUrl}/data/v1/customobjectdata/rowset?CustomerKey=${dataExtensionKey}`;
    console.log('🚀 Enviando a URL:', url);
    console.log('📦 Payload a enviar:', JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registro insertado:', response.data);
    return res.status(200).json({ mensaje: 'Registro insertado correctamente.', resultado: response.data });
  } catch (error) {
    console.error('🔥 ERROR DETECTADO:', {
      mensaje: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return res.status(500).json({
      error: 'Hubo un error en el servidor',
      detalle: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};
