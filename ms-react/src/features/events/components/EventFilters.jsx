import { Input, Typography } from '@material-tailwind/react';

const EVENT_TYPES = [
  { value: 'PROMOCION', label: 'Promoción' },
  { value: 'DESCUENTO', label: 'Descuento' },
  { value: 'COMBO', label: 'Combo' },
  { value: 'HAPPY_HOUR', label: 'Happy Hour' },
  { value: 'EVENTO_ESPECIAL', label: 'Evento Especial' },
  { value: 'OFERTA_TEMPORAL', label: 'Oferta Temporal' },
];

export const EventFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-lg border border-[#E8D4B8] bg-[#FDFBF7] p-4">
      {/* Búsqueda por nombre */}
      <div className="flex-1">
        <Typography variant="small" className="mb-2 text-[#2D4F4F]">
          Buscar por nombre
        </Typography>
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Ej: Noche de Aniversario"
          className="w-full rounded-md border border-[#E8D4B8] bg-white px-3 py-3 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
          labelProps={{ className: 'hidden' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Filtro por estado */}
        <div>
          <Typography variant="small" className="mb-2 text-[#2D4F4F]">
            Estado
          </Typography>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-md border border-[#E8D4B8] bg-white px-3 py-3 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
          >
            <option value="">Todos</option>
            <option value="ACTIVA">Activos</option>
            <option value="INACTIVA">Inactivos</option>
          </select>
        </div>

        {/* Filtro por tipo */}
        <div>
          <Typography variant="small" className="mb-2 text-[#2D4F4F]">
            Tipo de evento
          </Typography>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full rounded-md border border-[#E8D4B8] bg-white px-3 py-3 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
          >
            <option value="">Todos</option>
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
