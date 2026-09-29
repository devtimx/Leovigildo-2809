import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
