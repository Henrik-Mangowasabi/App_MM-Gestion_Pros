import type { LoaderFunctionArgs } from "react-router";
import { json } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * Route API pour obtenir le token d'accès Shopify
 * Utilisée par la page externe pour appeler l'API Shopify
 * 
 * GET /api/token
 * Retourne: { shop: string, token: string }
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    
    // ⚠️ SÉCURITÉ: En production, générez un token temporaire (JWT)
    // et stockez-le dans une base de données avec expiration
    // Ne retournez JAMAIS directement l'accessToken en production
    
    return json({
      shop: session.shop,
      token: session.accessToken, // ⚠️ À remplacer par un token temporaire en production
      // expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 heure
    });
  } catch (error) {
    return json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }
};

