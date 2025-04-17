import axios from 'axios';

const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
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

async function guardarPremio(email, premio) {
  const token = await obtenerToken();

  const body = [
    {
      keys: {
        Email: email
      },
      values: {
        Premio: premio
      }
    }
  ];

  const response = await axios.post(
    `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, premio } = req.body;

  try {
    const result = await guardarPremio(email, premio);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('💥 ERROR al guardar el premio:', error.response?.data || error.message || error);
    res.status(500).json({
      error: 'Hubo un error en el servidor',
      detalle: error.response?.data || error.message || 'Error desconocido'
    });
  }
}
