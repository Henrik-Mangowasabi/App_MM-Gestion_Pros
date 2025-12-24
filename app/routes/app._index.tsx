// @ts-nocheck
/* eslint-disable */
import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Tabs,
  Button,
  Text,
  BlockStack,
  ResourceList,
  ResourceItem,
  Badge,
  Banner,
  Box
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

// LOADER : Récupère les données
export const loader = async ({ request }) => {
  // On sécurise l'authentification
  try {
    const { admin } = await authenticate.admin(request);

    // 1. Vérification Metaobject
    const checkMO = await admin.graphql(`
      query {
        metaobjectDefinitionByType(type: "mm_pro_de_sante") {
          id
        }
      }
    `);
    const moJson = await checkMO.json();
    const moExists = !!moJson.data?.metaobjectDefinitionByType;

    // 2. Récupération des données (Pros, Codes, Clients)
    const response = await admin.graphql(`
      query {
        metaobjects(type: "mm_pro_de_sante", first: 20) {
          nodes {
            id
            displayName
            fields { key value }
          }
        }
        discountNodes(first: 20) {
          nodes {
            id
            discount { ... on DiscountCodeBasic { title status } }
          }
        }
        customers(first: 20, query: "tag:PRO") {
          nodes { id displayName email }
        }
      }
    `);
    const dataJson = await response.json();

    return json({
      moExists,
      pros: dataJson.data?.metaobjects?.nodes || [],
      discounts: dataJson.data?.discountNodes?.nodes || [],
      customers: dataJson.data?.customers?.nodes || [],
    });

  } catch (error) {
    console.error("Erreur Loader:", error);
    // En cas d'erreur, on renvoie des tableaux vides pour ne pas planter l'interface
    return json({ moExists: false, pros: [], discounts: [], customers: [] });
  }
};

// ACTION : Gère les clics (Création structure)
export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();

    if (formData.get("intent") === "create_structure") {
      await admin.graphql(`
        mutation CreateDef($definition: MetaobjectDefinitionCreateInput!) {
          metaobjectDefinitionCreate(definition: $definition) {
            metaobjectDefinition { type }
            userErrors { message }
          }
        }
      `, {
        variables: {
          definition: {
            name: "MM Pro de santé",
            type: "mm_pro_de_sante",
            access: { storefront: "PUBLIC_READ" },
            fieldDefinitions: [
              { name: "Identification", key: "identification", type: "single_line_text_field" },
              { name: "Name", key: "name", type: "single_line_text_field" },
              { name: "Email", key: "email", type: "single_line_text_field" },
              { name: "Code Name", key: "code", type: "single_line_text_field" },
              { name: "Montant", key: "montant", type: "number_decimal" },
              { 
                name: "Type", 
                key: "type", 
                type: "single_line_text_field",
                validations: [{ name: "choices", value: "[\"%\"]" }] 
              }
            ]
          }
        }
      });
    }
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false });
  }
};

// INTERFACE : L'affichage
export default function Index() {
  const { moExists, pros, discounts, customers } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState(0);

  const isLoading = navigation.state === "submitting";

  const tabs = [
    { id: 'pros', content: 'Pros (Metaobjects)' },
    { id: 'codes', content: 'Codes Promo' },
    { id: 'segments', content: 'Segments (Tag PRO)' },
  ];

  return (
    <Page title="Gestion Pros Jolly Mama">
      <Layout>
        <Layout.Section>
          {/* Bannière d'alerte si la structure manque */}
          {!moExists && (
            <Banner title="Configuration requise" tone="warning">
              <BlockStack gap="200">
                <Text as="p">Le Metaobject <b>mm_pro_de_sante</b> n'est pas encore créé.</Text>
                <Button 
                  onClick={() => submit({ intent: "create_structure" }, { method: "post" })}
                  loading={isLoading}
                  variant="primary"
                >
                  Créer la structure automatiquement
                </Button>
              </BlockStack>
            </Banner>
          )}

          <Card padding="0">
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              <Box padding="400">
                
                {/* Onglet 1: PROS */}
                {selectedTab === 0 && (
                  <ResourceList
                    resourceName={{ singular: 'pro', plural: 'pros' }}
                    items={pros}
                    renderItem={(item) => (
                      <ResourceItem id={item.id} onClick={() => {}}>
                        <Text as="h3" variant="bodyMd" fontWeight="bold">{item.displayName}</Text>
                        <Text as="p" tone="subdued">
                          {item.fields?.find(f => f.key === 'email')?.value || 'Email manquant'}
                        </Text>
                      </ResourceItem>
                    )}
                  />
                )}

                {/* Onglet 2: CODES */}
                {selectedTab === 1 && (
                  <ResourceList
                    resourceName={{ singular: 'code', plural: 'codes' }}
                    items={discounts}
                    renderItem={(item) => (
                      <ResourceItem id={item.id} onClick={() => {}}>
                        <Text as="h3" variant="bodyMd" fontWeight="bold">
                          {item.discount?.title || "Sans titre"}
                        </Text>
                        <Badge tone={item.discount?.status === 'ACTIVE' ? 'success' : 'attention'}>
                          {item.discount?.status || 'INACTIF'}
                        </Badge>
                      </ResourceItem>
                    )}
                  />
                )}

                {/* Onglet 3: CLIENTS */}
                {selectedTab === 2 && (
                  <ResourceList
                    resourceName={{ singular: 'client', plural: 'clients' }}
                    items={customers}
                    renderItem={(item) => (
                      <ResourceItem id={item.id} onClick={() => {}}>
                        <Text as="h3" variant="bodyMd" fontWeight="bold">{item.displayName}</Text>
                        <Text as="p" tone="subdued">{item.email}</Text>
                      </ResourceItem>
                    )}
                  />
                )}

              </Box>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}