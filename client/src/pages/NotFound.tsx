import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
      <p className="text-gray-600 mt-4 mb-6">La página que buscas no existe.</p>
      <Link
        to="/"
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition duration-200"
      >
        Volver al Panel
      </Link>
    </div>
  );
};
