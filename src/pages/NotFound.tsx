import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <span className="text-4xl font-extrabold text-blue-600 mb-2">404</span>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The clinical route or resource you are trying to access does not exist in the Raut Hospital Management System.
      </p>
      <Button variant="primary" size="sm" onClick={() => navigate('/')}>
        <Home className="w-4 h-4" />
        Return to Dashboard
      </Button>
    </div>
  );
};
