import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/PaymentResult.css';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your payment, please do not close this window.');

    const pidx = searchParams.get('pidx');
    const khaltiStatus = searchParams.get('status');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!pidx) {
                setStatus('error');
                setMessage('Invalid payment reference.');
                return;
            }

            try {
                const res = await api.post('/payment/khalti/verify', { pidx });

                if (res.data.success) {
                    setStatus('success');
                    setMessage('Payment successful! Your new project has been added to your dashboard.');
                    // Redirect after a few seconds
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 5000);
                } else {
                    setStatus('error');
                    setMessage(res.data.message || 'Payment verification failed.');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setStatus('error');
                setMessage(err.response?.data?.message || 'Something went wrong during verification.');
            }
        };

        if (khaltiStatus === 'Completed' || pidx) {
            verifyPayment();
        } else {
            setStatus('error');
            setMessage('Payment was not completed.');
        }
    }, [pidx, khaltiStatus, navigate]);

    return (
        <div className="payment-result-container">
            <div className={`result-card ${status}`}>
                <div className="result-icon">
                    {status === 'verifying' && <div className="spinner"></div>}
                    {status === 'success' && '✅'}
                    {status === 'error' && '❌'}
                </div>
                <h2>
                    {status === 'verifying' && 'Verifying Payment...'}
                    {status === 'success' && 'Payment Success!'}
                    {status === 'error' && 'Payment Failed'}
                </h2>
                <p>{message}</p>

                {status !== 'verifying' && (
                    <div className="result-actions">
                        <button onClick={() => navigate('/marketplace')} className="btn-secondary">
                            Back to Marketplace
                        </button>
                        {status === 'success' && (
                            <button onClick={() => navigate('/dashboard')} className="btn-primary">
                                Go to Dashboard
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentResult;
