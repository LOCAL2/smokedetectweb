import * as rcedit from 'rcedit';

rcedit.default('release/win-unpacked/Smoke Detection.exe', { 
  icon: 'public/icon.ico' 
}).then(() => {
  console.log('Icon updated!');
}).catch(err => {
  console.error('Error:', err);
});
