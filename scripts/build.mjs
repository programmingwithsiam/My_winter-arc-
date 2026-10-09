import { mkdir, copyFile, access, readFile, writeFile } from 'node:fs/promises';
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
const nativeAuthConfig = {};
try {
  const androidConfig = JSON.parse(await readFile('android/app/google-services.json', 'utf8'));
  const webClientId = androidConfig.client?.[0]?.oauth_client?.find(client => client.client_type === 3)?.client_id;
  if (webClientId) nativeAuthConfig.googleWebClientId = webClientId;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
try {
  const iosConfig = await readFile('ios/App/App/GoogleService-Info.plist', 'utf8');
  const clientId = iosConfig.match(/<key>CLIENT_ID<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
  if (clientId) nativeAuthConfig.googleIosClientId = clientId;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await writeFile('www/native-auth-config.js', `window.WINTERARC_NATIVE_AUTH_CONFIG = ${JSON.stringify(nativeAuthConfig)};\n`);
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
