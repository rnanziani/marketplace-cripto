import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PublicacionesProvider } from './context/PublicacionesContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Perfil from './pages/Perfil'
import CrearPublicacion from './pages/CrearPublicacion'
import GaleriaPublicaciones from './pages/GaleriaPublicaciones'
import DetallePublicacion from './pages/DetallePublicacion'
import './App.css'

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Cargando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppContent() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/publicaciones" element={<GaleriaPublicaciones />} />
          <Route path="/publicaciones/:id" element={<DetallePublicacion />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/publicaciones/crear"
            element={
              <ProtectedRoute>
                <CrearPublicacion />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <PublicacionesProvider>
        <AppContent />
      </PublicacionesProvider>
    </AuthProvider>
  )
}

export default App
