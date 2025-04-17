const axios = require('axios');

// 🔐 Credenciales y configuración
const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
const dataExtensionKey = 'ruleta_final';
const mid = '534014774'; // Business Unit

// 🔑 Obtener token de acceso
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

// 🧪 Verificar existencia de la DE
async function verificarDE(token) {
  console.log('🔍 Verificando existencia de la DE...');
  const response = await axios.get(
    `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  console.log('📦 DE encontrada (verificación por lectura).');
  return response.data;
}

// 🚀 Guardar premio en la DE
async function guardarPremio(token, email, premio) {
  const payload = [
    {
      keys: { Email: email },
      values: { Premio: premio }
    }
  ];

  const endpoint = `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`;
  console.log('📤 Enviando payload a:', endpoint);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  const response = await axios.post(endpoint, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('✅ Premio guardado correctamente en la DE.');
  return response.data;
}

// 🌐 Handler principal
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, premio } = req.body;

  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  console.log('📨 Email recibido:', email, '🎁 Premio:', premio);

  try {
    const token = await obtenerToken();
    await verificarDE(token);
    const result = await guardarPremio(token, email, premio);

    res.status(200).json({
      mensaje: 'Premio guardado con éxito.',
      resultado: result
    });

  } catch (error) {
    console.error('🔥 ERROR DETECTADO:', {
      mensaje: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Hubo un error en el servidor',
      detalle: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};
