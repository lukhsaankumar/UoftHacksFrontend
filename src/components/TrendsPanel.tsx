import { useState, useEffect } from 'react';
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  SkeletonBodyText,
  Banner,
  Icon,
  Box,
} from '@shopify/polaris';
import { ChartPopularIcon } from '@shopify/polaris-icons';
import { getTrends, Trend } from '@/lib/api';

export function TrendsPanel() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const data = await getTrends();
        setTrends(data);
        setError(null);
      } catch (err) {
        setError('Failed to load trend insights. Please try again.');
        // Mock data for demo
        setTrends([
          {
            id: 'trend-1',
            title: 'Aura Fashion',
            description: 'Customers respond strongly to aspirational, mood-based copy that evokes emotion.',
          },
          {
            id: 'trend-2',
            title: 'Sustainable Luxury',
            description: 'Eco-conscious messaging paired with premium positioning drives conversions.',
          },
          {
            id: 'trend-3',
            title: 'Minimalist Elegance',
            description: 'Clean, refined descriptions with focused benefits outperform lengthy details.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">Current Trend Insights</Text>
          <SkeletonBodyText lines={3} />
          <SkeletonBodyText lines={3} />
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="200" align="start" blockAlign="center">
          <div className="trends-icon">
            <Icon source={ChartPopularIcon} tone="base" />
          </div>
          <Text variant="headingMd" as="h2">Current Trend Insights</Text>
        </InlineStack>

        {error && (
          <Banner tone="warning">
            {error}
          </Banner>
        )}

        <BlockStack gap="300">
          {trends.map((trend) => (
            <Box
              key={trend.id}
              padding="400"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <BlockStack gap="100">
                <Text variant="headingSm" as="h3" fontWeight="semibold">
                  {trend.title}
                </Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  {trend.description}
                </Text>
              </BlockStack>
            </Box>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
