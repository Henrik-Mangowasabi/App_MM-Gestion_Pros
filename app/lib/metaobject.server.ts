import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

const METAOBJECT_TYPE = "mm_pro_de_sante";
const METAOBJECT_NAME = "MM Pro de santé";

// --- HELPERS ---

export async function checkMetaobjectExists(admin: AdminApiContext): Promise<boolean> {
  const query = `
    query {
      metaobjectDefinitions(first: 250) {
        edges {
          node {
            type
            name
          }
        }
      }
    }
  `;
  try {
    const response = await admin.graphql(query);
    const data = await response.json() as any;
    const definitions = data.data?.metaobjectDefinitions?.edges || [];
    return definitions.some((edge: any) => edge.node?.type === METAOBJECT_TYPE);
  } catch (error) {
    console.error("Erreur checkMetaobjectExists:", error);
    return false;
  }
}

export async function checkMetaobjectStatus(admin: AdminApiContext) {
  const exists = await checkMetaobjectExists(admin);
  return { exists };
}

// --- CREATE STRUCTURE ---
export async function createMetaobject(admin: AdminApiContext) {
  const exists = await checkMetaobjectExists(admin);
  if (exists) return { success: true };

  const mutation = `
    mutation metaobjectDefinitionCreate($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition { id }
        userErrors { field message }
      }
    }
  `;

  const fieldDefinitions = [
    { name: "Identification", key: "identification", type: "single_line_text_field", required: true },
    { name: "Name", key: "name", type: "single_line_text_field", required: true },
    { name: "Email", key: "email", type: "single_line_text_field", required: true },
    { name: "Code Name", key: "code", type: "single_line_text_field", required: true },
    { name: "Montant", key: "montant", type: "number_decimal", required: true },
    { 
      name: "Type", key: "type", type: "single_line_text_field", required: true,
      validations: [{ name: "choices", value: JSON.stringify(["%", "€"]) }]
    }
  ];

  const variables = {
    definition: {
      name: METAOBJECT_NAME,
      type: METAOBJECT_TYPE,
      fieldDefinitions,
      capabilities: { publishable: { enabled: true } }
    }
  };

  try {
    const response = await admin.graphql(mutation, { variables });
    const data = await response.json() as any;
    if (data.data?.metaobjectDefinitionCreate?.userErrors?.length > 0) {
      return { success: false, error: JSON.stringify(data.data.metaobjectDefinitionCreate.userErrors) };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// --- GET ENTRIES ---
export async function getMetaobjectEntries(admin: AdminApiContext) {
  const query = `
    query {
      metaobjects(first: 250, type: "${METAOBJECT_TYPE}") {
        edges {
          node {
            id
            fields { key value }
          }
        }
      }
    }
  `;

  try {
    const response = await admin.graphql(query);
    const data = await response.json() as any;
    const edges = data.data?.metaobjects?.edges || [];
    
    const entries = edges.map((edge: any) => {
      const node = edge.node;
      const entry: any = { id: node.id };
      node.fields.forEach((f: any) => {
        if (f.key === "montant") {
            entry[f.key] = f.value ? parseFloat(f.value) : null;
        } else {
            entry[f.key] = f.value;
        }
      });
      return entry;
    });

    return { entries };
  } catch (error) {
    return { entries: [], error: String(error) };
  }
}

// --- CREATE ENTRY ---
export async function createMetaobjectEntry(admin: AdminApiContext, fields: any) {
  const mutation = `
    mutation metaobjectCreate($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }
  `;

  const fieldsInput = [
    { key: "identification", value: String(fields.identification) },
    { key: "name", value: String(fields.name) },
    { key: "email", value: String(fields.email) },
    { key: "code", value: String(fields.code) },
    { key: "montant", value: String(fields.montant) },
    { key: "type", value: String(fields.type) },
  ];

  try {
    const response = await admin.graphql(mutation, { variables: { metaobject: { type: METAOBJECT_TYPE, fields: fieldsInput } } });
    const data = await response.json() as any;
    
    if (data.data?.metaobjectCreate?.userErrors?.length > 0) {
      return { success: false, error: data.data.metaobjectCreate.userErrors[0].message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// --- UPDATE ENTRY ---
export async function updateMetaobjectEntry(admin: AdminApiContext, id: string, fields: any) {
  const mutation = `
    mutation metaobjectUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }
  `;

  const fieldsInput = [
    { key: "identification", value: String(fields.identification) },
    { key: "name", value: String(fields.name) },
    { key: "email", value: String(fields.email) },
    { key: "code", value: String(fields.code) },
    { key: "montant", value: String(fields.montant) },
    { key: "type", value: String(fields.type) },
  ];

  try {
    const response = await admin.graphql(mutation, { variables: { id, metaobject: { fields: fieldsInput } } });
    const data = await response.json() as any;
    
    if (data.data?.metaobjectUpdate?.userErrors?.length > 0) {
      return { success: false, error: data.data.metaobjectUpdate.userErrors[0].message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// --- DELETE ENTRY ---
export async function deleteMetaobjectEntry(admin: AdminApiContext, id: string) {
  const mutation = `
    mutation metaobjectDelete($id: ID!) {
      metaobjectDelete(id: $id) {
        deletedId
        userErrors { field message }
      }
    }
  `;

  try {
    const response = await admin.graphql(mutation, { variables: { id } });
    const data = await response.json() as any;
    
    if (data.data?.metaobjectDelete?.userErrors?.length > 0) {
      return { success: false, error: data.data.metaobjectDelete.userErrors[0].message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}