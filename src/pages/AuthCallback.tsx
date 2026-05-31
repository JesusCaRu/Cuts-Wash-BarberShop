import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const redirectUri = `${window.location.origin}/auth/callback`;
      fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              navigate('/');
            }
          } else {
            console.error('Auth failed');
            navigate('/login');
          }
        })
        .catch((err) => {
          console.error(err);
          navigate('/login');
        });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-salon-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-salon-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-salon-600">Autenticando...</p>
      </div>
    </div>
  );
}
