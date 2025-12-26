import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

const METAOBJECT_TYPE = "mm_pro_de_sante";
const METAOBJECT_NAME = "MM Pro de santé";

/**
 * Vérifie si le métaobjet existe
 */
export async function checkMetaobjectExists(admin: AdminApiContext): Promise<boolean> {
  // Utiliser une requête qui liste tous les métaobjets pour être sûr
  const query = `
    query {
      metaobjectDefinitions(first: 250) {
        edges {
          node {
            id
            name
            type
          }
        }
      }
    }
  `;

  try {
    const response = await admin.graphql(query);
    const data = await response.json() as {
      data?: {
        metaobjectDefinitions?: {
          edges?: Array<{
            node?: {
              id: string;
              name: string;
              type: string;
            };
          }>;
        };
      };
      errors?: Array<{ message: string }>;
    };
    
    if (data.errors) {
      console.error("Erreurs GraphQL:", data.errors);
      return false;
    }
    
    const definitions = data.data?.metaobjectDefinitions?.edges || [];
    const exists = definitions.some(
      edge => edge.node?.type === METAOBJECT_TYPE || edge.node?.name === METAOBJECT_NAME
    );
    
    return exists;
  } catch (error) {
    console.error("Erreur lors de la vérification du métaobjet:", error);
    return false;
  }
}

/**
 * Crée le métaobjet avec tous ses champs
 */
