const axios = require('axios');

const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
const dataExtensionKey = 'ruleta_final';
const mid = '534014774';

async function obtenerToken() {
  console.log("🔐 Obteniendo token...");
  const response = await axios.post(authUrl, {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    account_id: mid
  });
  console.log("✅ Token obtenido");
  return response.data.access_token;
}

async function verificarDE(token) {
  console.log("🔍 Verificando existencia de la DE...");
  try {
    const response = await axios.get(`${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("✅ DE encontrada (verificación por lectura).");
    return response.data;
  } catch (error) {
    console.warn("⚠️  No se pudieron obtener campos de la DE");
    throw error;
  }
}

async function guardarPremio(email, premio) {
  const token = await obtenerToken();

  await verificarDE(token);

  const payload = [{
    keys: { Email: email },
    values: { Premio: premio }
  }];

  const url = `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`;

  console.log("🚀 Enviando payload a:", url);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log("✅ Registro guardado correctamente.");
  return response.data;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, premio } = req.body;

  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  console.log("📨 Email recibido:", email, "🎁 Premio:", premio);

  try {
    const resultado = await guardarPremio(email, premio);
    res.status(200).json({ ok: true, resultado });
  } catch (error) {
    console.error("🔥 ERROR DETECTADO:", {
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
