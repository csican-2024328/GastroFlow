const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function getAdbPath() {
  try {
    execSync('adb --version', { stdio: 'ignore' });
    return 'adb';
  } catch (e) {
    if (process.platform === 'win32') {
      const localAppData = process.env.LOCALAPPDATA;
      if (localAppData) {
        const winPath = path.join(localAppData, 'Android', 'Sdk', 'platform-tools', 'adb.exe');
        if (fs.existsSync(winPath)) {
          return `"${winPath}"`;
        }
      }
    } else if (process.platform === 'darwin') {
      const home = process.env.HOME;
      if (home) {
        const macPath = path.join(home, 'Library', 'Android', 'sdk', 'platform-tools', 'adb');
        if (fs.existsSync(macPath)) {
          return `"${macPath}"`;
        }
      }
    }
  }
  return null;
}

try {
  const adb = getAdbPath();
  if (!adb) {
    console.log('⚠️ No se encontró adb en el PATH ni en la ruta predeterminada de Android SDK.');
    process.exit(0);
  }

  console.log('🔄 Mapeando puertos locales con adb reverse...');
  execSync(`${adb} reverse tcp:3007 tcp:3007`, { stdio: 'ignore' });
  execSync(`${adb} reverse tcp:3006 tcp:3006`, { stdio: 'ignore' });
  console.log('✅ Redirección de puertos de Android lista (3006 -> 3006, 3007 -> 3007).');
} catch (error) {
  console.log('⚠️ No se pudieron mapear los puertos (adb reverse). Asegúrate de tener un emulador abierto o un dispositivo conectado.');
}
