const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];
const customBuildNumber = process.argv[3];

if (!newVersion) {
  console.error('Please provide a version number (e.g., node scripts/bump-version.js 1.0.1 [buildNumber])');
  process.exit(1);
}

const root = path.join(__dirname, '..');

// 1. Update package.json
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Updated package.json to ${newVersion}`);

// 2. Update app.json
const appPath = path.join(root, 'app.json');
const app = JSON.parse(fs.readFileSync(appPath, 'utf8'));
app.expo.version = newVersion;

const currentBuildNumber = parseInt(app.expo.ios?.buildNumber || app.expo.android?.versionCode || '1', 10);
const nextBuildNumber = customBuildNumber ? parseInt(customBuildNumber, 10) : currentBuildNumber + 1;

if (!app.expo.ios) app.expo.ios = {};
app.expo.ios.buildNumber = String(nextBuildNumber);

if (!app.expo.android) app.expo.android = {};
app.expo.android.versionCode = nextBuildNumber;

fs.writeFileSync(appPath, JSON.stringify(app, null, 2) + '\n');
console.log(`Updated app.json to version ${newVersion} (buildNumber: ${nextBuildNumber})`);

// 3. Update src/constants/version.ts
const versionTsPath = path.join(root, 'src', 'constants', 'version.ts');
fs.writeFileSync(versionTsPath, `export const APP_VERSION = '${newVersion}';\n`);
console.log(`Updated src/constants/version.ts to ${newVersion}`);

console.log('Version bump complete!');
