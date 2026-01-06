# Configuration des Variables d'Environnement

## Variables Shopify (Obligatoires)

```
SHOPIFY_API_KEY=votre_api_key
SHOPIFY_API_SECRET=votre_api_secret
SCOPES=read_customers,write_customers,read_discounts,write_discounts,write_metaobject_definitions,read_metaobjects,write_metaobjects,read_products,write_products,read_locales,read_orders,read_store_credit_accounts,write_store_credit_account_transactions
SHOPIFY_APP_URL=https://votre-app.onrender.com
DATABASE_URL=file:./dev.sqlite
```

## Variables de Sécurité (Recommandées)

### Mot de passe Admin

Pour sécuriser l'accès aux modifications dans l'interface admin :

```
ADMIN_PASSWORD=VotreMotDePasseSecurise
```

**Par défaut** : Si non défini, le mot de passe sera `GestionPro`

**⚠️ IMPORTANT** : Changez ce mot de passe en production !

### Niveau de Logs

Pour contrôler la verbosité des logs (utile en production) :

```
LOG_LEVEL=INFO
```

**Valeurs possibles** :

- `DEBUG` : Tous les logs (développement)
- `INFO` : Logs informatifs et supérieurs (recommandé en production)
- `WARN` : Avertissements et erreurs uniquement
- `ERROR` : Erreurs critiques uniquement

**Par défaut** : `INFO`

## Comment configurer

1. Copiez ces variables dans votre fichier `.env` (local)
2. Sur Render.com ou votre hébergeur, ajoutez ces variables dans les "Environment Variables"
3. Redémarrez l'application après modification

## Sécurité

- ❌ Ne commitez JAMAIS le fichier `.env` dans Git
- ✅ Utilisez des mots de passe forts en production
- ✅ Changez régulièrement vos secrets
