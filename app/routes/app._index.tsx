import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useActionData, Form, redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { checkMetaobjectStatus, createMetaobject, getMetaobjectEntries } from "../lib/metaobject.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const status = await checkMetaobjectStatus(admin);
  
  let entries: Array<{
    id: string;
    identification?: string;
    name?: string;
    email?: string;
    code?: string;
    montant?: number;
    type?: string;
  }> = [];
  
  if (status.exists) {
    const entriesResult = await getMetaobjectEntries(admin);
    entries = entriesResult.entries;
  }
  
  return { status, entries };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const result = await createMetaobject(admin);
  
  if (result.success) {
    // Attendre un peu pour que Shopify propage la création
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Recharger la page
    return redirect("/app");
  }
  
  return { error: result.error || "Erreur lors de la création" };
};

export default function Index() {
  const { status, entries } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      padding: "2rem",
      backgroundColor: "#f5f5f5",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ color: "#333", marginBottom: "2rem", textAlign: "center" }}>app page web</h1>
      
      {actionData?.error && (
        <div style={{
          padding: "1rem",
          marginBottom: "1rem",
          backgroundColor: "#fee",
          color: "#c33",
          borderRadius: "4px",
          maxWidth: "800px",
          margin: "0 auto 1rem"
        }}>
          Erreur : {actionData.error}
        </div>
      )}
      
      {status.exists ? (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            padding: "1rem 2rem",
            backgroundColor: "#efe",
            color: "#3a3",
            borderRadius: "4px",
            fontSize: "1.2rem",
            marginBottom: "2rem",
            textAlign: "center"
          }}>
            Structure créée !
          </div>
          
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#333" }}>
              Entrées du métaobjet ({entries.length})
            </h2>
            
            {entries.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "2rem" }}>
                Aucune entrée pour le moment
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f8f8" }}>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>ID</th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Identification</th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Name</th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Email</th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Code</th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Montant</th>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => (
                      <tr key={entry.id} style={{
                        borderBottom: "1px solid #eee",
                        backgroundColor: index % 2 === 0 ? "white" : "#fafafa"
                      }}>
                        <td style={{ padding: "12px", color: "#666", fontSize: "0.9em" }}>
                          {entry.id.split("/").pop()?.slice(-8)}
                        </td>
                        <td style={{ padding: "12px" }}>{entry.identification || "-"}</td>
                        <td style={{ padding: "12px" }}>{entry.name || "-"}</td>
                        <td style={{ padding: "12px" }}>{entry.email || "-"}</td>
                        <td style={{ padding: "12px" }}>{entry.code || "-"}</td>
                        <td style={{ padding: "12px" }}>{entry.montant !== undefined ? entry.montant : "-"}</td>
                        <td style={{ padding: "12px" }}>{entry.type || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <Form method="post">
            <button
              type="submit"
              style={{
                padding: "12px 24px",
                fontSize: "1rem",
                backgroundColor: "#008060",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Créer structure
            </button>
          </Form>
        </div>
      )}
    </div>
  );
}