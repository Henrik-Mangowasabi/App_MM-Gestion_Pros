# Page Externe - Guide de Développement

## Architecture Simplifiée

L'app Shopify sert uniquement à :
- ✅ Authentification OAuth avec Shopify
- ✅ Affichage de votre page externe (iframe ou lien)

Toute la logique métier est dans votre page externe.

## Configuration

### 1. Variable d'environnement

Ajoutez dans votre `.env` :
```
EXTERNAL_APP_URL=http://localhost:3001
# ou
EXTERNAL_APP_URL=https://votre-domaine.com
```

### 2. Créer votre page externe

Créez une application séparée (React, Vue, HTML simple, etc.) sur un autre serveur.

## Communication avec Shopify

### Option A : Via l'API de l'app (Recommandé)

Votre page externe appelle l'API de votre app Shopify :

```javascript
// Dans votre page externe
async function getShopifyToken() {
  // Appeler l'API de votre app Shopify
  const response = await fetch('https://votre-app-shopify.com/api/token', {
    credentials: 'include', // Important pour les cookies de session
  });
  const data = await response.json();
  return data.token;
}

// Utiliser le token pour appeler l'API Shopify
async function callShopifyAPI() {
  const token = await getShopifyToken();
  const shop = 'votre-boutique.myshopify.com';
  
  const response = await fetch(`https://${shop}/admin/api/2025-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({
      query: `
        mutation {
          metaobjectDefinitionCreate(definition: {
            name: "MM Pro de santé"
            type: "mm_pro_de_sante"
            fieldDefinitions: [...]
          }) {
            metaobjectDefinition { id }
          }
        }
      `
    }),
  });
  
  return response.json();
}
```

### Option B : Via Proxy API dans l'app

Créez des routes API dans l'app qui font le pont :

```typescript
// app/routes/api.metaobject.create.tsx
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  // Créer le métaobjet
  const result = await createMetaobject(admin);
  return json(result);
};
```

Puis dans votre page externe :
```javascript
const response = await fetch('https://votre-app-shopify.com/api/metaobject/create', {
  method: 'POST',
  credentials: 'include',
});
```

## Sécurité

⚠️ **IMPORTANT** : Ne passez JAMAIS le token directement dans l'URL ou dans le code client.

1. Utilisez des tokens temporaires (JWT recommandé)
2. Stockez les tokens dans une base de données avec expiration
3. Validez toujours les tokens côté serveur
4. Utilisez HTTPS en production

## Exemple de Structure

```
votre-projet/
├── shopify-app/          # App Shopify (minimale)
│   ├── app/
│   │   └── routes/
│   │       ├── app._index.tsx  # Affiche iframe/lien
│   │       └── api.token.tsx   # API pour tokens
│   └── ...
│
└── external-app/         # Votre page externe
    ├── src/
    │   └── App.jsx       # Toute votre logique
    └── ...
```

## Avantages

✅ **Simplicité** : Pas de contraintes Shopify UI  
✅ **Flexibilité** : Utilisez n'importe quel framework  
✅ **Maintenance** : Code métier séparé de l'auth  
✅ **Performance** : Déploiement indépendant  

## Prochaines Étapes

1. Créez votre page externe (React, Vue, ou HTML simple)
2. Configurez `EXTERNAL_APP_URL` dans `.env`
3. Implémentez l'échange de tokens (Option A ou B)
4. Développez votre logique métier dans la page externe

