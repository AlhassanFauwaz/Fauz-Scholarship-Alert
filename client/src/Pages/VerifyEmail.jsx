import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../Context/AuthContext';

export default function VerifyEmail() {
  const { user, updateUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const deliveryFailed = location.state?.verificationEmailSent === false;

  const verify = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setMessage('Enter the six-digit code from your email.');
      setStatus('error');
      return;
    }
    try {
      await API.post('/auth/verify-email', { code });
      updateUser({ ...user, emailVerified: true });
      setStatus('success');
      setMessage('Email verified successfully.');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Invalid or expired verification code.');
    }
  };

  const resend = async () => {
    try {
      await API.post('/auth/resend-verification');
      setStatus('success');
      setMessage('A new six-digit code has been sent to your email.');
      setCode('');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Unable to send a new code.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <h2 className="text-2xl font-bold text-[#0a2b3c]">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter the six-digit code sent to {user?.email || 'your email address'}.
        </p>
        {deliveryFailed && <p className="mt-3 text-sm text-amber-700">The first email could not be delivered. Select “Send a new code” below.</p>}
        <form onSubmit={verify} className="mt-6 space-y-4">
          <input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" aria-label="Six-digit verification code" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.45em] outline-none focus:border-[#1c9c4d]" />
          <button className="w-full rounded-lg bg-[#1c9c4d] px-4 py-3 font-semibold text-white">Verify email</button>
        </form>
        {message && <p className={`mt-4 text-sm ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>{message}</p>}
        <button onClick={resend} className="mt-5 text-sm font-semibold text-[#0a2b3c] hover:underline">Send a new code</button>
        <div className="mt-5"><Link to="/dashboard" className="text-sm text-slate-500 hover:underline">Back to dashboard</Link></div>
      </div>
    </div>
  );
}
