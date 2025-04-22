import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, premio } = req.body;

  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  try {
    // 1. Obtener access token
    const { data: authData } = await axios.post(
      'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token',
      {
        grant_type: 'client_credentials',
        client_id: 'w9urf492nliivr2agtavmc4c',
        client_secret: 'fxwLyTn9Tkq0eRi5xaF0mdnA'
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const token = authData.access_token;

    // 2. Armar body XML SOAP
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soapenv:Header>
    <fueloauth xmlns="http://exacttarget.com">${token}</fueloauth>
  </soapenv:Header>
  <soapenv:Body>
    <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">
      <Objects xsi:type="DataExtensionObject">
        <CustomerKey>ruleta_final</CustomerKey>
        <Properties>
          <Property>
            <Name>email</Name>
            <Value>${email}</Value>
          </Property>
          <Property>
            <Name>premio</Name>
            <Value>${premio}</Value>
          </Property>
        </Properties>
      </Objects>
    </CreateRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

    // 3. Enviar request SOAP
    const { data: responseXml } = await axios.post(
      'https://mcj90l2mmyz5mnccv2qp30ywn8r0.soap.marketingcloudapis.com/Service.asmx',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml',
          'SOAPAction': 'Create'
        }
      }
    );

    // 4. Verificar si contiene <OverallStatus>OK</OverallStatus>
    if (responseXml.includes('<OverallStatus>OK</OverallStatus>')) {
      return res.status(200).json({ success: true, message: 'Registro insertado correctamente.' });
    } else {
      return res.status(500).json({ error: 'Error en la creación del registro.', detalle: responseXml });
    }

  } catch (error) {
    console.error('🔥 ERROR:', error.message);
    return res.status(500).json({
      error: 'Hubo un error en el servidor',
      detalle: error.message
    });
  }
}