export async function createMetaobject(admin: AdminApiContext): Promise<{ success: boolean; error?: string }> {
  // Vérifier d'abord si le métaobjet existe déjà
  const exists = await checkMetaobjectExists(admin);
  if (exists) {
    return { success: true }; // Déjà créé, pas besoin de le recréer
  }
  
  // Création des définitions de champs une par une
  const fieldDefinitions = [
    {
      name: "Identification",
      key: "identification",
      type: "single_line_text_field",
      required: true,
      unique: true
    },
    {
      name: "Name",
      key: "name",
      type: "single_line_text_field",
      required: true
    },
    {
      name: "Email",
      key: "email",
      type: "single_line_text_field",
      required: true
    },
    {
      name: "Code Name",
      key: "code",
      type: "single_line_text_field",
      required: true
    },
    {
      name: "Montant",
      key: "montant",
      type: "number_decimal",
      required: true
    },
    {
      name: "Type",
      key: "type",
      type: "single_line_text_field",
      required: true,
      choices: ["%", "€"]
    }
  ];

  // Mutation pour créer le métaobjet
  const mutation = `
    mutation metaobjectDefinitionCreate($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition {
          id
          name
          type
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Construction des fieldDefinitions au format GraphQL avec validations choices
  const graphqlFieldDefinitions = fieldDefinitions.map(field => {
    const base: {
      name: string;
      key: string;
      required: boolean;
      type?: string;
      validations?: Array<{ name: string; value: string }>;
    } = {
      name: field.name,
      key: field.key,
      required: field.required
    };

    if (field.type === "single_line_text_field") {
      base.type = "single_line_text_field";
      
      // Ajouter les choix si définis - format correct : valeur en JSON string
      if (field.choices && field.choices.length > 0) {
        base.validations = [
          {
            name: "choices",
            value: JSON.stringify(field.choices) // Format: "[\"%\", \"€\"]"
          }
        ];
      }
    } else if (field.type === "number_decimal") {
      base.type = "number_decimal";
    }
    
    return base;
  });

  const variables = {
    definition: {
      name: METAOBJECT_NAME,
      type: METAOBJECT_TYPE,
      fieldDefinitions: graphqlFieldDefinitions,
      capabilities: {
        publishable: {
          enabled: true
        }
      }
    }
  };

  try {
    const response = await admin.graphql(mutation, { variables });
    const data = await response.json() as {
      errors?: Array<{ message: string }>;
      data?: {
        metaobjectDefinitionCreate?: {
          metaobjectDefinition?: { id: string; name: string; type: string };
          userErrors?: Array<{ field: string[]; message: string }>;
        };
      };
    };
    
    if (data.errors) {
      return { success: false, error: JSON.stringify(data.errors) };
    }
    
    if (data.data?.metaobjectDefinitionCreate?.userErrors?.length > 0) {
      const errors = data.data.metaobjectDefinitionCreate.userErrors;
      return { 
        success: false, 
        error: errors.map((e: { message: string }) => e.message).join(", ") 
      };
    }
    
    return { success: !!data.data?.metaobjectDefinitionCreate?.metaobjectDefinition };
  } catch (error) {
    console.error("Erreur lors de la création du métaobjet:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

/**
 * Vérifie si le métaobjet existe (sans le créer)
 */
export async function checkMetaobjectStatus(admin: AdminApiContext): Promise<{
  exists: boolean;
  error?: string;
}> {
  try {
    const exists = await checkMetaobjectExists(admin);
    return { exists };
  } catch (error) {
    console.error("Erreur dans checkMetaobjectStatus:", error);
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

/**
 * Crée une nouvelle entrée de métaobjet
 */
export async function createMetaobjectEntry(
  admin: AdminApiContext,
  fields: {
    identification: string;
    name: string;
    email: string;
    code: string;
    montant: number;
    type: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const mutation = `
    mutation metaobjectCreate($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    metaobject: {
      type: METAOBJECT_TYPE,
      fields: [
        { key: "identification", value: fields.identification },
        { key: "name", value: fields.name },
        { key: "email", value: fields.email },
        { key: "code", value: fields.code },
        { key: "montant", value: String(fields.montant) },
        { key: "type", value: fields.type },
      ],
    },
  };

  try {
    const response = await admin.graphql(mutation, { variables });
    const data = await response.json() as {
      errors?: Array<{ message: string }>;
      data?: {
        metaobjectCreate?: {
          metaobject?: { id: string };
          userErrors?: Array<{ field: string[]; message: string }>;
        };
      };
    };

    if (data.errors) {
      return { success: false, error: JSON.stringify(data.errors) };
    }

    if (data.data?.metaobjectCreate?.userErrors?.length > 0) {
      const errors = data.data.metaobjectCreate.userErrors;
      return {
        success: false,
        error: errors.map((e: { message: string }) => e.message).join(", "),
      };
    }

    return { success: !!data.data?.metaobjectCreate?.metaobject };
  } catch (error) {
    console.error("Erreur lors de la création de l'entrée:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Met à jour une entrée de métaobjet
 */
export async function updateMetaobjectEntry(
  admin: AdminApiContext,
  id: string,
  fields: {
    identification?: string;
    name?: string;
    email?: string;
    code?: string;
    montant?: number;
    type?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const mutation = `
    mutation metaobjectUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const fieldsArray: Array<{ key: string; value: string }> = [];
  if (fields.identification !== undefined) fieldsArray.push({ key: "identification", value: fields.identification });
  if (fields.name !== undefined) fieldsArray.push({ key: "name", value: fields.name });
  if (fields.email !== undefined) fieldsArray.push({ key: "email", value: fields.email });
  if (fields.code !== undefined) fieldsArray.push({ key: "code", value: fields.code });
  if (fields.montant !== undefined) fieldsArray.push({ key: "montant", value: String(fields.montant) });
  if (fields.type !== undefined) fieldsArray.push({ key: "type", value: fields.type });

  const variables = {
    id,
    metaobject: {
      fields: fieldsArray,
    },
  };

  try {
    const response = await admin.graphql(mutation, { variables });
    const data = await response.json() as {
      errors?: Array<{ message: string }>;
      data?: {
        metaobjectUpdate?: {
          metaobject?: { id: string };
          userErrors?: Array<{ field: string[]; message: string }>;
        };
      };
    };

    if (data.errors) {
      return { success: false, error: JSON.stringify(data.errors) };
    }

    if (data.data?.metaobjectUpdate?.userErrors?.length > 0) {
      const errors = data.data.metaobjectUpdate.userErrors;
      return {
        success: false,
        error: errors.map((e: { message: string }) => e.message).join(", "),
      };
    }

    return { success: !!data.data?.metaobjectUpdate?.metaobject };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entrée:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Supprime une entrée de métaobjet
 */
export async function deleteMetaobjectEntry(
  admin: AdminApiContext,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const mutation = `
    mutation metaobjectDelete($id: ID!) {
      metaobjectDelete(id: $id) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = { id };

  try {
    const response = await admin.graphql(mutation, { variables });
    const data = await response.json() as {
      errors?: Array<{ message: string }>;
      data?: {
        metaobjectDelete?: {
          deletedId?: string;
          userErrors?: Array<{ field: string[]; message: string }>;
        };
      };
    };

    if (data.errors) {
      return { success: false, error: JSON.stringify(data.errors) };
    }

    if (data.data?.metaobjectDelete?.userErrors?.length > 0) {
      const errors = data.data.metaobjectDelete.userErrors;
      return {
        success: false,
        error: errors.map((e: { message: string }) => e.message).join(", "),
      };
    }

    return { success: !!data.data?.metaobjectDelete?.deletedId };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entrée:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Récupère toutes les entrées du métaobjet
 */
export async function getMetaobjectEntries(admin: AdminApiContext): Promise<{
  entries: Array<{
    id: string;
    identification?: string;
    name?: string;
    email?: string;
    code?: string;
    montant?: number;
    type?: string;
  }>;
  error?: string;
}> {
  const query = `
    query {
      metaobjects(first: 250, type: "${METAOBJECT_TYPE}") {
        edges {
          node {
            id
            fields {
              key
              value
            }
          }
        }
      }
    }
  `;

  try {
    const response = await admin.graphql(query);
    const data = await response.json() as {
      data?: {
        metaobjects?: {
          edges?: Array<{
            node?: {
              id: string;
              fields?: Array<{
                key: string;
                value: string | number;
              }>;
            };
          }>;
        };
      };
      errors?: Array<{ message: string }>;
    };

    if (data.errors) {
      return { entries: [], error: data.errors.map(e => e.message).join(", ") };
    }

    const edges = data.data?.metaobjects?.edges || [];
    const entries = edges.map(edge => {
      const node = edge.node;
      if (!node) return null;

      const entry: {
        id: string;
        identification?: string;
        name?: string;
        email?: string;
        code?: string;
        montant?: number;
        type?: string;
      } = { id: node.id };

      node.fields?.forEach(field => {
        if (field.key === "identification") entry.identification = String(field.value);
        if (field.key === "name") entry.name = String(field.value);
        if (field.key === "email") entry.email = String(field.value);
        if (field.key === "code") entry.code = String(field.value);
        if (field.key === "montant") entry.montant = Number(field.value);
        if (field.key === "type") entry.type = String(field.value);
      });

      return entry;
    }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return { entries };
  } catch (error) {
    console.error("Erreur lors de la récupération des entrées:", error);
    return {
      entries: [],
      error: error instanceof Error ? error.message : "Erreur inconnue"
    };
  }
}

