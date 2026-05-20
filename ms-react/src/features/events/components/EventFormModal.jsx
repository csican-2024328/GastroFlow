import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useEventStore } from '../store/useEventStore.js';
import { useMenuStore } from '../../dishes/store/useMenuStore.js';
import { useDishStore } from '../../dishes/store/useDishStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
 
/* ── Constants — INTACTOS ── */
const EVENT_TYPE_OPTIONS = [
  { value:'PROMOCION',       label:'Promoción' },
  { value:'DESCUENTO',       label:'Descuento' },
  { value:'COMBO',           label:'Combo' },
  { value:'HAPPY_HOUR',      label:'Happy Hour' },
  { value:'EVENTO_ESPECIAL', label:'Evento Especial' },
  { value:'OFERTA_TEMPORAL', label:'Oferta Temporal' },
];
const DISCOUNT_TYPE_OPTIONS = [
  { value:'PORCENTAJE',    label:'Porcentaje (%)' },
  { value:'CANTIDAD_FIJA', label:'Cantidad Fija (Q)' },
];
 
export const EventFormModal = ({ open, onClose, event = null, restaurantId }) => {
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const user               = useAuthStore((s) => s.user);
  const createEventAction  = useEventStore((s) => s.createEventAction);
  const updateEventAction  = useEventStore((s) => s.updateEventAction);
  const loading            = useEventStore((s) => s.loading);
 
  const menus        = useMenuStore((s) => s.menus);
  const fetchMenus   = useMenuStore((s) => s.fetchMenus);
  const menusLoading = useMenuStore((s) => s.loading);
 
  const dishes        = useDishStore((s) => s.dishes);
  const fetchDishes   = useDishStore((s) => s.fetchDishes);
  const dishesLoading = useDishStore((s) => s.loading);
 
  const { register, handleSubmit, reset, control, watch, setValue, formState:{ errors } } = useForm({
    defaultValues: { nombre:'', descripcion:'', tipo:'', descuentoTipo:'PORCENTAJE', descuentoValor:'', fechaInicio:'', fechaFin:'', platosAplicables:[], menusAplicables:[], condiciones:'' },
  });
 
  const descuentoTipo    = watch('descuentoTipo');
  const platosAplicables = watch('platosAplicables');
  const menusAplicables  = watch('menusAplicables');
  const rId = restaurantId || user?.restaurantId || user?.RestaurantId;
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => {
    if (open && rId) { fetchMenus(rId); fetchDishes(rId); }
  }, [open, rId]);
 
  useEffect(() => {
    if (!open) return;
    if (event) {
      reset({
        nombre: event.nombre||'', descripcion: event.descripcion||'', tipo: event.tipo||'',
        descuentoTipo: event.descuentoTipo||'PORCENTAJE', descuentoValor: event.descuentoValor||'',
        fechaInicio: event.fechaInicio ? event.fechaInicio.split('T')[0] : '',
        fechaFin: event.fechaFin ? event.fechaFin.split('T')[0] : '',
        platosAplicables: event.platosAplicables?.map(p => p._id||p)||[],
        menusAplicables: event.menusAplicables?.map(m => m._id||m)||[],
        condiciones: event.condiciones||'',
      });
    } else {
      reset({ nombre:'', descripcion:'', tipo:'', descuentoTipo:'PORCENTAJE', descuentoValor:'', fechaInicio:'', fechaFin:'', platosAplicables:[], menusAplicables:[], condiciones:'' });
    }
  }, [event, open, reset]);
 
  /* ── Submit — INTACTO ── */
  const onSubmit = async (data) => {
    if (loading || isSubmittingLocal) return;
    try {
      setIsSubmittingLocal(true);
      if (!data.platosAplicables?.length && !data.menusAplicables?.length) {
        notyfError('Debes seleccionar al menos un plato o menú');
        setIsSubmittingLocal(false); return;
      }
      const eventData = {
        nombre: data.nombre.trim(), descripcion: (data.descripcion||'').trim(),
        tipo: data.tipo, descuentoTipo: data.descuentoTipo,
        descuentoValor: Number(data.descuentoValor),
        fechaInicio: new Date(data.fechaInicio).toISOString(),
        fechaFin: new Date(data.fechaFin).toISOString(),
        platosAplicables: data.platosAplicables||[],
        menusAplicables: data.menusAplicables||[],
        condiciones: (data.condiciones||'').trim(),
      };
      if (rId) eventData.restaurantID = rId;
      const result = event?._id ? await updateEventAction(event._id, eventData) : await createEventAction(eventData);
      if (result.success) {
        notyfSuccess(event ? 'Evento actualizado correctamente' : 'Evento creado correctamente');
        onClose();
      } else {
        if (result.error?.errors || result.errors) {
          const errs = result.error?.errors||result.errors;
          if (Array.isArray(errs)) errs.forEach(e => notyfError(`${e.field}: ${e.message}`));
          else notyfError(result.error||'Errores de validación en el formulario');
        } else { notyfError(result.error||'No fue posible guardar el evento'); }
      }
    } catch (error) {
      const msg = error?.response?.data?.message||error.message||'No fue posible guardar el evento';
      if (error?.response?.status===429) notyfError('Demasiadas solicitudes. Espera un momento.');
      else notyfError(msg);
    } finally { setIsSubmittingLocal(false); }
  };
 
  if (!open) return null;
 
  return (
    <div className="ev-modal-overlay">
      <div className="ev-modal">
 
        {/* Header */}
        <div className="ev-modal-header">
          <div className="ev-modal-header-left">
            <div className="ev-modal-icon-wrap">📅</div>
            <div>
              <div className="ev-modal-title">{event ? 'Editar Evento' : 'Nuevo Evento'}</div>
              <div className="ev-modal-sub">{event ? 'Edita los detalles del evento seleccionado' : 'Crea un nuevo evento para tu restaurante'}</div>
            </div>
          </div>
          <button onClick={onClose} className="ev-modal-close" aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
 
        {/* Body */}
        <div className="ev-modal-body">
          <form id="event-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="ev-form">
 
              {/* Nombre + Tipo descuento */}
              <div className="ev-form-row">
                <div className="ev-form-field">
                  <label className="ev-form-label">Nombre del Evento <span className="ev-form-label-req">*</span></label>
                  <input type="text" disabled={loading} {...register('nombre',{required:'El nombre es obligatorio',minLength:{value:3,message:'Mínimo 3 caracteres'},maxLength:{value:100,message:'Máximo 100 caracteres'}})} placeholder="Ej. Noche de Aniversario" className={`ev-form-input${errors.nombre?' ev-form-input--error':''}`} />
                  {errors.nombre && <span className="ev-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.nombre.message}</span>}
                </div>
                <div className="ev-form-field">
                  <label className="ev-form-label">Tipo de Descuento <span className="ev-form-label-req">*</span></label>
                  <Controller name="descuentoTipo" control={control} rules={{required:'Requerido'}} render={({field}) => (
                    <select {...field} disabled={loading} className="ev-form-select">
                      {DISCOUNT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )} />
                  {errors.descuentoTipo && <span className="ev-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.descuentoTipo.message}</span>}
                </div>
              </div>
 
              {/* Valor descuento + Vigencia */}
              <div className="ev-form-row">
                <div className="ev-form-field">
                  <label className="ev-form-label">Valor del Descuento {descuentoTipo==='PORCENTAJE'?'(%)':'(Q)'} <span className="ev-form-label-req">*</span></label>
                  <div className="ev-input-suffix-wrap">
                    <input type="number" disabled={loading} min="0" max={descuentoTipo==='PORCENTAJE'?'100':undefined} step="0.01"
                      {...register('descuentoValor',{required:'Requerido',valueAsNumber:true,validate:v => {
                        if (!Number.isFinite(v)||v<0) return 'Debe ser ≥ 0';
                        if (descuentoTipo==='PORCENTAJE'&&v>100) return 'No puede exceder 100%';
                        return true;
                      }})}
                      placeholder={descuentoTipo==='PORCENTAJE'?'Ej. 15':'Ej. 100.00'}
                      className={`ev-form-input${errors.descuentoValor?' ev-form-input--error':''}`}
                    />
                    <span className="ev-input-suffix">{descuentoTipo==='PORCENTAJE'?'%':'Q'}</span>
                  </div>
                  {errors.descuentoValor && <span className="ev-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.descuentoValor.message}</span>}
                </div>
                <div className="ev-form-field">
                  <label className="ev-form-label">Vigencia del Evento <span className="ev-form-label-req">*</span></label>
                  <div className="ev-date-range-row">
                    <input type="date" disabled={loading} {...register('fechaInicio',{required:'Requerido'})} className={`ev-form-input${errors.fechaInicio?' ev-form-input--error':''}`} />
                    <span className="ev-date-range-sep">–</span>
                    <input type="date" disabled={loading} {...register('fechaFin',{required:'Requerido',validate:(v,fv) => !fv.fechaInicio||new Date(v)>new Date(fv.fechaInicio)||'Fecha inválida'})} className={`ev-form-input${errors.fechaFin?' ev-form-input--error':''}`} />
                  </div>
                  {(errors.fechaInicio||errors.fechaFin) && <span className="ev-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.fechaFin?.message||errors.fechaInicio?.message}</span>}
                </div>
              </div>
 
              {/* Categoría */}
              <div className="ev-form-row">
                <div className="ev-form-field">
                  <label className="ev-form-label">Categoría del Evento <span className="ev-form-label-req">*</span></label>
                  <Controller name="tipo" control={control} rules={{required:'La categoría es obligatoria'}} render={({field}) => (
                    <select {...field} disabled={loading} className={`ev-form-select${errors.tipo?' ev-form-input--error':''}`}>
                      <option value="">-- Selecciona --</option>
                      {EVENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )} />
                  {errors.tipo && <span className="ev-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.tipo.message}</span>}
                </div>
              </div>
 
              {/* Platos aplicables */}
              <hr className="ev-form-divider" />
              <div className="ev-form-field">
                <span className="ev-form-section-label"><i className="ti ti-tools-kitchen-2" aria-hidden="true" />Platos Aplicables <span className="ev-check-count">({platosAplicables?.length||0} seleccionados)</span></span>
                <div className="ev-check-list">
                  {dishesLoading ? (
                    <div className="ev-check-loading"><div className="ev-spinner" />Cargando platos...</div>
                  ) : dishes.length === 0 ? (
                    <div className="ev-check-empty">No hay platos disponibles en este restaurante</div>
                  ) : (
                    <div className="ev-check-grid">
                      {dishes.map(dish => (
                        <label key={dish._id} className="ev-check-item">
                          <input type="checkbox" className="ev-check-input"
                            checked={platosAplicables?.includes(dish._id)||false}
                            onChange={e => {
                              const cur = platosAplicables||[];
                              setValue('platosAplicables', e.target.checked ? [...cur,dish._id] : cur.filter(id => id!==dish._id));
                            }}
                            disabled={loading}
                          />
                          <div>
                            <div className="ev-check-name">{dish.nombre}</div>
                            <div className="ev-check-sub">Q {dish.precio?.toFixed(2)||'0.00'} · {dish.categoria}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
 
              {/* Menús aplicables */}
              <div className="ev-form-field">
                <span className="ev-form-section-label"><i className="ti ti-book" aria-hidden="true" />Menús Aplicables <span className="ev-check-count">({menusAplicables?.length||0} seleccionados)</span></span>
                <div className="ev-check-list">
                  {menusLoading ? (
                    <div className="ev-check-loading"><div className="ev-spinner" />Cargando menús...</div>
                  ) : menus.length === 0 ? (
                    <div className="ev-check-empty">No hay menús disponibles en este restaurante</div>
                  ) : (
                    <div className="ev-check-grid">
                      {menus.map(menu => (
                        <label key={menu._id} className="ev-check-item">
                          <input type="checkbox" className="ev-check-input"
                            checked={menusAplicables?.includes(menu._id)||false}
                            onChange={e => {
                              const cur = menusAplicables||[];
                              setValue('menusAplicables', e.target.checked ? [...cur,menu._id] : cur.filter(id => id!==menu._id));
                            }}
                            disabled={loading}
                          />
                          <div>
                            <div className="ev-check-name">{menu.nombre}</div>
                            <div className="ev-check-sub">Q {menu.precio?.toFixed(2)||'0.00'}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
 
              {/* Descripción + Condiciones */}
              <hr className="ev-form-divider" />
              <div className="ev-form-row">
                <div className="ev-form-field">
                  <label className="ev-form-label">Descripción <span className="ev-form-label-req">*</span></label>
                  <textarea disabled={loading} rows={3}
                    {...register('descripcion',{required:'La descripción es obligatoria',minLength:{value:10,message:'Mínimo 10 caracteres'},maxLength:{value:500,message:'Máximo 500 caracteres'}})}
                    placeholder="Ej: Celebra con nosotros nuestro aniversario con descuentos especiales"
                    className={`ev-form-textarea${errors.descripcion?' ev-form-input--error':''}`}
                  />
                  {errors.descripcion && <span className="ev-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.descripcion.message}</span>}
                </div>
                <div className="ev-form-field">
                  <label className="ev-form-label">Condiciones (opcional)</label>
                  <textarea disabled={loading} rows={3}
                    {...register('condiciones',{maxLength:{value:500,message:'Máximo 500 caracteres'}})}
                    placeholder="Ej: Válido solo los viernes, no acumulable con otras promociones..."
                    className={`ev-form-textarea${errors.condiciones?' ev-form-input--error':''}`}
                  />
                  {errors.condiciones && <span className="ev-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.condiciones.message}</span>}
                </div>
              </div>
 
            </div>
          </form>
        </div>
 
        {/* Footer */}
        <div className="ev-modal-footer">
          <button type="button" onClick={onClose} className="ev-btn-ghost">Cancelar</button>
          <button form="event-form" type="submit" disabled={loading||isSubmittingLocal} className="ev-btn-primary">
            {loading||isSubmittingLocal ? <><span className="ev-btn-spinner" />Guardando...</> : <><i className="ti ti-device-floppy" aria-hidden="true" />Guardar Evento</>}
          </button>
        </div>
      </div>
    </div>
  );
};
 