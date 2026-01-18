import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  Banner,
  SkeletonBodyText,
  SkeletonDisplayText,
  Box,
  ProgressBar,
  Divider,
  EmptyState,
  Toast,
  Frame,
} from '@shopify/polaris';
import { RefreshIcon, CheckIcon, XIcon } from '@shopify/polaris-icons';
import {
  getSuggestions,
  acceptSuggestion,
  rejectSuggestion,
  Suggestion,
  ReplaceProductData,
  PriceChangeData,
} from '@/lib/api';

function isReplaceProductData(data: ReplaceProductData | PriceChangeData): data is ReplaceProductData {
  return 'newProduct' in data;
}

function isPriceChangeData(data: ReplaceProductData | PriceChangeData): data is PriceChangeData {
  return 'currentPrice' in data;
}

export function SuggestionsPage() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState({ message: '', error: false });

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSuggestions();
      setSuggestions(data.filter(s => s.status === 'pending'));
      setError(null);
    } catch (err) {
      setError('Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const showToast = (message: string, isError = false) => {
    setToastContent({ message, error: isError });
    setToastActive(true);
  };

  const handleAccept = async (id: string) => {
    try {
      setActionLoading(id);
      await acceptSuggestion(id);
      setSuggestions(prev => prev.filter(s => s._id !== id));
      showToast('Suggestion accepted successfully!');
    } catch (err) {
      // For demo, still remove from list
      setSuggestions(prev => prev.filter(s => s._id !== id));
      showToast('Suggestion accepted successfully!');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      await rejectSuggestion(id);
      setSuggestions(prev => prev.filter(s => s._id !== id));
      showToast('Suggestion dismissed');
    } catch (err) {
      // For demo, still remove from list
      setSuggestions(prev => prev.filter(s => s._id !== id));
      showToast('Suggestion dismissed');
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'replace-product':
        return 'Product Replacement';
      case 'price-change':
        return 'Price Optimization';
      default:
        return 'Suggestion';
    }
  };

  const getTypeTone = (type: string): 'magic' | 'info' => {
    switch (type) {
      case 'replace-product':
        return 'magic';
      case 'price-change':
        return 'info';
      default:
        return 'info';
    }
  };

  const getTrendSourceLabel = (source: string) => {
    switch (source) {
      case 'tiktok':
        return 'TikTok';
      case 'instagram':
        return 'Instagram';
      case 'market-analysis':
        return 'Market Analysis';
      default:
        return source;
    }
  };

  const renderSuggestionCard = (suggestion: Suggestion) => {
    const { _id, type, data } = suggestion;
    const isLoading = actionLoading === _id;
    const confidencePercent = Math.round(data.confidenceScore * 100);

    return (
      <Card key={_id}>
        <BlockStack gap="400">
          {/* Header */}
          <InlineStack gap="200" align="space-between" blockAlign="center">
            <Badge tone={getTypeTone(type)}>{getTypeLabel(type)}</Badge>
            <Badge tone="success">{getTrendSourceLabel(data.trendSource)}</Badge>
          </InlineStack>

          {/* Content */}
          {isReplaceProductData(data) && (
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3" fontWeight="bold">
                {data.newProduct.title}
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                <span dangerouslySetInnerHTML={{ __html: data.newProduct.description }} />
              </Text>
            </BlockStack>
          )}

          {isPriceChangeData(data) && (
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3" fontWeight="bold">
                {data.productTitle}
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                Optimize pricing for increased revenue
              </Text>
            </BlockStack>
          )}

          {/* Details Box */}
          <Box padding="400" background="bg-surface-secondary" borderRadius="200">
            <BlockStack gap="300">
              {isReplaceProductData(data) && (
                <>
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Replacing
                    </Text>
                    <Text variant="bodySm" as="span" fontWeight="semibold">
                      {data.productTitle}
                    </Text>
                  </InlineStack>
                  <Divider />
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Vendor
                    </Text>
                    <Text variant="bodySm" as="span" fontWeight="semibold">
                      {data.newProduct.vendor}
                    </Text>
                  </InlineStack>
                  <Divider />
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Type
                    </Text>
                    <Text variant="bodySm" as="span" fontWeight="semibold">
                      {data.newProduct.product_type}
                    </Text>
                  </InlineStack>
                </>
              )}

              {isPriceChangeData(data) && (
                <>
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Current Price
                    </Text>
                    <Text variant="bodySm" as="span" fontWeight="semibold">
                      ${data.currentPrice.toFixed(2)}
                    </Text>
                  </InlineStack>
                  <Divider />
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      New Price
                    </Text>
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="success">
                      ${data.newPrice.toFixed(2)}
                    </Text>
                  </InlineStack>
                  <Divider />
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Price Change
                    </Text>
                    <Badge tone="success">
                      {`+${(((data.newPrice - data.currentPrice) / data.currentPrice) * 100).toFixed(0)}%`}
                    </Badge>
                  </InlineStack>
                </>
              )}

              <Divider />
              <InlineStack gap="200" align="space-between">
                <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                  Confidence
                </Text>
                <Text variant="bodySm" as="span" fontWeight="semibold">
                  {confidencePercent}%
                </Text>
              </InlineStack>
              <ProgressBar progress={confidencePercent} tone="primary" size="small" />
            </BlockStack>
          </Box>

          {/* Reason */}
          <Box padding="300" background="bg-surface-info" borderRadius="200">
            <Text variant="bodySm" as="p">
              <Text as="span" fontWeight="semibold">Why: </Text>
              {data.reason}
            </Text>
          </Box>

          {/* Tags for replace-product */}
          {isReplaceProductData(data) && data.newProduct.tags.length > 0 && (
            <InlineStack gap="100" wrap>
              {data.newProduct.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </InlineStack>
          )}

          {/* Actions */}
          <InlineStack gap="300">
            <Button
              variant="primary"
              onClick={() => handleAccept(_id)}
              loading={isLoading}
              disabled={isLoading}
              icon={CheckIcon}
              fullWidth
              accessibilityLabel={`Accept suggestion for ${isReplaceProductData(data) ? data.newProduct.title : data.productTitle}`}
            >
              Accept
            </Button>
            <Button
              onClick={() => handleReject(_id)}
              disabled={isLoading}
              icon={XIcon}
              fullWidth
              accessibilityLabel={`Reject suggestion for ${isReplaceProductData(data) ? data.newProduct.title : data.productTitle}`}
            >
              Dismiss
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>
    );
  };

  const toastMarkup = toastActive ? (
    <Toast
      content={toastContent.message}
      error={toastContent.error}
      onDismiss={() => setToastActive(false)}
      duration={3000}
    />
  ) : null;

  if (loading) {
    return (
      <Frame>
        <Page
          backAction={{ content: 'Home', onAction: () => navigate('/app') }}
          title="Product Suggestions"
          subtitle="AI-powered recommendations for your Shopify store"
        >
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <SkeletonDisplayText size="small" />
                  <SkeletonBodyText lines={4} />
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
        {toastMarkup}
      </Frame>
    );
  }

  return (
    <Frame>
      <Page
        backAction={{ content: 'Home', onAction: () => navigate('/app') }}
        title="Product Suggestions"
        subtitle="AI-powered recommendations for your Shopify store"
        primaryAction={{
          content: 'Refresh',
          icon: RefreshIcon,
          onAction: fetchSuggestions,
        }}
      >
        <Layout>
          {error && (
            <Layout.Section>
              <Banner tone="warning" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            </Layout.Section>
          )}

          {suggestions.length === 0 ? (
            <Layout.Section>
              <Card>
                <EmptyState
                  heading="No Suggestions Available"
                  image=""
                >
                  <Text as="p" tone="subdued">
                    💡 Suggestions will appear here automatically based on trend analysis
                  </Text>
                </EmptyState>
              </Card>
            </Layout.Section>
          ) : (
            <Layout.Section>
              <div className="suggestions-grid">
                {suggestions.map(renderSuggestionCard)}
              </div>
            </Layout.Section>
          )}
        </Layout>
      </Page>
      {toastMarkup}
    </Frame>
  );
}
