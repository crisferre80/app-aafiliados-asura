import axios from 'axios';

const mercadoPagoClient = axios.create({
    baseURL: 'https://api.mercadopago.com',
    headers: {
        Authorization: `Bearer APP_USR-1325166805807730-051213-66f0e846e0ce80064673923c24ebf410-49653667`,
    },
});

export default mercadoPagoClient;
