const EVENT_TYPES = [
  { value:'PROMOCION',      label:'Promoción' },
  { value:'DESCUENTO',      label:'Descuento' },
  { value:'COMBO',          label:'Combo' },
  { value:'HAPPY_HOUR',     label:'Happy Hour' },
  { value:'EVENTO_ESPECIAL',label:'Evento Especial' },
  { value:'OFERTA_TEMPORAL',label:'Oferta Temporal' },
];
 
export const EventFilters = ({
  searchTerm, onSearchChange,
  statusFilter, onStatusChange,
  typeFilter, onTypeChange,
}) => (
  <div className="ev-filters">
    <div>
      <span className="ev-filter-label">Buscar por nombre</span>
      <div className="ev-filter-wrap">
        <i className="ti ti-search ev-filter-icon" aria-hidden="true" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Ej: Noche de Aniversario..."
          className="ev-filter-input"
        />
      </div>
    </div>
    <div className="ev-filters-grid">
      <div>
        <span className="ev-filter-label">Estado</span>
        <div className="ev-filter-wrap">
          <i className="ti ti-activity ev-filter-icon" aria-hidden="true" />
          <select value={statusFilter} onChange={e => onStatusChange(e.target.value)} className="ev-filter-select">
            <option value="">Todos</option>
            <option value="ACTIVA">Activos</option>
            <option value="INACTIVA">Inactivos</option>
          </select>
        </div>
      </div>
      <div>
        <span className="ev-filter-label">Tipo de evento</span>
        <div className="ev-filter-wrap">
          <i className="ti ti-tag ev-filter-icon" aria-hidden="true" />
          <select value={typeFilter} onChange={e => onTypeChange(e.target.value)} className="ev-filter-select">
            <option value="">Todos</option>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  </div>
);
 