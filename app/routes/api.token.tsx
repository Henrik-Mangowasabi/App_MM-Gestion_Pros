import type { LoaderFunctionArgs } from "react-router";
import { json } from "react-router";
import { authenticate } from "../shopify.server";
import crypto from "crypto";

/**
 * Route API pour générer un token temporaire sécurisé pour la page externe
 * Ce token permet à la page externe d'appeler l'API Shopify
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Générer un token temporaire (valide 1 heure)
  // En production, utilisez JWT ou un système de tokens plus robuste
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
  
  // TODO: Stocker le token dans une base de données avec session.shop et expiresAt
  // Pour l'instant, on retourne directement l'accessToken (à améliorer en production)
  
  return json({
    token: session.accessToken, // En production, retournez le token temporaire
    shop: session.shop,
    expiresAt: expiresAt.toISOString(),
    // Note: En production, la page externe devra échanger ce token
    // contre l'accessToken via une autre route API sécurisée
  });
};

