import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  Box,
  InlineGrid,
} from '@shopify/polaris';
import { getProduct, generateAura, applyAura, revertAura, ProductDetail } from '@/lib/api';

export function ProductAiPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [productData, setProductData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getProduct(id);
      setProductData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load product details.');
      // Mock data for demo
      setProductData({
        product: {
          id: id,
          title: 'Classic Trench Coat',
          descriptionHtml: '<p>A timeless trench coat crafted from premium cotton gabardine. Features a double-breasted front, storm flap, and adjustable belt. Water-resistant finish for all-weather wear.</p>',
        },
        aiProposal: {
          auraTitle: 'Aura Amplifier Trench – Elevate Your Presence',
          auraDescriptionHtml: '<p><strong>Step into every room with unshakable confidence.</strong></p><p>This isn\'t just a coat — it\'s your signature statement. Meticulously crafted from premium cotton gabardine, the Aura Amplifier Trench transforms ordinary moments into runway-worthy entrances.</p><p>✨ <em>Water-resistant elegance</em> for when life throws its curveballs<br/>✨ <em>Sculptural silhouette</em> that commands attention<br/>✨ <em>Timeless design</em> that transcends seasons</p>',
          auraBadgeLabel: 'Aura x10',
          auraEnabled: false,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleGenerateAura = async () => {
    if (!id) return;
    try {
      setActionLoading('generate');
      await generateAura(id);
      await fetchProduct();
    } catch (err) {
      setError('Failed to generate AI suggestions. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApplyAura = async () => {
    if (!id) return;
    try {
      setActionLoading('apply');
      await applyAura(id);
      await fetchProduct();
    } catch (err) {
      setError('Failed to apply AI suggestions. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevertAura = async () => {
    if (!id) return;
    try {
      setActionLoading('revert');
      await revertAura(id);
      await fetchProduct();
    } catch (err) {
      setError('Failed to revert changes. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Page
        backAction={{ content: 'Products', onAction: () => navigate('/app/products') }}
        title=""
      >
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <SkeletonDisplayText size="medium" />
                <SkeletonBodyText lines={4} />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (!productData) {
    return (
      <Page
        backAction={{ content: 'Products', onAction: () => navigate('/app/products') }}
        title="Product Not Found"
      >
        <Layout>
          <Layout.Section>
            <Banner tone="critical">
              Could not find the requested product.
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const { product, aiProposal } = productData;

  return (
    <Page
      backAction={{ content: 'Products', onAction: () => navigate('/app/products') }}
      title={product.title}
      titleMetadata={
        aiProposal?.auraEnabled ? (
          <Badge tone="success">Aura Active</Badge>
        ) : null
      }
      primaryAction={
        aiProposal ? (
          aiProposal.auraEnabled ? (
            <Button
              variant="primary"
              tone="critical"
              onClick={handleRevertAura}
              loading={actionLoading === 'revert'}
            >
              Revert to Original
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleApplyAura}
              loading={actionLoading === 'apply'}
            >
              Apply AI Version
            </Button>
          )
        ) : (
          <Button
            variant="primary"
            onClick={handleGenerateAura}
            loading={actionLoading === 'generate'}
          >
            Generate AI Suggestions
          </Button>
        )
      }
      secondaryActions={
        aiProposal && !aiProposal.auraEnabled
          ? [
              {
                content: 'Regenerate',
                onAction: handleGenerateAura,
                loading: actionLoading === 'generate',
              },
            ]
          : []
      }
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner tone="warning" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
            {/* Original Version */}
            <Card>
              <BlockStack gap="400">
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Text variant="headingMd" as="h2">Original Version</Text>
                  {!aiProposal?.auraEnabled && (
                    <Badge tone="info">Live</Badge>
                  )}
                </InlineStack>
                <Divider />
                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3" fontWeight="semibold">
                    {product.title}
                  </Text>
                  <Box
                    padding="400"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <div
                      className="product-description"
                      dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                    />
                  </Box>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* AI Enhanced Version */}
            <Card>
              <BlockStack gap="400">
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Text variant="headingMd" as="h2">AI Enhanced Version</Text>
                  {aiProposal?.auraEnabled && (
                    <Badge tone="success">Live</Badge>
                  )}
                  {aiProposal && (
                    <Badge tone="magic">{aiProposal.auraBadgeLabel}</Badge>
                  )}
                </InlineStack>
                <Divider />
                {aiProposal ? (
                  <BlockStack gap="300">
                    <Text variant="headingSm" as="h3" fontWeight="semibold">
                      {aiProposal.auraTitle}
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-secondary"
                      borderRadius="200"
                      borderColor="border-magic"
                      borderWidth="025"
                    >
                      <div
                        className="product-description aura-enhanced"
                        dangerouslySetInnerHTML={{ __html: aiProposal.auraDescriptionHtml }}
                      />
                    </Box>
                  </BlockStack>
                ) : (
                  <Box
                    padding="800"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="300" align="center">
                      <Text variant="bodyMd" tone="subdued" alignment="center" as="p">
                        No AI suggestions generated yet
                      </Text>
                      <Button onClick={handleGenerateAura} loading={actionLoading === 'generate'}>
                        Generate Now
                      </Button>
                    </BlockStack>
                  </Box>
                )}
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        {aiProposal && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">AI Insights</Text>
                <Divider />
                <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
                  <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                    <BlockStack gap="100">
                      <Text variant="headingSm" as="h3">Engagement Score</Text>
                      <Text variant="heading2xl" as="p" fontWeight="bold">+42%</Text>
                      <Text variant="bodySm" tone="subdued" as="span">Projected increase</Text>
                    </BlockStack>
                  </Box>
                  <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                    <BlockStack gap="100">
                      <Text variant="headingSm" as="h3">Conversion Rate</Text>
                      <Text variant="heading2xl" as="p" fontWeight="bold">+18%</Text>
                      <Text variant="bodySm" tone="subdued" as="span">Expected improvement</Text>
                    </BlockStack>
                  </Box>
                  <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                    <BlockStack gap="100">
                      <Text variant="headingSm" as="h3">Aura Score</Text>
                      <Text variant="heading2xl" as="p" fontWeight="bold">10/10</Text>
                      <Text variant="bodySm" tone="subdued" as="span">Maximum presence</Text>
                    </BlockStack>
                  </Box>
                </InlineGrid>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
