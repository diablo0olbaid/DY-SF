import axios from 'axios';

const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const dataExtensionKey = 'ruleta_final';

async function obtenerToken() {
  const response = await axios.post(authUrl, {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });

  return response.data.access_token;
}

async function guardarPremio(email, premio) {
  const token = await obtenerToken();

  const payload = [
    {
      keys: { Email: email },
      values: { Premio: premio },
    },
  ];

  const config = {
    method: 'post',
    url: `${restUrl}/hub/v1/dataevents/key:${dataExtensionKey}/rowset`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  };

  const response = await axios(config);
  return response.data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, premio } = req.body;

  try {
    console.log("📨 Email recibido:", email, "🎁 Premio:", premio);

    const result = await guardarPremio(email, premio);

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('🔥 ERROR DETECTADO:', {
      mensaje: error.message,
      stack: error.stack,
      status: error.response?.status,
      data: error.response?.data,
    });

    res.status(500).json({
      error: 'Hubo un error en el servidor',
      detalle: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}
