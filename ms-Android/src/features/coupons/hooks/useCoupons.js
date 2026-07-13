import { useState, useCallback } from 'react';
import { getValidCoupons, getAllCoupons, validateCoupon } from '../../../shared/api/couponApi';
import { useOrderCartStore } from '../../../shared/store/orderCartStore';

export const useCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyCoupon = useOrderCartStore((state) => state.applyCoupon);
  const removeCoupon = useOrderCartStore((state) => state.removeCoupon);

  const fetchCoupons = useCallback(async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (restaurantId) {
        response = await getValidCoupons(restaurantId);
      } else {
        response = await getAllCoupons();
      }
      setCoupons(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener los cupones');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateAndApply = useCallback(async (code, restaurantId, montoTotal) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        codigo: code.trim().toUpperCase(),
        montoTotal,
        restaurantID: restaurantId || undefined
      };
      
      const response = await validateCoupon(payload);
      
      if (response.data?.success) {
        const couponData = response.data.data.coupon;
        
        const mappedCoupon = {
          code: couponData.codigo,
          discountType: couponData.tipo === 'PORCENTAJE' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
          discountValue: couponData.tipo === 'PORCENTAJE' ? couponData.porcentajeDescuento : couponData.montoFijo,
        };
        
        applyCoupon(mappedCoupon);
        return { success: true, message: 'Cupón aplicado con éxito', discount: response.data.data.descuento };
      } else {
        throw new Error(response.data?.message || 'Cupón no válido');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al validar el cupón';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [applyCoupon]);

  return {
    coupons,
    loading,
    error,
    fetchCoupons,
    validateAndApplyCoupon: validateAndApply,
    removeCoupon,
  };
};
