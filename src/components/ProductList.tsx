import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Text,
  Badge,
  Button,
  EmptyState,
  SkeletonBodyText,
  Banner,
  Box,
} from '@shopify/polaris';
import { getProducts, Product } from '@/lib/api';

export function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      // Mock data for demo
      setProducts([
        { id: 'gid://shopify/Product/123', title: 'Classic Trench Coat', status: 'active' },
        { id: 'gid://shopify/Product/124', title: 'Silk Evening Dress', status: 'active' },
        { id: 'gid://shopify/Product/125', title: 'Cashmere Sweater', status: 'draft' },
        { id: 'gid://shopify/Product/126', title: 'Leather Handbag', status: 'active' },
        { id: 'gid://shopify/Product/127', title: 'Wool Blazer', status: 'active' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const handleViewAiSuggestions = (productId: string) => {
    navigate(`/app/products/${encodeURIComponent(productId)}`);
  };

  const rowMarkup = products.map((product, index) => (
    <IndexTable.Row
      id={product.id}
      key={product.id}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="semibold" as="span">
          {product.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={product.status === 'active' ? 'success' : 'info'}>
          {product.status || 'Active'}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Button
          variant="primary"
          size="slim"
          onClick={() => handleViewAiSuggestions(product.id)}
        >
          View AI Suggestions
        </Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  if (loading) {
    return (
      <Page
        backAction={{ content: 'Home', onAction: () => navigate('/app') }}
        title="Products"
      >
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={8} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      backAction={{ content: 'Home', onAction: () => navigate('/app') }}
      title="Products"
      subtitle="Select a product to view and apply AI-enhanced presentations"
    >
      <Layout>
        <Layout.Section>
          {error && (
            <Box paddingBlockEnd="400">
              <Banner tone="warning" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            </Box>
          )}

          {products.length === 0 ? (
            <Card>
              <EmptyState
                heading="No products found"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Add products to your store to start using AI presentation features.</p>
              </EmptyState>
            </Card>
          ) : (
            <Card padding="0">
              <IndexTable
                resourceName={resourceName}
                itemCount={products.length}
                headings={[
                  { title: 'Product' },
                  { title: 'Status' },
                  { title: 'Actions' },
                ]}
                selectable={false}
              >
                {rowMarkup}
              </IndexTable>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
