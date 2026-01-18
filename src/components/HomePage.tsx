import { useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  InlineStack,
  Icon,
  Box,
  InlineGrid,
} from '@shopify/polaris';
import { ProductIcon, MagicIcon, ChartVerticalFilledIcon } from '@shopify/polaris-icons';
import { TrendsPanel } from './TrendsPanel';
import { MarketingPanel } from './MarketingPanel';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Page title="AI Product Presentation">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="300" align="start" blockAlign="center">
                <div className="hero-icon">
                  <Icon source={MagicIcon} tone="base" />
                </div>
                <BlockStack gap="100">
                  <Text variant="headingLg" as="h1">
                    Transform Your Product Listings
                  </Text>
                  <Text variant="bodyLg" as="p" tone="subdued">
                    Harness the power of AI to create compelling, aura-enhanced presentations
                    that captivate customers and drive conversions.
                  </Text>
                </BlockStack>
              </InlineStack>

              <InlineStack gap="300">
                <Button
                  variant="primary"
                  size="large"
                  onClick={() => navigate('/app/products')}
                  icon={ProductIcon}
                >
                  View Products
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
            <Card>
              <BlockStack gap="300">
                <div className="feature-icon">
                  <Icon source={MagicIcon} tone="base" />
                </div>
                <Text variant="headingMd" as="h3">AI-Powered Copy</Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Generate compelling product descriptions that resonate with your target audience.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <div className="feature-icon">
                  <Icon source={ChartVerticalFilledIcon} tone="base" />
                </div>
                <Text variant="headingMd" as="h3">Trend-Aligned</Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Stay ahead with content that reflects current market trends and customer preferences.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <div className="feature-icon">
                  <Icon source={ProductIcon} tone="base" />
                </div>
                <Text variant="headingMd" as="h3">One-Click Apply</Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Preview, compare, and apply AI suggestions instantly with full control to revert.
                </Text>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <MarketingPanel />
        </Layout.Section>

        <Layout.Section>
          <TrendsPanel />
        </Layout.Section>

        <Layout.Section>
          <Box paddingBlockStart="400">
            <InlineStack align="center">
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/app/products')}
              >
                Get Started with Products
              </Button>
            </InlineStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}