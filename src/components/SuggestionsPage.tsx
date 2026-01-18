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
  NewProductData,
  DescriptionChangeData,
} from '@/lib/api';

function isReplaceProductData(data: Suggestion['data']): data is ReplaceProductData {
  return 'newProduct' in data && 'productIdToReplace' in data;
}

function isPriceChangeData(data: Suggestion['data']): data is PriceChangeData {
  return 'currentPrice' in data && 'newPrice' in data;
}

function isNewProductData(data: Suggestion['data']): data is NewProductData {
  return 'product' in data && !('productIdToReplace' in data);
}

function isDescriptionChangeData(data: Suggestion['data']): data is DescriptionChangeData {
  return 'currentDescription' in data && 'newDescription' in data;
}

function getProductTitle(data: Suggestion['data']): string {
  if (isReplaceProductData(data)) return data.newProduct.title;
  if (isPriceChangeData(data)) return data.productTitle;
  if (isNewProductData(data)) return data.product.title;
  if (isDescriptionChangeData(data)) return data.productTitle;
  return 'Unknown Product';
}

function getTrendSource(data: Suggestion['data']): string | undefined {
  if ('trendSource' in data) {
    return data.trendSource;
  }
  return undefined;
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
      const response = await acceptSuggestion(id);
      if (response.success) {
        setSuggestions(prev => prev.filter(s => s._id !== id));
        showToast('Suggestion accepted and applied to Shopify!');
      } else {
        showToast(response.error || 'Failed to apply suggestion', true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept suggestion';
      console.error('Accept suggestion error:', err);
      showToast(errorMessage, true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await rejectSuggestion(id);
      if (response.success) {
        setSuggestions(prev => prev.filter(s => s._id !== id));
        showToast('Suggestion dismissed');
      } else {
        showToast('Failed to dismiss suggestion', true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject suggestion';
      console.error('Reject suggestion error:', err);
      showToast(errorMessage, true);
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

  const getTrendSourceLabel = (source?: string) => {
    if (!source) return null;
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
    const trendSource = getTrendSource(data);
    const title = getProductTitle(data);

    return (
      <Card key={_id}>
        <BlockStack gap="400">
          {/* Header */}
          <InlineStack gap="200" align="space-between" blockAlign="center">
            <Badge tone={getTypeTone(type)}>{getTypeLabel(type)}</Badge>
            {trendSource && <Badge tone="success">{getTrendSourceLabel(trendSource)}</Badge>}
          </InlineStack>

          {/* Content based on type */}
          {isReplaceProductData(data) && (
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3" fontWeight="bold">
                {data.newProduct.title}
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                <span dangerouslySetInnerHTML={{ __html: data.newProduct.description || '' }} />
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

          {isNewProductData(data) && (
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3" fontWeight="bold">
                {data.product.title}
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                <span dangerouslySetInnerHTML={{ __html: data.product.body_html || '' }} />
              </Text>
            </BlockStack>
          )}

          {isDescriptionChangeData(data) && (
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3" fontWeight="bold">
                {data.productTitle}
              </Text>
              {data.trendMatch && (
                <InlineStack gap="100" wrap>
                  <Badge tone="magic">{data.trendMatch.trendName}</Badge>
                  {data.trendMatch.platforms.map((platform) => (
                    <Badge key={platform} tone="info">{platform}</Badge>
                  ))}
                </InlineStack>
              )}
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
                  {data.newProduct.product_type && (
                    <>
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
                </>
              )}

              {isPriceChangeData(data) && (
                <>
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Current Price
                    </Text>
                    <Text variant="bodySm" as="span" fontWeight="semibold">
                      ${Number(data.currentPrice).toFixed(2)}
                    </Text>
                  </InlineStack>
                  <Divider />
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      New Price
                    </Text>
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="success">
                      ${Number(data.newPrice).toFixed(2)}
                    </Text>
                  </InlineStack>
                  <Divider />
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Price Change
                    </Text>
                    <Badge tone={Number(data.newPrice) >= data.currentPrice ? 'success' : 'attention'}>
                      {`${Number(data.newPrice) >= data.currentPrice ? '+' : ''}${(((Number(data.newPrice) - data.currentPrice) / data.currentPrice) * 100).toFixed(0)}%`}
                    </Badge>
                  </InlineStack>
                </>
              )}

              {isNewProductData(data) && (
                <>
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Vendor
                    </Text>
                    <Text variant="bodySm" as="span" fontWeight="semibold">
                      {data.product.vendor}
                    </Text>
                  </InlineStack>
                  <Divider />
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Type
                    </Text>
                    <Text variant="bodySm" as="span" fontWeight="semibold">
                      {data.product.product_type}
                    </Text>
                  </InlineStack>
                  <Divider />
                  <InlineStack gap="200" align="space-between">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Status
                    </Text>
                    <Badge tone="success">{data.product.status}</Badge>
                  </InlineStack>
                </>
              )}

              {isDescriptionChangeData(data) && (
                <>
                  <BlockStack gap="200">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                      Current Description
                    </Text>
                    <Box padding="200" background="bg-surface" borderRadius="100">
                      <div
                        className="suggestion-description-preview"
                        dangerouslySetInnerHTML={{ __html: data.currentDescription }}
                      />
                    </Box>
                  </BlockStack>
                  <Divider />
                  <BlockStack gap="200">
                    <Text variant="bodySm" as="span" fontWeight="semibold" tone="success">
                      New Description
                    </Text>
                    <Box padding="200" background="bg-surface-success" borderRadius="100">
                      <div
                        className="suggestion-description-preview aura-enhanced"
                        dangerouslySetInnerHTML={{ __html: data.newDescription }}
                      />
                    </Box>
                  </BlockStack>
                  {data.newTags && data.newTags.length > 0 && (
                    <>
                      <Divider />
                      <BlockStack gap="100">
                        <Text variant="bodySm" as="span" fontWeight="semibold" tone="subdued">
                          New Tags
                        </Text>
                        <InlineStack gap="100" wrap>
                          {data.newTags.map((tag) => (
                            <Badge key={tag} tone="success">{tag}</Badge>
                          ))}
                        </InlineStack>
                      </BlockStack>
                    </>
                  )}
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

          {/* Tags for replace-product and new-product */}
          {isReplaceProductData(data) && data.newProduct.tags && data.newProduct.tags.length > 0 && (
            <InlineStack gap="100" wrap>
              {data.newProduct.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </InlineStack>
          )}

          {isNewProductData(data) && data.product.tags && data.product.tags.length > 0 && (
            <InlineStack gap="100" wrap>
              {data.product.tags.map((tag) => (
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
              accessibilityLabel={`Accept suggestion for ${title}`}
            >
              Accept
            </Button>
            <Button
              onClick={() => handleReject(_id)}
              disabled={isLoading}
              icon={XIcon}
              fullWidth
              accessibilityLabel={`Reject suggestion for ${title}`}
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