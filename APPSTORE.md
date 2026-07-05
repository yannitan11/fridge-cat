# Shipping Fridge Cat to the App Store

The iOS app is a Capacitor wrapper around the web app. The native project
lives in `ios/` (Swift Package Manager, no CocoaPods needed) and loads the
files that `npm run build:www` copies into `www/`.

Everything below is a one-time setup except step 5, which you repeat for
each release.

## 0. What is already done

- Capacitor iOS project scaffolded in `ios/` (`com.yannitan.fridgecat`,
  display name "Fridge Cat").
- App icon (1024) installed in the asset catalog; source at
  `appstore/icon-1024.png`.
- Camera + photo library usage descriptions are in `Info.plist` (required
  or the app crashes when adding a meal photo).
- All app data stays on the device (localStorage + IndexedDB). There is no
  backend, login, tracking, or third-party SDK.

## 1. Install the tools (one time)

1. Install **Xcode** from the Mac App Store (free, ~12 GB). Open it once so
   it installs its components, then point the command line at it:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app
   ```
2. Enroll in the **Apple Developer Program** at
   https://developer.apple.com/programs/enroll/ ($99/year, personal Apple ID
   is fine). App Store submission is impossible without this.

## 2. Open and sign the project (one time)

```bash
cd "Fridge Cat"
npm install
npm run ios:sync     # builds www/ and syncs it into the iOS project
npm run ios:open     # opens ios/App in Xcode
```

In Xcode: select the **App** target → **Signing & Capabilities** → check
"Automatically manage signing" and pick your team (your developer account).

## 3. Test it

- Pick a simulator (or your plugged-in iPhone) in the toolbar and press
  **Run**. Walk the whole loop once: home → pantry → sniff → recipe →
  "I made it" → add photo → kitchen log.
- The photo picker is the moment that exercises the new Info.plist
  permissions; make sure both "Take Photo" and "Photo Library" work.

## 4. Create the App Store listing (one time)

1. Go to https://appstoreconnect.apple.com → My Apps → **+** → New App.
   - Platform iOS, name **Fridge Cat**, bundle ID `com.yannitan.fridgecat`
     (register it at the prompt), SKU `fridge-cat`.
2. Fill the listing:
   - **Subtitle idea:** "Cook with what you have"
   - **Description:** what it does (tap ingredients, the cat finds recipes
     you can make now, log what you cooked with photos, kcal + amounts per
     recipe). Plain language beats keywords.
   - **Category:** Food & Drink.
   - **Screenshots:** run in the iPhone 15 Pro Max simulator, hit Cmd+S on
     the home, results, recipe, and log screens. That covers the required
     6.7" size; Apple scales the rest.
   - **App Privacy:** "Data Not Collected" (true: everything stays on
     device). Privacy policy URL: any page stating that, e.g. a
     `privacy.html` on the GitHub Pages site.
   - **Age rating:** answer the questionnaire; it lands at 4+.

## 5. Ship a build (every release)

```bash
npm run ios:sync                  # refresh www/ inside the iOS app
```

Then in Xcode: select **Any iOS Device (arm64)** → **Product → Archive** →
in the Organizer window press **Distribute App → App Store Connect →
Upload**. Back in App Store Connect, attach the processed build to the
version, and **Submit for Review**. First review typically takes 1-3 days.

## Review-rejection traps to avoid

- **Guideline 4.2 (minimum functionality):** plain website wrappers get
  rejected. Fridge Cat is fine — offline recipes, camera photos, a log,
  animations — but mention those in the review notes if asked.
- Never submit with a broken photo picker (missing Info.plist strings);
  already handled here.
- The web app keeps auto-deploying to GitHub Pages independently; the App
  Store build only updates when you archive + upload again.
