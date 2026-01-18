import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Box,
  Divider,
} from '@shopify/polaris';

interface ProductPreviewProps {
  product: {
    id: string;
    title: string;
    descriptionHtml: string;
  };
  aiProposal?: {
    auraTitle: string;
    auraDescriptionHtml: string;
    auraBadgeLabel: string;
    auraEnabled: boolean;
  } | null;
}

export function ProductPreview({ product, aiProposal }: ProductPreviewProps) {
  const activeTitle = aiProposal?.auraEnabled ? aiProposal.auraTitle : product.title;
  const activeDescription = aiProposal?.auraEnabled ? aiProposal.auraDescriptionHtml : product.descriptionHtml;

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="200" align="space-between" blockAlign="center">
          <Text variant="headingMd" as="h2">Storefront Preview</Text>
          {aiProposal?.auraEnabled && (
            <Badge tone="magic">{aiProposal.auraBadgeLabel}</Badge>
          )}
        </InlineStack>
        <Divider />
        
        <Box
          padding="600"
          background="bg-surface-secondary"
          borderRadius="300"
        >
          <BlockStack gap="400">
            <Text variant="headingLg" as="h3" fontWeight="bold">
              {activeTitle}
            </Text>
            <Box>
              <div
                className="product-description-preview"
                dangerouslySetInnerHTML={{ __html: activeDescription }}
              />
            </Box>
          </BlockStack>
        </Box>

        <Text variant="bodySm" tone="subdued" as="p">
          This preview shows how your product will appear on your storefront.
        </Text>
      </BlockStack>
    </Card>
  );
}
