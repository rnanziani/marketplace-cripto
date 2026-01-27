import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Marketplace Cripto</h3>
          <p>Plataforma P2P para comprar y vender criptomonedas de forma segura</p>
        </div>
        
        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#about">Acerca de</a></li>
            <li><a href="#contact">Contacto</a></li>
            <li><a href="#terms">Términos y Condiciones</a></li>
            <li><a href="#privacy">Privacidad</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Redes Sociales</h4>
          <div className="social-links">
            <a href="#" aria-label="Twitter">Twitter</a>
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="LinkedIn">LinkedIn</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Marketplace Cripto. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
