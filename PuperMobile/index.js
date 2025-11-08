import { registerRootComponent } from 'expo';
import React from 'react';
import App from './App';
import { RemoveAdsProvider } from './services/iap/removeAds';

function Root() {
	return (
		<RemoveAdsProvider>
			<App />
		</RemoveAdsProvider>
	);
}

registerRootComponent(Root);
