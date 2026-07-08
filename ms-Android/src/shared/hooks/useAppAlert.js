import { useCallback, useState } from 'react';

export const useAppAlert = () => {
  const [state, setState] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    showCancel: false,
  });

  const showAlert = useCallback((type, title, message, onConfirm) => {
    setState({ visible: true, type, title, message, onConfirm, onCancel: null, showCancel: false });
  }, []);

  const showConfirm = useCallback((title, message, onConfirm) => {
    setState({ visible: true, type: 'confirm', title, message, onConfirm, onCancel: null, showCancel: true });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((current) => ({ ...current, visible: false }));
    state.onConfirm?.();
  }, [state]);

  const handleCancel = useCallback(() => {
    setState((current) => ({ ...current, visible: false }));
    state.onCancel?.();
  }, [state]);

  return {
    alertProps: {
      visible: state.visible,
      type: state.type,
      title: state.title,
      message: state.message,
      showCancel: state.showCancel,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
    showAlert,
    showConfirm,
  };
};
