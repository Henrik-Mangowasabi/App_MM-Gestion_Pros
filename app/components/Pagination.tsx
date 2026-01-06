interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Nombre maximum de boutons visibles

    if (totalPages <= maxVisible) {
      // Si peu de pages, afficher toutes
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique avec ellipses
      if (currentPage <= 3) {
        // Début : 1 2 3 4 ... 10
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Fin : 1 ... 7 8 9 10
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // Milieu : 1 ... 4 5 6 ... 10
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const pageButtonStyle = (isActive: boolean) => ({
    minWidth: "40px",
    height: "40px",
    padding: "0 12px",
    border: isActive ? "none" : "1px solid #e1e3e5",
    backgroundColor: isActive ? "#6366f1" : "white",
    color: isActive ? "white" : "#333",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: isActive ? "700" : "500",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    boxShadow: isActive ? "0 2px 6px rgba(99, 102, 241, 0.3)" : "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const navButtonStyle = {
    minWidth: "40px",
    height: "40px",
    padding: "0 12px",
    border: "1px solid #e1e3e5",
    backgroundColor: "white",
    color: "#666",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const hoverStyles = `
    .page-btn:hover:not(.active):not(.ellipsis) {
      background-color: #f3f4f6;
      border-color: #6366f1;
      color: #6366f1;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .page-btn.active {
      background-color: #6366f1;
      color: white;
    }
    .nav-btn-pagination:hover {
      background-color: #f3f4f6;
      border-color: #6366f1;
      color: #6366f1;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px 15px",
        gap: "8px",
        backgroundColor: "white",
        borderTop: "1px solid #e1e3e5",
      }}
    >
      <style>{hoverStyles}</style>

      {/* Bouton Précédent */}
      {currentPage > 1 && (
        <button
          className="nav-btn-pagination"
          onClick={() => onPageChange(currentPage - 1)}
          style={navButtonStyle}
          title="Page précédente"
        >
          ‹
        </button>
      )}

      {/* Numéros de pages */}
      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="page-btn ellipsis"
              style={{
                minWidth: "40px",
                height: "40px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: "1rem",
                cursor: "default",
              }}
            >
              …
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            className={`page-btn ${isActive ? "active" : ""}`}
            onClick={() => onPageChange(pageNum)}
            style={pageButtonStyle(isActive)}
            title={`Page ${pageNum}`}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Bouton Suivant */}
      {currentPage < totalPages && (
        <button
          className="nav-btn-pagination"
          onClick={() => onPageChange(currentPage + 1)}
          style={navButtonStyle}
          title="Page suivante"
        >
          ›
        </button>
      )}
    </div>
  );
}
