import mercadopago from 'mercadopago';

// Configura el SDK con el access token
mercadopago.configure({
  access_token: 'TEST-1325166805807730-051213-0c3870e25dabd690bcef409501e8a5ef-49653667'
});

// Exporta la public key para usarla en el frontend
export const mercadoPagoPublicKey = 'TEST-7045f20f-db86-4a4c-9836-f91492988de5';

console.log('Public Key:', mercadoPagoPublicKey);

export default mercadopago;