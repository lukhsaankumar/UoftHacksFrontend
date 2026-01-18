import { useMemo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function ShopifyAppBridgeProvider({ children }: Props) {
  const config = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const host = params.get('host') || '';
    
    return {
      apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || 'your-api-key',
      host,
      forceRedirect: true,
    };
  }, []);

  // For now, just render children - App Bridge integration can be added when deploying
  // In production, you would use @shopify/app-bridge-react's Provider component
  return <>{children}</>;
}
