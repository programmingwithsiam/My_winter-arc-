# My Winter Arc — Android ও iOS

এই project-এ web app-টিকে Capacitor দিয়ে Android ও iOS app হিসেবে চালানোর setup আছে। Habit, achievement, score এবং অন্যান্য progress আগে device-এ save হয়; Firebase account ব্যবহার করলে একই data Firebase Firestore-এ sync হয়।

**Plan** ও **Weeks** tab-এ `Edit plan` / `Edit weeks` চাপলে লেখা সম্পাদনা করে Save করতে পারবেন; Cancel করলে আগের লেখা থাকবে। সাপ্তাহিক score ও form-এর তথ্য edit mode-এও ব্যবহারযোগ্য।

## Firebase একবার সেটআপ

Firebase-এর **Spark (free) plan**-এ project তৈরি করে:

1. Firebase Console-এর Project settings-এ একটি **Web app** যোগ করে তার `firebaseConfig` কপি করুন। দেওয়া Android JSON ও iOS plist native app registration; browser-based Auth/Firestore sync-এর জন্য Web app config-ও লাগে।
2. `firebase-config.js`-এ Web app-এর `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, এবং `appId` বসান। Firebase web API key app-এ ব্যবহারের জন্য public identifier; Firestore Rules-ই user data access সীমিত করে।
3. **Authentication → Sign-in method** থেকে Google এবং Email/Password চালু করুন। Google provider-এর support email বেছে Save করুন।
4. **Firestore Database** তৈরি করে `firestore.rules`-এর rules publish করুন।

Firebase native config ফাইলগুলো private/local রাখুন: Android-এর `google-services.json`-টি `android/app/`-এ, iOS-এর `GoogleService-Info.plist`-টি `ios/App/App/`-এ রাখুন। এগুলো `.gitignore`-এ রাখা আছে—public GitHub-এ যোগ করবেন না। Google Sign-In-এর জন্য Firebase Android app-এ প্রতিটি signing certificate-এর SHA-1 যোগ করতে হবে; debug SHA-1 এই machine-এ যোগ করা হয়েছে, Play Store/release signing key আলাদা হলে তার SHA-1-ও যোগ করুন। `npm run sync`, `npm run android`, বা `npm run ios` platform config sync-এর পর Android package ID `winterarc.co` এবং iOS bundle ID `my-winter-arc` পুনরায় apply করে রাখে; iOS Google callback URL scheme-ও config plist থেকে যুক্ত হয়। App ID বদলালে আগের package/bundle ID দিয়ে install করা app আলাদা হিসেবে গণ্য হতে পারে।

Onboarding-এ **Continue with Google** অথবা Settings → Firebase account-এ Google দিয়ে প্রথমবার sign-in করলে Firebase account স্বয়ংক্রিয়ভাবে তৈরি হয় (Firebase Authentication-এ Google provider enable থাকতে হবে)। Firebase configure না করলেও app চলবে এবং data ওই device-এ থাকবে। অন্য phone-এ একই Google account দিয়ে sign-in করলে cloud progress সেখানে load হবে; নতুন device-এ sign-in করার আগে app online করুন।

এক device-এর local data এবং account-এর cloud save—দুটোই থাকলে app কোন copy রাখবেন জিজ্ঞেস করবে। Cloud restore করলে এই device-এর data বদলাবে, তাই আগে Settings → **Backup & Restore** থেকে backup download করুন। এই device-এর data cloud-এ পাঠালে অন্য phone-এর cloud progress বদলে যেতে পারে; দ্বিতীয় confirmation-ও না দিলে app দুই copy-ই রেখে sync থামাবে—sign out করে আবার sign in করে পরে সিদ্ধান্ত নিতে পারবেন। Sign out-এর সময়ও app cloud-এর updated time পরীক্ষা করে; পুরোনো device যেন নতুন cloud save-কে চুপিচুপি overwrite না করে।

Browser/PWA-তে Google popup-এর জন্য Firebase Authentication → Settings-এর **Authorized domains**-এ deployed app domain যোগ করুন। Google provider বন্ধ থাকলে Firebase Console-এ Authentication → Sign-in method থেকে Google চালু করুন।

Firestore rules পরিবর্তনের পর Firebase project-এ publish করুন:

```sh
npx firebase-tools deploy --only firestore:rules
```

অ্যাপ backup import ও cloud sync-এর data type/size পরীক্ষা করে এবং editable Plan/Weeks HTML render করার আগে নিরাপদ markup-এ সীমিত করে। Backup file 2 MB-এর বেশি হলে import করা হবে না। Rules শুধু sign-in করা নিজ user-এর document-এ সীমাবদ্ধ রাখে এবং অচেনা top-level data field reject করে।

Spark plan-এ Firebase quota-এর সীমা আছে; Firebase Console-এ usage দেখে নেবেন। Billing account link না করেও free quota-তে ব্যবহার করা যায়, তবে quota ছাড়ালে cloud service limit/error দিতে পারে। Firebase-এর free plan বা quota চিরস্থায়ী/সীমাহীন নয়।

## Alarm notification

Alarms tab-এর **Custom countdown**-এ মিনিট/সেকেন্ড বেছে নিয়ে নিজের timer চালান (1 সেকেন্ড থেকে 24 ঘণ্টা); 1, 4, 5, 10, 25 মিনিটের quick option-ও আছে। Native Android/iOS app-এ notification permission থাকলে background countdown notification schedule হয়। App সামনে থাকলে সময় শেষ হলে ringing UI আসে। iPhone PWA-তে screen lock করলে, Safari background-এ গেলে বা app বন্ধ করলে iOS timer থামাতে/সাসপেন্ড করতে পারে; locked-screen alarm-এর জন্য iPhone Clock ব্যবহার করুন।

Browser/PWA-তে **Alarm sound** থেকে Digital, Chime, Sunrise, Zen Bowl বা Siren বেছে **Test sound** দিয়ে শুনুন; **Stop sound** বাজা থামায়। Custom countdown ও regular alarm সামনে বাজলে Web Audio ব্যবহার করে; browser এটি চালাতে না পারলে cached backup alarm WAV বাজানোর চেষ্টা করে। iPhone-এ প্রথমে **Test sound** একবার চাপুন, media volume বাড়ান এবং Silent switch বন্ধ আছে কি না দেখুন। iOS 15 Safari/PWA screen lock বা background-এ গেলে app audio-সহ suspend হতে পারে; এই fallback সেই সীমাবদ্ধতা এড়াতে পারে না। Locked-screen alarm-এর জন্য iPhone Clock অথবা notification permission-সহ native app ব্যবহার করুন। Native app-এ foreground alarm bundled fallback sound ব্যবহার করে, আর background notification iOS notification sound ব্যবহার করে; iPhone Silent mode/notification settings এগুলো mute করতে পারে।

Regular alarm-এর জন্য **Enable / check alarm permissions** button চাপুন এবং device-এর notification permission দিন। Android-এ সময় যতটা সম্ভব নির্ভুল রাখতে **Alarms & reminders / exact alarms** access-ও দিন। App active থাকলে alarm-এর সময় full-screen ringing UI দেখাবে। App background/বন্ধ থাকলে, screen locked থাকলেও, iOS/Android-এর নিজস্ব notification sound ও alert আসবে; সেটি tap করলে app-এর ringing UI খুলবে। Phone সম্পূর্ণ power off বা battery শেষ থাকলে কোনো app alarm বাজাতে পারে না। iOS/Android-এর notification-ও system alert—এটি সবসময় clock app-এর মতো screen জাগিয়ে full-screen দেখানো বা বন্ধ না করা পর্যন্ত বাজানো নিশ্চিত করতে পারে না।

মোবাইল OS notification-এর permission বন্ধ রাখতে পারে, battery saver সময় পিছিয়ে দিতে পারে, এবং OS একসাথে pending notification-এর সংখ্যা সীমিত করে (বিশেষ করে iOS-এ 64টি)। তাই app ফের খুললে সামনের alarm-গুলো আবার schedule হয়। এই UI native notification-কে full-screen alarm হিসেবে lock screen-এর উপর জোর করে দেখাতে পারে না—এটি iOS/Android-এর নিয়মে সীমিত।

## iPhone 6s (iOS 15)-এ install ও offline ব্যবহার

এই existing app-টিকে PWA হিসেবে Firebase Hosting-এ publish করা যায়; HTTPS hosting-এর জন্য আলাদা domain বা paid plan দরকার নেই। `www/` হচ্ছে build output, আর `firebase.json`-এ Firebase Hosting সেট করা আছে। Firebase project-এ Hosting enable করে:

```sh
npm run build
npx firebase-tools login
npx firebase-tools deploy --only hosting
```

`npx firebase-tools use` দিয়ে সঠিক Firebase project নির্বাচিত আছে কি না দেখে নিন। Project alias না থাকলে `npx firebase-tools use --add` চালিয়ে project বেছে নিন। iPhone-এ প্রথমবার setup করতে:

1. iOS 15-এর **Safari**-তে deployed HTTPS URL খুলুন এবং page পুরো load হওয়া পর্যন্ত online থাকুন।
2. Safari-র **Share** button চাপুন, **Add to Home Screen**, তারপর **Add** চাপুন।
3. Home Screen-এর **Winter Arc** icon একবার online অবস্থায় খুলে load সম্পূর্ণ হতে দিন। এতে service worker app shell ও essential static files cache করবে।
4. এরপর Airplane Mode চালু করে Home Screen app icon থেকে app বন্ধ করে আবার খুলুন। Home, Alarms, Plan, Weeks এবং saved progress পরীক্ষা করুন।

Service worker fixed allowlist-এর public app shell/resources cache করে; arbitrary same-origin response বা Firebase/API request cache করে না। Google Sign-In, Firebase cloud read/write/sync এবং internet-নির্ভর Firebase features offline-এ কাজ করে না। Offline-এ progress এই device-এ locally save হয়; connectivity ফিরলে signed-in account-এর cloud sync retry হয়। Offline fallback page connection প্রয়োজনীয় তথ্য দেখায়। Google Fonts offline-এ নাও আসতে পারে—system font fallback ব্যবহার হয়। iOS service worker cache OS মুছে দিতে পারে; তাই নিয়মিত online খুলুন এবং backup export রাখুন।

**Offline test:** Safari-তে app online খুলে service worker install/activate হতে দিন এবং Home Screen app-টি online-এ একবার load করুন। তারপর Airplane Mode চালু করে app বন্ধ করে আবার খুলুন। Local changes save হয় কি না দেখুন; Firebase sign-in/sync offline-এ কাজ করবে না, reconnect করার পর sync হওয়া যাচাই করুন। এই test app shell ও local-save behavior যাচাই করে; Firebase cloud features এবং background alarms offline-compatible নয়।

PWA notification-গুলো native clock alarm-এর বিকল্প নয়: browser-এ app বন্ধ থাকলে scheduled local alarm নিশ্চিত করা যায় না। Screen lock থাকলেও, notification permission এবং OS support লাগবে; native background scheduling-এর জন্য Android/iOS app দরকার। ফোন বন্ধ বা battery শেষ থাকলে alarm বাজবে না। Linux-এ iOS native `.ipa` build করা যায় না—তার জন্য macOS ও Xcode দরকার।

## Android ও iOS চালানো

Node.js 20+ ইনস্টল করে এই folder-এ:

```sh
npm install
npm run sync
npm run open:android
```

এই project-এ Android ও iOS shell আগে থেকেই তৈরি করা আছে। নতুন করে platform project তৈরি করলে আগে `npm run build`, তারপর `npx cap add android` / `npx cap add ios` চালান। Web code, Firebase config বা alarm sound পরিবর্তনের পর `npm run sync` চালান।

Android build করতে Android Studio ও Android SDK লাগবে। iOS build করতে macOS ও Xcode লাগবে—Linux থেকে iOS binary তৈরি করা যায় না। App Store/Play Store-এ প্রকাশের জন্য Apple/Google-এর developer account ও তাদের প্রকাশনা-সংক্রান্ত ফি আলাদা।
