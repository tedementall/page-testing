import { useState } from "react";

import { createNews } from "../api/NewsApi"; 

export default function NewsAdmin() {
  const [showModal, setShowModal] = useState(false);
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
      setShowModal(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
           <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Gestor de Noticias</h2>
           <p style={{ opacity: 0.7 }}>Sube contenido nuevo para el blog.</p>
        </div>
        <button 
          className="btn-glass-white" 
          onClick={() => setShowModal(true)}
        >
          + Nueva Noticia
        </button>
      </div>

      <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ opacity: 0.5 }}>Aquí iría la lista de noticias para editar/borrar.</p>
        <button className="btn-glass" onClick={() => setShowModal(true)}>
            Crear la primera noticia
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="custom-modal glass" style={{ maxWidth: '600px', background: '#1a1a2e' }}>
            <div className="modal-header">
              <h3>Crear Noticia</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <label>Título</label>
              <input 
                className="modal-input" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                placeholder="Ej: Nueva feature en The Hub..."
              />

              <label>Contenido</label>
              <textarea 
                className="modal-input" 
                value={body} 
                onChange={e => setBody(e.target.value)} 
                required 
                rows={5}
                placeholder="Escribe el cuerpo de la noticia..."
              />

              <label>Imagen de Portada (Obligatoria)</label>
              <div style={{ marginBottom: '1rem' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  style={{ color: '#fff' }}
                />
              </div>
              
              {preview && (
                <img 
                  src={preview} 
                  alt="Preview" 
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '1rem' }} 
                />
              )}

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
                <button type="button" className="btn-glass" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-glass-white" disabled={loading}>
                  {loading ? "Subiendo..." : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}