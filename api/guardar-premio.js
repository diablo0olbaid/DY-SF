const axios = require('axios');

const clientId = 'TU_CLIENT_ID';
const clientSecret = 'TU_CLIENT_SECRET';
const mid = 'TU_MID';
const authUrl = 'https://TU_SUBDOMAIN.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://TU_SUBDOMAIN.rest.marketingcloudapis.com';
const dataExtensionKey = 'ruleta_final';

async function obtenerToken() {
  const response = await axios.post(authUrl, {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    account_id: mid
  });

  return response.data.access_token;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, premio } = req.body;

  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  try {
    console.log('📨 Email recibido:', email, '🎁 Premio:', premio);

    const token = await obtenerToken();

    // Verificar DE (opcional pero útil)
    const verificacion = await axios.get(
      `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ DE verificada:', verificacion.data);

    const payload = [{
      keys: { Email: email },
      values: { Premio: premio }
    }];

    const respuesta = await axios.post(
      `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ mensaje: 'Registro guardado exitosamente', resultado: respuesta.data });
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
