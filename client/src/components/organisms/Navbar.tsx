import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../atoms/Button';

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
    isActive
      ? 'bg-indigo-100 text-indigo-700'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { walletData } = useWallet();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="text-lg font-extrabold text-indigo-600 whitespace-nowrap">
            🐌 SnailBet
          </span>
          <div className="hidden sm:flex items-center gap-1">
            <NavLink to="/" end className={linkClasses}>
              Dashboard
            </NavLink>
            <NavLink to="/races" className={linkClasses}>
              Carreras
            </NavLink>
            <NavLink to="/wallet" className={linkClasses}>
              Billetera
            </NavLink>
            <NavLink to="/my-bets" className={linkClasses}>
              Mis Apuestas
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm font-semibold text-gray-700">
            ${walletData.balance?.toFixed(2) ?? '0.00'}
          </span>
          <span className="text-sm text-gray-500 hidden md:inline">
            {user?.name}
          </span>
          <Button variant="danger" onClick={handleLogout}>
            Salir
          </Button>
        </div>
      </nav>
    </header>
  );
};
