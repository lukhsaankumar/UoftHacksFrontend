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
  ProgressBar,
} from '@shopify/polaris';
import { LightbulbIcon } from '@shopify/polaris-icons';
import {
  getSuggestions,
  Suggestion,
  ReplaceProductData,
  PriceChangeData,
  NewProductData,
  DescriptionChangeData,
} from '@/lib/api';

function getProductTitle(data: Suggestion['data']): string {
  if ('newProduct' in data && 'productIdToReplace' in data) {
    return (data as ReplaceProductData).newProduct.title;
  }
  if ('currentPrice' in data && 'newPrice' in data) {
    return (data as PriceChangeData).productTitle;
  }
  if ('product' in data && !('productIdToReplace' in data)) {
    return (data as NewProductData).product.title;
  }
  if ('currentDescription' in data && 'newDescription' in data) {
    return (data as DescriptionChangeData).productTitle;
  }
  return 'Unknown Product';
}

function getTrendSource(data: Suggestion['data']): string | undefined {
  if ('trendSource' in data) {
    return data.trendSource as string | undefined;
  }
  return undefined;
}

export function SuggestionsPanel() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await getSuggestions();
        setSuggestions(data.filter(s => s.status === 'pending').slice(0, 3));
        setError(null);
      } catch (err) {
        setError('Failed to load suggestions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'replace-product':
        return 'Product Replacement';
      case 'price-change':
        return 'Price Optimization';
      case 'new-product':
        return 'New Product';
      case 'description-change':
        return 'Description Update';
      default:
        return 'Suggestion';
    }
  };

  const getTypeTone = (type: string): 'magic' | 'info' | 'success' | 'attention' => {
    switch (type) {
      case 'replace-product':
        return 'magic';
      case 'price-change':
        return 'info';
      case 'new-product':
        return 'success';
      case 'description-change':
        return 'attention';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">AI Suggestions</Text>
          <SkeletonBodyText lines={4} />
        </BlockStack>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="200" align="space-between" blockAlign="center">
          <InlineStack gap="200" align="start" blockAlign="center">
            <div className="suggestions-icon" aria-hidden="true">
              <Icon source={LightbulbIcon} tone="base" />
            </div>
            <Text variant="headingMd" as="h2">AI Suggestions</Text>
            <Badge tone="attention">{`${suggestions.length} pending`}</Badge>
          </InlineStack>
          <Button
            variant="plain"
            onClick={() => navigate('/app/suggestions')}
            accessibilityLabel="View all suggestions"
          >
            View all
          </Button>
        </InlineStack>

        {error && (
          <Banner tone="warning" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        <BlockStack gap="300">
          {suggestions.map((suggestion) => {
            const { _id, type, data } = suggestion;
            const confidencePercent = Math.round(data.confidenceScore * 100);
            const title = getProductTitle(data);
            const trendSource = getTrendSource(data);

            return (
              <Box
                key={_id}
                padding="400"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <BlockStack gap="300">
                  <InlineStack gap="200" align="space-between" blockAlign="start" wrap={false}>
                    <BlockStack gap="100">
                      <InlineStack gap="200" blockAlign="center">
                        <Text variant="headingSm" as="h3" fontWeight="semibold">
                          {title}
                        </Text>
                        <Badge tone={getTypeTone(type)}>{getTypeLabel(type)}</Badge>
                      </InlineStack>
                      <Text variant="bodySm" as="p" tone="subdued">
                        {data.reason.length > 80
                          ? `${data.reason.substring(0, 80)}...`
                          : data.reason}
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <InlineStack gap="300" align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text variant="bodySm" as="span" fontWeight="semibold">
                        Confidence: {confidencePercent}%
                      </Text>
                      <Box width="100px">
                        <ProgressBar progress={confidencePercent} tone="primary" size="small" />
                      </Box>
                    </InlineStack>
                    {trendSource && <Badge tone="success">{trendSource}</Badge>}
                  </InlineStack>
                </BlockStack>
              </Box>
            );
          })}
        </BlockStack>

        <Button
          variant="primary"
          onClick={() => navigate('/app/suggestions')}
          fullWidth
        >
          Review All Suggestions
        </Button>
      </BlockStack>
    </Card>
  );
}