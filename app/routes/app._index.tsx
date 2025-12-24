import { Page, Layout, Card, Text } from "@shopify/polaris";

export default function Index() {
  return (
    <Page title="Test de connexion">
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="p" variant="bodyMd">
              Bjr
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}