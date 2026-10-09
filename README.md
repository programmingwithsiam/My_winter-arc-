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

Onboarding-এ **Continue with Google** অথবা Settings → Firebase account-এ Google/Email দিয়ে sign-in করলে data sync হবে। Firebase configure না করলেও app চলবে এবং data ওই device-এ থাকবে। অন্য device-এ data পেতে একই account-এ sign-in করুন। Login করার সময় cloud save থাকলে app জিজ্ঞেস করবে—cloud data আনবেন, নাকি এই device-এর data cloud-এ রাখবেন। Browser/PWA-তে Google popup-এর জন্য Firebase Authentication → Settings-এর **Authorized domains**-এ deployed app domain যোগ করুন।

Firestore rules পরিবর্তনের পর Firebase project-এ publish করুন:

```sh
npx firebase-tools deploy --only firestore:rules
```

অ্যাপ backup import ও cloud sync-এর data type/size পরীক্ষা করে এবং editable Plan/Weeks HTML render করার আগে নিরাপদ markup-এ সীমিত করে। Backup file 2 MB-এর বেশি হলে import করা হবে না। Rules শুধু sign-in করা নিজ user-এর document-এ সীমাবদ্ধ রাখে এবং অচেনা top-level data field reject করে।

Spark plan-এ Firebase quota-এর সীমা আছে; Firebase Console-এ usage দেখে নেবেন। Billing account link না করেও free quota-তে ব্যবহার করা যায়, তবে quota ছাড়ালে cloud service limit/error দিতে পারে। Firebase-এর free plan বা quota চিরস্থায়ী/সীমাহীন নয়।

## Alarm notification

Alarms tab-এর **Custom countdown**-এ মিনিট/সেকেন্ড বেছে নিয়ে নিজের timer চালান (1 সেকেন্ড থেকে 24 ঘণ্টা); 1, 4, 5, 10, 25 মিনিটের quick option-ও আছে। Native Android/iOS app-এ notification permission থাকলে background countdown notification schedule হয়। App সামনে থাকলে সময় শেষ হলে ringing UI আসে। Browser/PWA-তে tab খোলা রাখুন—browser বন্ধ থাকলে web app timer জাগিয়ে alarm দেওয়ার নিশ্চয়তা দিতে পারে না।

Regular alarm-এর জন্য **Enable / check alarm permissions** button চাপুন এবং device-এর notification permission দিন। Android-এ সময় যতটা সম্ভব নির্ভুল রাখতে **Alarms & reminders / exact alarms** access-ও দিন। App active থাকলে alarm-এর সময় full-screen ringing UI দেখাবে। App background/বন্ধ থাকলে, screen locked থাকলেও, iOS/Android-এর নিজস্ব notification sound ও alert আসবে; সেটি tap করলে app-এর ringing UI খুলবে। Phone সম্পূর্ণ power off বা battery শেষ থাকলে কোনো app alarm বাজাতে পারে না। iOS/Android-এর notification-ও system alert—এটি সবসময় clock app-এর মতো screen জাগিয়ে full-screen দেখানো বা বন্ধ না করা পর্যন্ত বাজানো নিশ্চিত করতে পারে না।

মোবাইল OS notification-এর permission বন্ধ রাখতে পারে, battery saver সময় পিছিয়ে দিতে পারে, এবং OS একসাথে pending notification-এর সংখ্যা সীমিত করে (বিশেষ করে iOS-এ 64টি)। তাই app ফের খুললে সামনের alarm-গুলো আবার schedule হয়। এই UI native notification-কে full-screen alarm হিসেবে lock screen-এর উপর জোর করে দেখাতে পারে না—এটি iOS/Android-এর নিয়মে সীমিত।

## Mac ছাড়া iPhone-এ ব্যবহার (PWA)

Linux-এ iOS-এর native `.ipa` তৈরি করা যায় না—তার জন্য macOS ও Xcode দরকার। Mac ছাড়া iPhone-এ app-এর মতো install করার জন্য PWA প্রস্তুত করা হয়েছে। `www/` build output-টি Firebase Hosting-এর HTTPS URL-এ publish করুন:

```sh
npm run build
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only hosting
```

`use --add`-এ Firebase project বেছে নিন। Hosting-এ প্রকাশের পর iPhone-এ Safari দিয়ে পাওয়া HTTPS link খুলে **Share → Add to Home Screen → Add** চাপুন। এরপর Home Screen-এর Winter Arc icon থেকে standalone app হিসেবে খুলবে। Service worker app shell cache করে, তাই আগে একবার online-এ খুলে রাখলে পরে offline-এও app খোলা যায়। App data সেই iPhone/browser-এ local save হবে; Firebase web config set করলে account-based cloud sync-ও enable হবে.

PWA notification-গুলো native clock alarm-এর বিকল্প নয়: browser-এ app বন্ধ থাকলে scheduled local alarm নিশ্চিত করা যায় না। Screen lock থাকলেও, notification permission এবং OS support লাগবে; native background scheduling-এর জন্য Android/iOS app build দরকার। ফোন বন্ধ বা battery শেষ থাকলে alarm বাজবে না।

## Android ও iOS চালানো

Node.js 20+ ইনস্টল করে এই folder-এ:

```sh
npm install
npm run sync
npm run open:android
```

এই project-এ Android ও iOS shell আগে থেকেই তৈরি করা আছে। নতুন করে platform project তৈরি করলে আগে `npm run build`, তারপর `npx cap add android` / `npx cap add ios` চালান। Web code, Firebase config বা alarm sound পরিবর্তনের পর `npm run sync` চালান।

Android build করতে Android Studio ও Android SDK লাগবে। iOS build করতে macOS ও Xcode লাগবে—Linux থেকে iOS binary তৈরি করা যায় না। App Store/Play Store-এ প্রকাশের জন্য Apple/Google-এর developer account ও তাদের প্রকাশনা-সংক্রান্ত ফি আলাদা।
