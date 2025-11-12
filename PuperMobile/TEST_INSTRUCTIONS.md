# Testing the 3D Merch Store

## Quick Test Setup

To test the merch store standalone, you have two options:

### Option 1: Temporarily modify index.js

1. Open `index.js`
2. Replace the import and component:
   ```javascript
   import MerchStoreTest from './MerchStoreTest';
   
   function Root() {
     return <MerchStoreTest />;
   }
   ```
3. Run: `npm start` or `expo start`
4. Test on your device/simulator

### Option 2: Use the test entry point

1. Temporarily rename `index.js` to `index-original.js`
2. Rename `index-test.js` to `index.js`
3. Run: `npm start` or `expo start`
4. When done testing, restore the original files

## What to Test

- ✅ 3D scene loads
- ✅ Textures load from merch images
- ✅ Walls and displays render correctly
- ✅ Scroll/drag gestures move camera through store
- ✅ Smooth camera movement
- ✅ Performance on mobile device

## Controls

- **Drag up/down**: Move forward/backward through the store
- The camera will automatically weave through the displays and walls

## Troubleshooting

If textures don't load:
- Check that images exist in `assets/merch/` folder
- Check console for loading errors
- Verify image file names match exactly

If 3D doesn't render:
- Check that `expo-gl` and `expo-three` are installed
- Check device supports WebGL
- Check console for WebGL errors


