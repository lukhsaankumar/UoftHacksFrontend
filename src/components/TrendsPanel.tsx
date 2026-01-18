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
  Badge,
  ProgressBar,
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
        setTrends(data.trends || []);
        setError(null);
      } catch (err) {
        setError('Failed to load trend insights. Please try again.');
        setTrends([]);
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
          <div className="trends-icon" aria-hidden="true">
            <Icon source={ChartPopularIcon} tone="base" />
          </div>
          <Text variant="headingMd" as="h2">Current Trend Insights</Text>
        </InlineStack>

        {error && (
          <Banner tone="warning" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        <BlockStack gap="400">
          {trends.map((trend) => (
            <Box
              key={trend.id}
              padding="400"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <BlockStack gap="300">
                <InlineStack gap="200" align="space-between" blockAlign="center" wrap={false}>
                  <InlineStack gap="200" blockAlign="center">
                    <Text variant="headingSm" as="h3" fontWeight="semibold">
                      {trend.name}
                    </Text>
                    <Badge tone="success">{`+${trend.growth_rate}%`}</Badge>
                  </InlineStack>
                  <InlineStack gap="100">
                    {trend.platforms.map((platform) => (
                      <Badge key={platform} tone="info">{platform}</Badge>
                    ))}
                  </InlineStack>
                </InlineStack>

                <Text variant="bodyMd" as="p" tone="subdued">
                  {trend.marketing_angle}
                </Text>

                <BlockStack gap="100">
                  <InlineStack gap="200" blockAlign="center">
                    <Text variant="bodySm" as="span">Popularity</Text>
                    <Text variant="bodySm" as="span" fontWeight="semibold">{trend.popularity_score}%</Text>
                  </InlineStack>
                  <ProgressBar 
                    progress={trend.popularity_score} 
                    size="small" 
                    tone="primary"
                  />
                </BlockStack>

                <InlineStack gap="100" wrap>
                  {trend.keywords.slice(0, 4).map((keyword) => (
                    <Badge key={keyword}>{keyword}</Badge>
                  ))}
                </InlineStack>

                <InlineStack gap="100" wrap>
                  {trend.hashtags.slice(0, 3).map((hashtag) => (
                    <Text key={hashtag} variant="bodySm" as="span" tone="subdued">
                      {hashtag}
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
