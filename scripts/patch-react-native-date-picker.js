const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-date-picker',
  'package.json',
);

if (!fs.existsSync(packageJsonPath)) {
  console.log('react-native-date-picker is not installed; skipping patch.');
  process.exit(0);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const iosCodegenConfig = packageJson.codegenConfig?.ios;

if (!iosCodegenConfig?.modulesProvider) {
  console.log('react-native-date-picker iOS module provider patch is already applied.');
  process.exit(0);
}

delete iosCodegenConfig.modulesProvider;
fs.writeFileSync(
  packageJsonPath,
  `${JSON.stringify(packageJson, null, 2)}\n`,
  'utf8',
);

console.log(
  'Patched react-native-date-picker iOS metadata for React Native 0.85.',
);
