import React from "react";

// Lista manual de archivos en public/assets/documents
const archivos = [
  {
    nombre: "Estatuto Sindicato",
    url: "/assets/documents/Estatuto Asura.pdf",
    tipo: "pdf",
  },
  {
    nombre: "Convenio Colectivo de Trabajo",
    url: "/assets/documents/CCT reciclaje .docx",
    tipo: "pdf",
  },
  {
    nombre: "Resolucion Ministerial",
    url: "/assets/documents/20220307.pdf",
    tipo: "pdf",
  },
  {
    nombre: "Prestadores",
    url: "/assets/documents/prestadores en santiago.jpg",
    tipo: "imagen",
  },
  {
    nombre: "Foto Evento",
    url: "/assets/documents/prestadores en santiago2.jpg",
    tipo: "imagen",
  },
];

const styles: React.CSSProperties = {
  maxWidth: 600,
  margin: "40px auto",
  padding: 24,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "8px 20px",
  marginTop: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 16,
  boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
  transition: "background 0.2s, transform 0.2s",
};

const buttonHoverStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #1565c0 0%, #1976d2 100%)",
  transform: "scale(1.05)",
};

const itemStyle: React.CSSProperties = {
  marginBottom: 32,
  padding: 16,
  borderRadius: 8,
  background: "#f5f7fa",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  display: "flex",
  alignItems: "center",
  gap: 24,
};

const Descargas: React.FC = () => {
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <div style={styles}>
      <h1 style={{ textAlign: "center", marginBottom: 32, color: "#1976d2" }}>
        Documentos y Fotos
      </h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {archivos.map((archivo) => (
          <li key={archivo.url} style={itemStyle}>
            {archivo.tipo === "pdf" ? (
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500, fontSize: 18 }}>
                  📄 {archivo.nombre}
                </span>
                <br />
                <a
                  href={archivo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{
                    ...buttonStyle,
                    ...(hovered === archivo.url ? buttonHoverStyle : {}),
                    display: "inline-block",
                  }}
                  onMouseEnter={() => setHovered(archivo.url)}
                  onMouseLeave={() => setHovered(null)}
                >
                  Descargar
                </a>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500, fontSize: 18 }}>
                  🖼️ {archivo.nombre}
                </span>
                <br />
                <img
                  src={archivo.url}
                  alt={archivo.nombre}
                  style={{
                    maxWidth: 120,
                    margin: "10px 0",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <br />
                <a
                  href={archivo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{
                    ...buttonStyle,
                    ...(hovered === archivo.url ? buttonHoverStyle : {}),
                    display: "inline-block",
                  }}
                  onMouseEnter={() => setHovered(archivo.url)}
                  onMouseLeave={() => setHovered(null)}
                >
                  Descargar
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Descargas;