import { registerRootComponent } from 'expo';
import App from './App';
import { RemoveAdsProvider } from './services/iap/removeAds';

const Root = () => (
  <RemoveAdsProvider>
    <App />
  </RemoveAdsProvider>
);

registerRootComponent(Root);
