import { useState } from "react";
import { createNews } from "../api/NewsApi";

export default function NewsAdmin() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("¡Falta la foto! 📸");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      formData.append("cover", image);

      await createNews(formData);

      alert("¡Noticia subida con éxito! 🚀");

      setTitle("");
      setBody("");
      setImage(null);
      setPreview(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-content fade-in">
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
        
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Nueva Noticia
          </h2>
          <p style={{ opacity: 0.7 }}>Publica novedades para el blog de The Hub.</p>
        </div>

        <div className="glass" style={{ padding: "3rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#ccc" }}>
                Título de la Noticia
              </label>
              <input
                type="text"
                className="form-control" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Lanzamiento del nuevo iPhone..."
                required
                style={{ width: "100%", padding: "12px", fontSize: "1rem" }}
              />
            </div>

            {/* Contenido (TextArea grande) */}
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#ccc" }}>
                Contenido
              </label>
              <textarea
                className="form-control"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escribe aquí todo el chisme..."
                required
                rows={8}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  fontSize: "1rem", 
                  height: "auto",
                  minHeight: "150px"
                }}
              />
            </div>

            {/* Subida de Imagen */}
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#ccc" }}>
                Imagen de Portada
              </label>
              
              <div 
                style={{ 
                  border: "2px dashed rgba(255,255,255,0.2)", 
                  borderRadius: "12px", 
                  padding: "2rem",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.05)"
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="btn-glass" style={{ cursor: "pointer", marginBottom: "1rem" }}>
                  {image ? "Cambiar Imagen" : "Seleccionar Archivo"}
                </label>
                
                {image ? (
                  <p style={{ fontSize: "0.9rem", color: "#fff" }}>{image.name}</p>
                ) : (
                  <p style={{ fontSize: "0.9rem", opacity: 0.6 }}>O arrastra la imagen aquí</p>
                )}
              </div>

              {preview && (
                <div style={{ marginTop: "1.5rem" }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button
                type="submit"
                className="btn-glass-white" 
                disabled={loading}
                style={{ 
                  width: "100%", 
                  padding: "1rem", 
                  fontSize: "1.1rem",
                  background: "linear-gradient(90deg, #d05ce3 0%, #9a00bf 100%)", 
                  border: "none"
                }}
              >
                {loading ? "Publicando..." : "Publicar Noticia ✨"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}