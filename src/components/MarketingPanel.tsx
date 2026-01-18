import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  SkeletonBodyText,
  Banner,
  Icon,
  Box,
  Badge,
  Button,
} from '@shopify/polaris';
import { MagicIcon } from '@shopify/polaris-icons';
import { getMarketingProducts, MarketingProduct } from '@/lib/api';

export function MarketingPanel() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<MarketingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketingProducts = async () => {
      try {
        setLoading(true);
        const data = await getMarketingProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Failed to load marketing products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketingProducts();
  }, []);

  const handleViewPreview = (productId: string) => {
    navigate(`/app/products/${encodeURIComponent(productId)}`);
  };

  if (loading) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">AI Marketing Generator</Text>
          <SkeletonBodyText lines={4} />
        </BlockStack>
      </Card>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="200" align="start" blockAlign="center">
          <div className="marketing-icon" aria-hidden="true">
            <Icon source={MagicIcon} tone="base" />
          </div>
          <Text variant="headingMd" as="h2">AI Marketing Generator</Text>
        </InlineStack>

        {error && (
          <Banner tone="warning" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        <BlockStack gap="300">
          {products.map((product) => (
            <Box
              key={product.product_id}
              padding="400"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <BlockStack gap="300">
                <InlineStack gap="200" align="space-between" blockAlign="start" wrap={false}>
                  <BlockStack gap="100">
                    <InlineStack gap="200" blockAlign="center">
                      <Text variant="headingSm" as="h3" fontWeight="semibold">
                        {product.generated.title}
                      </Text>
                      <Badge tone="magic">{product.trend_name}</Badge>
                    </InlineStack>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Original: {product.original.title}
                    </Text>
                  </BlockStack>
                  <Button
                    variant="primary"
                    size="slim"
                    onClick={() => handleViewPreview(product.product_id)}
                    accessibilityLabel={`View preview for ${product.generated.title}`}
                  >
                    View Preview
                  </Button>
                </InlineStack>

                <Text variant="bodyMd" as="p">
                  {product.generated.marketing_angle}
                </Text>

                <InlineStack gap="200" wrap>
                  <InlineStack gap="100" blockAlign="center">
                    <Text variant="bodySm" as="span" fontWeight="semibold">Style:</Text>
                    <Badge>{product.generated.layout_style}</Badge>
                  </InlineStack>
                  <InlineStack gap="100" blockAlign="center">
                    <Text variant="bodySm" as="span" fontWeight="semibold">Color:</Text>
                    <Badge tone="info">{product.generated.color_scheme}</Badge>
                  </InlineStack>
                  <InlineStack gap="100" blockAlign="center">
                    <Text variant="bodySm" as="span" fontWeight="semibold">Method:</Text>
                    <Badge tone="success">{product.method}</Badge>
                  </InlineStack>
                </InlineStack>

                <InlineStack gap="100" wrap>
                  {product.generated.trust_badges.map((badge) => (
                    <Badge key={badge} tone="warning">{badge}</Badge>
                  ))}
                </InlineStack>

                <InlineStack gap="100" wrap>
                  {product.generated.suggested_tags.map((tag) => (
                    <Text key={tag} variant="bodySm" as="span" tone="subdued">
                      #{tag}
                    </Text>
                  ))}
                </InlineStack>
              </BlockStack>
            </Box>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
