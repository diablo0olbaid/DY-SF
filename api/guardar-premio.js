const axios = require('axios');

const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const authUrl = 'https://mcj9012mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj9012mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
const dataExtensionKey = 'ruleta_final';
const mid = '534014774'; // BU E-commerce

async function obtenerToken() {
  console.log("🔐 Obteniendo token...");
  const response = await axios.post(authUrl, {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    account_id: mid
  });

  console.log("🟢 Token obtenido");
  return response.data.access_token;
}

async function verificarDEExiste(token) {
  console.log("📦 Verificando existencia de la DE...");

  const response = await axios.get(
    `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log("✅ DE encontrada (verificación por lectura).");
  return response.data;
}

async function guardarPremio(email, premio) {
  const token = await obtenerToken();

  await verificarDEExiste(token);

  const payload = [
    {
      keys: {
        "Email": email // Respeta el nombre exacto de la clave
      },
      values: {
        "Premio": premio
      }
    }
  ];

  console.log("📤 Enviando payload a:", `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

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

  const { email, premio } = req.body;

  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  try {
    console.log(`📨 Email recibido: ${email} 🎁 Premio: ${premio}`);

    const resultado = await guardarPremio(email, premio);

    res.status(200).json({
      mensaje: 'Premio guardado correctamente en la DE',
      resultado
    });
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
