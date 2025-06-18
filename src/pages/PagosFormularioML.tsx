import { useState } from 'react';
import axios from 'axios';
import './PagosFormularioML.css';

const PagosFormularioML = () => {
    const [amount, setAmount] = useState(0);
    const [email, setEmail] = useState('');
    const [paymentLink, setPaymentLink] = useState('');

    const handlePayment = async () => {
        try {
            const response = await axios.post('https://api.mercadopago.com/v1/payments', {
                transaction_amount: amount,
                description: 'Cuota sindical mensual',
                payment_method_id: 'visa',
                payer: {
                    email: email,
                },
            }, {
                headers: {
                    Authorization: `Bearer APP_USR-1325166805807730-051213-66f0e846e0ce80064673923c24ebf410-49653667`,
                },
            });

            setPaymentLink(response.data.init_point);
        } catch (error) {
            console.error('Error al generar el pago:', error);
        }
    };

    const handlePaymentCoupon = async () => {
        try {
            const response = await axios.post('https://api.mercadopago.com/v1/payments', {
                transaction_amount: amount,
                description: 'Cuota sindical mensual',
                payment_method_id: 'rapipago',
                payer: {
                    email: email,
                },
            }, {
                headers: {
                    Authorization: `Bearer APP_USR-1325166805807730-051213-66f0e846e0ce80064673923c24ebf410-49653667`,
                },
            });

            console.log('Respuesta de la API:', response.data);

            setPaymentLink(response.data.init_point);
        } catch (error) {
            console.error('Error al generar el cupón de pago:', error);
        }
    };

    const handleCreatePaymentPlan = async () => {
        try {
            const response = await axios.post('https://api.mercadopago.com/preapproval', {
                preapproval_plan_id: '2c938084726fca480172750000000000',
                reason: 'Yoga classes',
                external_reference: 'YG-1234',
                payer_email: email,
                card_token_id: 'e3ed6f098462036dd2cbabe314b9de2a',
                auto_recurring: {
                    frequency: 1,
                    frequency_type: 'months',
                    start_date: new Date().toISOString(),
                    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                    transaction_amount: amount,
                    currency_id: 'ARS',
                },
                back_url: 'https://www.mercadopago.com.ar',
                status: 'authorized',
            }, {
                headers: {
                    Authorization: `Bearer APP_USR-1325166805807730-051213-66f0e846e0ce80064673923c24ebf410-49653667`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Plan de pago creado:', response.data);
        } catch (error) {
            console.error('Error al crear el plan de pago:', error);
        }
    };

    const handleGenerateQR = async () => {
        try {
            const userId = 'APP_USR-7a7af73e-7f2d-4507-9ff3-5b04d437eee4'; // Reemplaza con el ID de usuario correcto
            const externalId = `cuota-${Date.now()}`; // Generar un ID único para la cuota

            const response = await axios.post(`https://api.mercadopago.com/mpmobile/instore/qr/${userId}/${externalId}`, {
                transaction_amount: amount,
                description: 'Cuota sindical mensual',
                external_reference: externalId,
                payer_email: email,
            }, {
                headers: {
                    Authorization: `Bearer APP_USR-1325166805807730-051213-66f0e846e0ce80064673923c24ebf410-49653667`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Código QR generado:', response.data);
        } catch (error) {
            console.error('Error al generar el código QR:', error);
        }
    };

    return (
        <div className="payment-page">
            <header className="payment-header">
                <h1>Pago de Cuotas Sindicales</h1>
                <p>Realiza tus pagos de manera rápida y segura</p>
            </header>
            <main className="payment-main">
                <div className="payment-form">
                    <label>
                        Monto:
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            required
                        />
                    </label>
                    <label>
                        Correo electrónico:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <div className="payment-buttons">
                        <button className="btn-primary" onClick={handlePayment}>Generar Pago</button>
                        <button className="btn-secondary" onClick={handlePaymentCoupon}>Generar Cupón de Pago</button>
                        <button className="btn-primary" onClick={handleCreatePaymentPlan}>Crear Plan de Pago</button>
                        <button className="btn-secondary" onClick={handleGenerateQR}>Generar Código QR</button>
                    </div>
                </div>
                {paymentLink && (
                    <div className="payment-link">
                        <p>Enlace de pago generado:</p>
                        <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="btn-link">
                            Pagar ahora
                        </a>
                    </div>
                )}
                <div className="subscription-section">
                    <a href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c938084977ea8f0019780da04a300fa" className="btn-subscribe">Suscribirme</a>
                </div>
            </main>
            <footer className="payment-footer">
                <img src="/public/logo-placeholder.png" alt="Logo" className="footer-logo" />
                <p>© 2025 Sindicato ASURA. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default PagosFormularioML;
