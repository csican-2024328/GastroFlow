import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = (s) => {
    switch (s?.toLowerCase()) {
      case 'entregado':
      case 'delivered':
        return 'bg-[#2D4F4F] text-white';
      case 'en cocina':
      case 'en_cocina':
      case 'in_progress':
      case 'preparando':
        return 'bg-[#D97706] text-white';
      case 'pendiente':
      case 'pending':
        return 'bg-[#D9A74A] text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const displayText = (() => {
    const s = status?.toLowerCase() || '';
    if (s === 'entregado' || s === 'delivered') return 'Entregado';
    if (s === 'en cocina' || s === 'en_cocina' || s === 'in_progress' || s === 'preparando') return 'En cocina';
    if (s === 'pendiente' || s === 'pending') return 'Pendiente';
    return status || 'Desconocido';
  })();

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-md ${getStatusStyles(status)}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge;
