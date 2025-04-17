const axios = require('axios');

// TUS CREDENCIALES
const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const mid = '534014774';
const dataExtensionKey = 'ruleta_final';

// ENDPOINTS REALES
const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';

async function obtenerToken() {
  const { data } = await axios.post(authUrl, {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    account_id: mid
  });
  return data.access_token;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, premio } = req.body;

  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  console.log(`📨 Email recibido: ${email} 🎁 Premio: ${premio}`);

  try {
    console.log('🔐 Obteniendo token...');
    const token = await obtenerToken();
    console.log('✅ Token obtenido');

    console.log('📦 Enviando datos a DE...');
    const payload = [{
      keys: { Email: email },
      values: { Premio: premio }
    }];

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

    console.log('✅ Datos enviados correctamente:', response.data);

    res.status(200).json({ mensaje: 'Premio guardado en Salesforce', resultado: response.data });

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
