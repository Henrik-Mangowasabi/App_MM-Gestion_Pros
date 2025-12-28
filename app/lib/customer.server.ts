// FICHIER : app/lib/customer.server.ts
import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

const PRO_TAG = "pro_sante";

/**
 * Récupère les clients qui ont le tag 'pro_sante'
 */
export async function getProSanteCustomers(admin: AdminApiContext) {
  const query = `
    query {
      customers(first: 250, query: "tag:${PRO_TAG}") {
        edges {
          node {
            id
            firstName
            lastName
            email
            tags
            totalSpent
            ordersCount
          }
        }
      }
    }
  `;
  try {
    const response = await admin.graphql(query);
    const data = await response.json() as any;
    return data.data?.customers?.edges?.map((e: any) => e.node) || [];
  } catch (error) {
    return [];
  }
}

/**
 * Logique principale : Check existence -> Création ou Update -> Ajout Tag
 */
export async function ensureCustomerPro(admin: AdminApiContext, email: string, name: string) {
  // 1. Chercher si le client existe par email
  const searchParams = `email:${email}`;
  const searchQuery = `
    query {
      customers(first: 1, query: "${searchParams}") {
        edges { node { id, tags } }
      }
    }
  `;
  
  let customerId = null;
  let currentTags: string[] = [];

  try {
    const response = await admin.graphql(searchQuery);
    const data = await response.json() as any;
    const existing = data.data?.customers?.edges?.[0]?.node;
    
    if (existing) {
      console.log(`[CLIENT] Client trouvé: ${existing.id}`);
      customerId = existing.id;
      currentTags = existing.tags || [];
    }
  } catch (e) { console.error("Erreur recherche client:", e); }

  // 2. Si pas de client, on le crée
  if (!customerId) {
    console.log(`[CLIENT] Création nouveau client pour: ${email}`);
    const createMutation = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }
    `;
    
    // On sépare le nom (basique)
    const nameParts = name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || nameParts[0]; // Fallback

    const variables = {
      input: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        tags: [PRO_TAG], // On met le tag directement à la création
        emailMarketingConsent: {
          marketingState: "SUBSCRIBED",
          marketingOptInLevel: "SINGLE_OPT_IN"
        }
      }
    };

    try {
      const r = await admin.graphql(createMutation, { variables });
      const d = await r.json() as any;
      if (d.data?.customerCreate?.userErrors?.length > 0) {
        return { success: false, error: d.data.customerCreate.userErrors[0].message };
      }
      return { success: true, action: "created" };
    } catch (e) { return { success: false, error: String(e) }; }
  }

  // 3. Si client existait déjà, on vérifie s'il a le tag, sinon on l'ajoute
  if (customerId && !currentTags.includes(PRO_TAG)) {
    console.log(`[CLIENT] Ajout du tag au client existant...`);
    const tagsAddMutation = `
      mutation tagsAdd($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          node { id }
          userErrors { field message }
        }
      }
    `;
    
    try {
      const r = await admin.graphql(tagsAddMutation, { variables: { id: customerId, tags: [PRO_TAG] } });
      const d = await r.json() as any;
      if (d.data?.tagsAdd?.userErrors?.length > 0) {
         return { success: false, error: d.data.tagsAdd.userErrors[0].message };
      }
      return { success: true, action: "tagged" };
    } catch (e) { return { success: false, error: String(e) }; }
  }

  return { success: true, action: "already_tagged" };
}

/**
 * Supprime UNIQUEMENT le tag, pas le client
 */
export async function removeCustomerProTag(admin: AdminApiContext, email: string) {
  // 1. Trouver l'ID
  const searchQuery = `query { customers(first: 1, query: "email:${email}") { edges { node { id } } } }`;
  
  try {
    const r = await admin.graphql(searchQuery);
    const d = await r.json() as any;
    const customerId = d.data?.customers?.edges?.[0]?.node?.id;

    if (!customerId) {
        console.log("[CLIENT] Aucun client trouvé pour retirer le tag.");
        return { success: true }; // Pas d'erreur, juste rien à faire
    }

    // 2. Retirer le tag
    console.log(`[CLIENT] Retrait du tag pour ${customerId}`);
    const tagsRemoveMutation = `
      mutation tagsRemove($id: ID!, $tags: [String!]!) {
        tagsRemove(id: $id, tags: $tags) {
          node { id }
          userErrors { field message }
        }
      }
    `;

    const res = await admin.graphql(tagsRemoveMutation, { variables: { id: customerId, tags: [PRO_TAG] } });
    const json = await res.json() as any;
    
    if (json.data?.tagsRemove?.userErrors?.length > 0) {
        return { success: false, error: json.data.tagsRemove.userErrors[0].message };
    }

    return { success: true };

  } catch (e) { return { success: false, error: String(e) }; }
}