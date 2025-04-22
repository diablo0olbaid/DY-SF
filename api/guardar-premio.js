import axios from 'axios';
import { xml2js } from 'xml-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, premio } = req.body;

  if (!email || !premio) {
    return res.status(400).json({ error: 'Faltan datos: email y premio son obligatorios.' });
  }

  try {
    // 🔑 Autenticación
    const authResponse = await axios.post(
      'https://mcj90l2mmyz5mnccv2qp30ywn8r0.auth.marketingcloudapis.com/v2/token',
      {
        grant_type: 'client_credentials',
        client_id: 'w9urf492nliivr2agtavmc4c',
        client_secret: 'fxwLyTn9Tkq0eRi5xaF0mdnA'
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const accessToken = authResponse.data.access_token;

    // 🧼 Armar cuerpo SOAP
    const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema">
        <soapenv:Header>
          <fueloauth>${accessToken}</fueloauth>
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

    const soapResponse = await axios.post(
      'https://mcj90l2mmyz5mnccv2qp30ywn8r0.soap.marketingcloudapis.com/Service.asmx',
      soapBody,
      {
        headers: {
          'Content-Type': 'text/xml',
          SOAPAction: 'Create'
        }
      }
    );

    // 🔍 Procesar respuesta SOAP (simplemente confirmamos éxito)
    const parsed = xml2js(soapResponse.data, { compact: true });
    const status = parsed['soap:Envelope']['soap:Body'].CreateResponse.OverallStatus._text;

    if (status === 'OK') {
      return res.status(200).json({ success: true, message: 'Registro insertado correctamente.' });
    } else {
      return res.status(500).json({ error: 'Error en la creación del registro.', status });
    }

  } catch (error) {
    console.error('🔥 ERROR:', error.message);
    return res.status(500).json({ error: 'Hubo un error en el servidor', detalle: error.message });
  }
}
