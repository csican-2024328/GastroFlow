import { useState } from 'react';
import toast from 'react-hot-toast';
 
export const ReservationForm = ({ restaurant, onSubmit, onCheckAvailability, isLoading, availableTables }) => {
  const [formData, setFormData] = useState({ date:'', timeStart:'', timeEnd:'', partySize:2, notes:'', tablePreference:null });
  const [errors, setErrors]     = useState({});
  const [step, setStep]         = useState(1);
  const [selectedTable, setSelectedTable]             = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
 
  /* ── Handlers — INTACTOS ── */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]:value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]:null }));
  };
  const handlePartySizeChange = (delta) => setFormData(prev => ({ ...prev, partySize:Math.max(1,Math.min(20,prev.partySize+delta)) }));
 
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.timeStart) newErrors.timeStart = 'La hora de inicio es requerida';
    if (!formData.timeEnd) newErrors.timeEnd = 'La hora de fin es requerida';
    if (formData.timeStart >= formData.timeEnd) newErrors.timeEnd = 'La hora de fin debe ser mayor que la de inicio';
    if (formData.partySize < 1) newErrors.partySize = 'Debe haber al menos 1 persona';
    const selDate = new Date(formData.date), today = new Date(); today.setHours(0,0,0,0);
    if (selDate < today) newErrors.date = 'La fecha debe ser en el futuro';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCheckingAvailability(true);
      try {
        const res = onCheckAvailability ? await onCheckAvailability(restaurant._id, formData.date, formData.timeStart, formData.timeEnd) : { success:true };
        if (res?.success === false) return;
        setStep(2);
      } finally { setCheckingAvailability(false); }
    }
  };
 
  const handleStep2Submit = () => {
    if (!selectedTable) { toast.error('Por favor selecciona una mesa'); return; }
    setStep(3);
  };
 
  const handleConfirm = async () => {
    await onSubmit({
      restaurantID: restaurant._id,
      mesaID: selectedTable._id,
      fechaReserva: formData.date,
      horaInicio: formData.timeStart,
      horaFin: formData.timeEnd,
      cantidadPersonas: Number(formData.partySize),
      notas: formData.notes || null,
    });
  };
 
  const getMinTime = () => {
    if (!formData.date) return '00:00';
    const today = new Date();
    const y=today.getFullYear(), m=String(today.getMonth()+1).padStart(2,'0'), d=String(today.getDate()).padStart(2,'0');
    if (formData.date === `${y}-${m}-${d}`) {
      return `${String(today.getHours()).padStart(2,'0')}:${String(today.getMinutes()).padStart(2,'0')}`;
    }
    return '00:00';
  };
  const formatTime = (t) => t.replace(':', 'h');
 
  /* ── STEP 1 ── */
  if (step === 1) return (
    <div className="rvf-card">
      <h3 className="rvf-title">Detalles de la Reserva</h3>
      <p className="rvf-step-label">Paso 1 de 3</p>
      <form onSubmit={handleStep1Submit} className="rvf-form">
        <div className="rvf-field">
          <label className="rvf-label"><i className="ti ti-calendar" aria-hidden="true" />Fecha de la reserva</label>
          <input type="date" name="date" value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} className={`rvf-input${errors.date?' rvf-input--error':''}`} />
          {errors.date && <span className="rvf-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.date}</span>}
        </div>
        <div className="rvf-row">
          <div className="rvf-field">
            <label className="rvf-label"><i className="ti ti-clock" aria-hidden="true" />Hora de inicio</label>
            <input type="time" name="timeStart" value={formData.timeStart} onChange={handleInputChange} min={getMinTime()} className={`rvf-input${errors.timeStart?' rvf-input--error':''}`} />
            {errors.timeStart && <span className="rvf-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.timeStart}</span>}
          </div>
          <div className="rvf-field">
            <label className="rvf-label"><i className="ti ti-clock" aria-hidden="true" />Hora de fin</label>
            <input type="time" name="timeEnd" value={formData.timeEnd} onChange={handleInputChange} className={`rvf-input${errors.timeEnd?' rvf-input--error':''}`} />
            {errors.timeEnd && <span className="rvf-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.timeEnd}</span>}
          </div>
        </div>
        <div className="rvf-field">
          <label className="rvf-label"><i className="ti ti-users" aria-hidden="true" />Número de personas</label>
          <div className="rvf-party-row">
            <button type="button" onClick={() => handlePartySizeChange(-1)} className="rvf-party-btn">−</button>
            <input type="number" name="partySize" value={formData.partySize} onChange={handleInputChange} min="1" max="20" className="rvf-party-val" />
            <button type="button" onClick={() => handlePartySizeChange(1)} className="rvf-party-btn">+</button>
          </div>
          {errors.partySize && <span className="rvf-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.partySize}</span>}
        </div>
        <div className="rvf-field">
          <label className="rvf-label"><i className="ti ti-notes" aria-hidden="true" />Notas especiales (opcional)</label>
          <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Cumpleaños, preferencias dietéticas, etc." rows={3} className="rvf-textarea" />
        </div>
        <div className="rvf-nav">
          <button type="submit" disabled={isLoading||checkingAvailability} className="rvf-nav-btn rvf-nav-next">
            {isLoading||checkingAvailability ? 'Cargando...' : 'Siguiente: Seleccionar Mesa →'}
          </button>
        </div>
      </form>
    </div>
  );
 
  /* ── STEP 2 ── */
  if (step === 2) {
    const filteredTables = (availableTables||[]).filter(t => (t.capacidad||t.capacity) >= Number(formData.partySize));
    return (
      <div className="rvf-card">
        <h3 className="rvf-title">Seleccionar Mesa</h3>
        <p className="rvf-step-label">Paso 2 de 3 · {formData.date} {formatTime(formData.timeStart)} a {formatTime(formData.timeEnd)} · {formData.partySize} personas</p>
        {filteredTables.length === 0 ? (
          <div className="rvf-no-mesas">
            <div className="rvf-no-mesas-icon">😔</div>
            <div className="rvf-no-mesas-title">No hay mesas disponibles para {formData.partySize} personas</div>
            <div className="rvf-no-mesas-sub">Para esta fecha, horario y cantidad de personas no hay mesas disponibles. Por favor elige otro horario o cambia el número de asistentes.</div>
            <div className="rvf-nav" style={{marginTop:16}}>
              <button onClick={() => { setStep(1); setSelectedTable(null); }} className="rvf-nav-btn rvf-nav-back">← Cambiar fecha/hora</button>
            </div>
          </div>
        ) : (
          <>
            <div className="rvf-mesa-grid">
              {filteredTables.map(table => {
                const cap = table.capacidad||table.capacity;
                return (
                  <button key={table._id} onClick={() => setSelectedTable(table)} className={`rvf-mesa-btn${selectedTable?._id===table._id?' selected':''}`}>
                    <div className="rvf-mesa-icon">{cap<=2?'🪑':cap<=4?'🪑🪑':'🪑🪑🪑'}</div>
                    <div className="rvf-mesa-num">Mesa {table.numero}</div>
                    <div className="rvf-mesa-cap">{cap} personas</div>
                    {table.ubicacion && <div className="rvf-mesa-ubi">{table.ubicacion}</div>}
                  </button>
                );
              })}
            </div>
            <div className="rvf-nav">
              <button onClick={() => { setStep(1); setSelectedTable(null); }} className="rvf-nav-btn rvf-nav-back">← Atrás</button>
              <button onClick={handleStep2Submit} disabled={isLoading} className="rvf-nav-btn rvf-nav-next">
                {isLoading ? 'Cargando...' : 'Siguiente: Confirmar →'}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
 
  /* ── STEP 3 ── */
  if (step === 3) return (
    <div className="rvf-card">
      <h3 className="rvf-title">Confirmar Reserva</h3>
      <p className="rvf-step-label">Paso 3 de 3 · Revisa los detalles</p>
      <div className="rvf-summary">
        <div className="rvf-summary-row"><span className="rvf-summary-label"><i className="ti ti-calendar" aria-hidden="true" />Fecha</span><span className="rvf-summary-value">{new Date(formData.date).toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span></div>
        <div className="rvf-summary-row"><span className="rvf-summary-label"><i className="ti ti-clock" aria-hidden="true" />Horario</span><span className="rvf-summary-value">{formatTime(formData.timeStart)} a {formatTime(formData.timeEnd)}</span></div>
        <div className="rvf-summary-row"><span className="rvf-summary-label"><i className="ti ti-users" aria-hidden="true" />Personas</span><span className="rvf-summary-value">{formData.partySize} {formData.partySize===1?'persona':'personas'}</span></div>
        <div className="rvf-summary-row"><span className="rvf-summary-label"><i className="ti ti-armchair" aria-hidden="true" />Mesa</span><span className="rvf-summary-value">Mesa {selectedTable.numero} ({selectedTable.capacidad||selectedTable.capacity} lugares)</span></div>
        {formData.notes && <div className="rvf-summary-row"><span className="rvf-summary-label"><i className="ti ti-notes" aria-hidden="true" />Notas</span><span className="rvf-summary-value">{formData.notes}</span></div>}
      </div>
      <div className="rvf-disclaimer">
        <i className="ti ti-alert-triangle" aria-hidden="true" />
        <span><strong style={{color:'var(--rv-text-primary)'}}>Importante:</strong> La reserva se mantendrá por {(selectedTable.capacidad||selectedTable.capacity)>4?'2 horas':'1.5 horas'} después de la hora de inicio. Por favor, llega con 15 minutos de anticipación.</span>
      </div>
      <div className="rvf-nav">
        <button onClick={() => setStep(2)} className="rvf-nav-btn rvf-nav-back">← Cambiar Mesa</button>
        <button onClick={handleConfirm} disabled={isLoading} className="rvf-nav-btn rvf-nav-next">
          {isLoading ? 'Procesando...' : '✓ Confirmar Reserva'}
        </button>
      </div>
    </div>
  );
};
 