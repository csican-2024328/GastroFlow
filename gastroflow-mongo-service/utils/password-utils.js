import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error al hashear password:', error);
    throw new Error('Error al procesar contraseña');
  }
};

export const verifyPassword = async (hashedPassword, password) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error al verificar password:', error);
    throw new Error('Error al verificar contraseña');
  }
};
