import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Page, Layout, Card, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // URL de votre page externe
  const externalUrl = process.env.EXTERNAL_APP_URL || "http://localhost:3001";
  
  return { 
    externalUrl,
    shop: session.shop,
  };
};

export default function Index() {
  const { externalUrl, shop } = useLoaderData<typeof loader>();

  return (
    <Page title="MM Gestion Pros Santé">
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ marginBottom: "1rem" }}>
              <Text as="p" variant="bodyMd" tone="subdued">
                Gestion de votre boutique : {shop}
              </Text>
            </div>
            
            {/* Option 1: Iframe (si la page externe autorise) */}
            <div style={{ width: "100%", height: "800px", border: "1px solid #e1e3e5", borderRadius: "8px" }}>
              <iframe
                src={externalUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="MM Gestion Pros Santé"
              />
            </div>
            
            {/* Option 2: Lien direct (décommentez si vous préférez) */}
            {/* 
            <div style={{ marginTop: "1rem" }}>
              <a 
                href={externalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: "inline-block",
                  padding: "12px 24px",
                  backgroundColor: "#008060",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: "500"
                }}
              >
                Ouvrir l&apos;application
              </a>
            </div>
            */}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}