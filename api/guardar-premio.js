const axios = require('axios');

const clientId = '8w7vukn7qtlgn6siav8pg002';
const clientSecret = 'TbSVFUuXTBf4HdDB8K0XQioC';
const authUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token';
const restUrl = 'https://mcj90l2mmyz5mnccv2qp30ywn8r0.rest.marketingcloudapis.com';
const dataExtensionKey = 'ruleta_final';
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

module.exports = async (req, res) => {
  try {
    const token = await obtenerToken();

    const response = await axios.get(
      `${restUrl}/data/v1/customobjectdata/key/${dataExtensionKey}/rowset`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      mensaje: '✅ La DE existe y respondió correctamente.',
      resultado: response.data
    });
  } catch (error) {
    console.error("❌ Error al consultar la DE:", {
      status: error.response?.status,
      data: error.response?.data,
      mensaje: error.message
    });

    res.status(500).json({
      error: 'No se pudo verificar la DE',
      detalle: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};
