const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { email, premio } = req.body;

  // Configuración de Marketing Cloud
  const clientId = '8w7vukn7qtlgn6siav8pg002';
  const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
  const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
  const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
  const dataExtensionKey = 'ruleta_prueba';

  try {
    // Paso 1: Obtener token de acceso
    const tokenResponse = await axios.post(authUrl, {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });

    const accessToken = tokenResponse.data.access_token;

    // Paso 2: Enviar datos a la DE
    const insertUrl = `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`;

    const payload = [
      {
        keys: { Email: email },
        values: { Premio: premio }
      }
    ];

    await axios.post(insertUrl, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Error al guardar en la DE' });
  }
};
