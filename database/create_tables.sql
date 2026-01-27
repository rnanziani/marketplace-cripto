-- =============================================
-- BD_CRIPTO - Creación de Base de Datos
-- PostgreSQL
-- =============================================

-- Paso 2: Crear las tablas (ahora dentro de marketplacecripto)

-- 1. USUARIOS
CREATE TABLE tbl_00_usuarios (
    id_00 SERIAL PRIMARY KEY,
    email_00 VARCHAR(255) UNIQUE NOT NULL,
    username_00 VARCHAR(50) UNIQUE NOT NULL,
    password_hash_00 VARCHAR(255) NOT NULL,
    telefono_00 VARCHAR(20),
    pais_00 VARCHAR(50),
    kyc_verificado_00 BOOLEAN DEFAULT FALSE,
    created_at_00 TIMESTAMP DEFAULT NOW()
);

-- 2. WALLETS
CREATE TABLE tbl_01_wallets (
    id_01 SERIAL PRIMARY KEY,
    usuario_id_01 INTEGER NOT NULL REFERENCES tbl_00_usuarios(id_00) ON DELETE CASCADE,
    direccion_01 VARCHAR(255) NOT NULL,
    saldo_disponible_01 DECIMAL(15,8) DEFAULT 0.00000000
);
CREATE INDEX idx_wallets_usuario ON tbl_01_wallets(usuario_id_01);

-- 3. PUBLICACIONES
CREATE TABLE tbl_02_publicaciones (
    id_02 SERIAL PRIMARY KEY,
    usuario_id_02 INTEGER NOT NULL REFERENCES tbl_00_usuarios(id_00) ON DELETE CASCADE,
    tipo_02 VARCHAR(10) NOT NULL CHECK (tipo_02 IN ('COMPRA', 'VENTA')),
    criptomoneda_02 VARCHAR(10) NOT NULL,
    cantidad_02 DECIMAL(15,8) NOT NULL,
    precio_unitario_02 DECIMAL(15,2) NOT NULL,
    moneda_fiat_02 VARCHAR(3) DEFAULT 'USD' NOT NULL,
    metodos_pago_02 TEXT[],
    descripcion_02 TEXT,
    ubicacion_02 VARCHAR(255),
    estado_02 VARCHAR(20) DEFAULT 'ACTIVO' 
        CHECK (estado_02 IN ('ACTIVO', 'PAUSADO', 'FINALIZADO', 'CANCELADO')),
    created_at_02 TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_publicaciones_usuario ON tbl_02_publicaciones(usuario_id_02);
CREATE INDEX idx_publicaciones_busqueda ON tbl_02_publicaciones(criptomoneda_02, estado_02);

-- 4. IMÁGENES DE PUBLICACIONES
CREATE TABLE tbl_03_imagenes_publicaciones (
    id_03 SERIAL PRIMARY KEY,
    publicacion_id_03 INTEGER NOT NULL REFERENCES tbl_02_publicaciones(id_02) ON DELETE CASCADE,
    url_imagen_03 VARCHAR(500) NOT NULL,
    es_principal_03 BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_imagenes_publicacion ON tbl_03_imagenes_publicaciones(publicacion_id_03);

-- 5. TRANSACCIONES
CREATE TABLE tbl_04_transacciones (
    id_04 SERIAL PRIMARY KEY,
    comprador_id_04 INTEGER NOT NULL REFERENCES tbl_00_usuarios(id_00) ON DELETE RESTRICT,
    vendedor_id_04 INTEGER NOT NULL REFERENCES tbl_00_usuarios(id_00) ON DELETE RESTRICT,
    publicacion_id_04 INTEGER NOT NULL REFERENCES tbl_02_publicaciones(id_02) ON DELETE RESTRICT,
    cantidad_04 DECIMAL(15,8) NOT NULL,
    precio_total_04 DECIMAL(15,2) NOT NULL,
    estado_04 VARCHAR(20) DEFAULT 'PENDIENTE'
        CHECK (estado_04 IN ('PENDIENTE', 'EN_ESPERA_PAGO', 'COMPLETADA', 'CANCELADA', 'DISPUTA')),
    hash_transaccion_04 VARCHAR(255),
    calificacion_comprador_04 INTEGER CHECK (calificacion_comprador_04 BETWEEN 1 AND 5),
    calificacion_vendedor_04 INTEGER CHECK (calificacion_vendedor_04 BETWEEN 1 AND 5),
    created_at_04 TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_transacciones_comprador ON tbl_04_transacciones(comprador_id_04);
CREATE INDEX idx_transacciones_vendedor ON tbl_04_transacciones(vendedor_id_04);

-- 6. MENSAJES
CREATE TABLE tbl_05_mensajes (
    id_05 SERIAL PRIMARY KEY,
    remitente_id_05 INTEGER NOT NULL REFERENCES tbl_00_usuarios(id_00) ON DELETE CASCADE,
    destinatario_id_05 INTEGER NOT NULL REFERENCES tbl_00_usuarios(id_00) ON DELETE CASCADE,
    publicacion_id_05 INTEGER NOT NULL REFERENCES tbl_02_publicaciones(id_02) ON DELETE CASCADE,
    contenido_05 TEXT NOT NULL,
    leido_05 BOOLEAN DEFAULT FALSE,
    created_at_05 TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_mensajes_conversacion ON tbl_05_mensajes(publicacion_id_05, remitente_id_05, destinatario_id_05);

-- Mensaje final
COMMENT ON DATABASE marketplacecripto IS 'Base de datos para Marketplace P2P de Criptomonedas - Hito 1 Desafío Latam';
