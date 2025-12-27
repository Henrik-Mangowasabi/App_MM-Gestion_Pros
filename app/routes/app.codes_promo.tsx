import { useLoaderData, Link } from "react-router";
import { authenticate } from "../shopify.server";
import { getMetaobjectEntries } from "../lib/metaobject.server";

export const loader = async ({ request }: any) => {
  const { admin } = await authenticate.admin(request);
  const { entries } = await getMetaobjectEntries(admin);
  return { entries };
};

export default function CodesPromoPage() {
  const { entries } = useLoaderData<typeof loader>();

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      padding: "2rem",
      backgroundColor: "#f5f5f5",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ color: "#333", marginBottom: "2rem", textAlign: "center" }}>
        Vue d'ensemble des Codes Promo
      </h1>

      <div style={{ maxWidth: "1200px", margin: "0 auto", marginBottom: "2rem" }}>
        <div style={{ 
          padding: "1rem 2rem", 
          backgroundColor: "#fff", 
          borderLeft: "4px solid #008060",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}>
          <p style={{ margin: 0, color: "#555" }}>
            Cette page liste tous les codes promo créés automatiquement via la gestion des Pros de Santé.<br/>
            Si vous modifiez un pro dans la page d'accueil, le code promo ici sera mis à jour instantanément.
          </p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#333" }}>
            Codes Actifs ({entries.length})
          </h2>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f8f8" }}>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Nom du Pro</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Code Promo</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Valeur</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Nom Technique (Shopify)</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Statut Sync</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: any, index: number) => (
                  <tr key={entry.id} style={{
                    borderBottom: "1px solid #eee",
                    backgroundColor: index % 2 === 0 ? "white" : "#fafafa"
                  }}>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {entry.name}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ 
                        backgroundColor: "#e3f1df", 
                        color: "#008060", 
                        padding: "4px 8px", 
                        borderRadius: "4px", 
                        fontWeight: "600",
                        fontFamily: "monospace"
                      }}>
                        {entry.code}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {entry.montant} {entry.type}
                    </td>
                    <td style={{ padding: "12px", color: "#666", fontSize: "0.9em" }}>
                      Code promo Pro Sante - {entry.name}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {entry.discount_id ? (
                        <span style={{ color: "#008060", display: "flex", alignItems: "center", gap: "5px" }}>
                          <span style={{ fontSize: "1.2em" }}>●</span> Actif & Lié
                        </span>
                      ) : (
                        <span style={{ color: "#d82c0d", display: "flex", alignItems: "center", gap: "5px" }}>
                          <span style={{ fontSize: "1.2em" }}>●</span> Non lié
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                      Aucun code promo actif.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Link to="/app" style={{ 
            textDecoration: "none", 
            color: "#008060", 
            fontWeight: "bold",
            border: "1px solid #008060",
            padding: "10px 20px",
            borderRadius: "4px",
            backgroundColor: "white",
            transition: "all 0.2s"
          }}>
            ← Retour à la gestion des Pros
          </Link>
        </div>
      </div>
    </div>
  );
}