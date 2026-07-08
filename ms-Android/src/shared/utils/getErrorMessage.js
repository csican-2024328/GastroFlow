export const getErrorMessage = (error, fallback) => {
  if (!error?.response) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet o que la URL configurada en .env sea la correcta.';
  }

  const backendErrors = error.response?.data?.errors;
  if (Array.isArray(backendErrors) && backendErrors.length > 0) {
    return backendErrors.map((item) => item.message).join(' · ');
  }

  return error.response?.data?.message || fallback;
};
