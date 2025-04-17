const axios = require('axios');

const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
const dataExtensionKey = 'ruleta_final'; // 👈 usamos la CLAVE externa, no el ID
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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, premio } = req.body;

  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  console.log(`📧 Email recibido: ${email} 🎁 Premio: ${premio}`);

  try {
    console.log("🔐 Obteniendo token...");
    const token = await obtenerToken();
    console.log("🔐 Token OK");

    console.log("🔍 Verificando existencia de la DE...");
    const verificacion = await verificarDEExiste(token);
    console.log("✅ Verificación de DE OK:", verificacion);

    const payload = [{
      keys: { email },
      values: { premio }
    }];

    const url = `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`;
    console.log("📦 Payload a enviar:", JSON.stringify(payload, null, 2));
    console.log("🚀 Enviando a URL:", url);

    const insertResponse = await axios.post(
  `${restUrl}/data/v1/customobjectdata/rowset?CustomerKey=${dataExtensionKey}`,
  payload,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

    console.log("✅ Registro guardado:", insertResponse.data);
    res.status(200).json({ mensaje: 'Premio guardado correctamente.', resultado: insertResponse.data });

  } catch (error) {
    console.error("🔥 ERROR DETECTADO:", {
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
