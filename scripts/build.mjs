import { mkdir, copyFile, access, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { generateAlarmSound } from './alarm-sound.mjs';

await mkdir('www', { recursive: true });
await Promise.all([
  copyFile('index.html', 'www/index.html'),
  copyFile('firebase-config.js', 'www/firebase-config.js'),
  copyFile('manifest.webmanifest', 'www/manifest.webmanifest'),
  copyFile('sw.js', 'www/sw.js'),
  copyFile('icon.svg', 'www/icon.svg'),
  copyFile('icon-192.png', 'www/icon-192.png'),
  copyFile('icon-512.png', 'www/icon-512.png')
]);
await build({
  entryPoints: ['scripts/native-plugins.js'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: 'www/native-plugins.js'
});
const sound = generateAlarmSound();
for (const [root, path] of [
  ['android/app', 'android/app/src/main/res/raw/winter_arc_alarm.wav'],
  ['ios/App/App', 'ios/App/App/winter_arc_alarm.wav']
]) {
  try {
    await access(root);
    await mkdir(path.slice(0, path.lastIndexOf('/')), { recursive: true });
    await writeFile(path, sound);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
