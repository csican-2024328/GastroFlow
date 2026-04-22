const revokedTokenJtiStore = new Map();

const nowInSeconds = () => Math.floor(Date.now() / 1000);

const cleanupExpiredRevocations = () => {
  const current = nowInSeconds();

  for (const [jti, expiresAt] of revokedTokenJtiStore.entries()) {
    if (!expiresAt || expiresAt <= current) {
      revokedTokenJtiStore.delete(jti);
    }
  }
};

export const revokeTokenByJti = (jti, exp) => {
  if (!jti) {
    return false;
  }

  cleanupExpiredRevocations();

  const current = nowInSeconds();
  const expiresAt = Number(exp) || current + 60 * 60;

  revokedTokenJtiStore.set(jti, expiresAt);
  return true;
};

export const isTokenJtiRevoked = (jti) => {
  if (!jti) {
    return false;
  }

  cleanupExpiredRevocations();
  return revokedTokenJtiStore.has(jti);
};
