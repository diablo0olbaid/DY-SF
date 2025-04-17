const axios = require('axios');

// ========================
// CONFIGURACIÓN
// ========================
const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
const dataExtensionKey = 'ruleta_final';
const mid = '534014774'; // MID de la BU E-commerce

// ========================
// FUNCIONES AUXILIARES
// ========================

async function obtenerToken() {
  try {
    const response = await axios.post(authUrl, {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      account_id: mid
    });

    console.log('🔐 Token generado correctamente');
    return response.data.access_token;

  } catch (error) {
    console.error('❌ Error al obtener el token de acceso', {
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}

async function verificarDEExiste(token) {
  try {
    const response = await axios.get(
      `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Verificación de DE:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Falló la verificación de la DE:", {
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}

async function guardarPremio(email, premio, token) {
  const payload = [
    {
      keys: { Email: Email },
      values: { Premio: Premio }
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

// ========================
// HANDLER PRINCIPAL
// ========================

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Aseguramos compatibilidad tanto con middleware como sin body-parser
    const body = req.body || JSON.parse(await new Promise(resolve => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
    }));

    const { email, premio } = body;

    console.log("📨 Email recibido:", email || '[undefined]', "🎁 Premio:", premio || '[undefined]');

    if (!email || !premio) {
      return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
    }

    const token = await obtenerToken();
    await verificarDEExiste(token); // Paso opcional si querés validar antes
    const resultado = await guardarPremio(email, premio, token);

    console.log("✅ Registro insertado:", resultado);

    return res.status(200).json({
      mensaje: 'Premio guardado exitosamente en la DE.',
      resultado
    });

  } catch (error) {
    console.error('🔥 ERROR DETECTADO:', {
      mensaje: error.message,
      stack: error.stack,
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
