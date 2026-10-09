import { readFile, writeFile } from 'node:fs/promises';

const androidConfigPath = 'android/app/google-services.json';
const androidPackage = 'winterarc.co';
const iosBundle = 'my-winter-arc';

try {
  const androidConfig = JSON.parse(await readFile(androidConfigPath, 'utf8'));
  const configuredPackage = androidConfig.client?.[0]?.client_info?.android_client_info?.package_name;
  if (configuredPackage !== androidPackage) {
    throw new Error(`Firebase Android config package must be ${androidPackage}.`);
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const gradlePath = 'android/app/build.gradle';
let gradle = await readFile(gradlePath, 'utf8');
if (!/applicationId "[^"]+"/.test(gradle)) {
  throw new Error(`Could not find applicationId in ${gradlePath}.`);
}
gradle = gradle.replace(/applicationId "[^"]+"/, `applicationId "${androidPackage}"`);
await writeFile(gradlePath, gradle);

const stringsPath = 'android/app/src/main/res/values/strings.xml';
let strings = await readFile(stringsPath, 'utf8');
strings = strings
  .replace(/(<string name="package_name">)[^<]*(<\/string>)/, `$1${androidPackage}$2`)
  .replace(/(<string name="custom_url_scheme">)[^<]*(<\/string>)/, `$1${androidPackage}$2`);
await writeFile(stringsPath, strings);

const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
let project = await readFile(projectPath, 'utf8');
project = project.replace(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${iosBundle};`);
await writeFile(projectPath, project);

try {
  const firebasePlist = await readFile('ios/App/App/GoogleService-Info.plist', 'utf8');
  const reversedClientId = firebasePlist.match(/<key>REVERSED_CLIENT_ID<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
  if (reversedClientId) {
    const infoPath = 'ios/App/App/Info.plist';
    let info = await readFile(infoPath, 'utf8');
    if (!info.includes(`<string>${reversedClientId}</string>`)) {
      if (info.includes('<key>CFBundleURLTypes</key>')) {
        throw new Error(`${infoPath} already defines URL types; add the Google URL scheme ${reversedClientId} to its CFBundleURLSchemes.`);
      }
      info = info.replace(
        /(<plist[^>]*>\s*<dict>)/,
        `$1\n\t<key>CFBundleURLTypes</key>\n\t<array>\n\t\t<dict>\n\t\t\t<key>CFBundleURLSchemes</key>\n\t\t\t<array>\n\t\t\t\t<string>${reversedClientId}</string>\n\t\t\t</array>\n\t\t</dict>\n\t</array>`
      );
      await writeFile(infoPath, info);
    }
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

console.log(`Applied Firebase native IDs: Android ${androidPackage}, iOS ${iosBundle}.`);
