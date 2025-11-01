-- Ethiopian Agri-Chain Transparency and Monitoring System (EATMS)
-- Database Schema Design

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE USER_TYPE AS ENUM ('FARMER', 'TRADER', 'TRANSPORTER', 'GOVERNMENT_OFFICIAL', 'ADMIN');
CREATE TYPE CROP_TYPE AS ENUM ('TEFF', 'WHEAT', 'MAIZE', 'BARLEY', 'SORGHUM', 'COFFEE', 'ENSET', 'FRUITS', 'VEGETABLES', 'SPICES', 'OTHER');
CREATE TYPE TRANSPORT_STATUS AS ENUM ('PENDING', 'IN_TRANSIT', 'DELAYED', 'COMPLETED', 'CANCELLED', 'LOST');
CREATE TYPE VEHICLE_TYPE AS ENUM ('TRUCK', 'VAN', 'MOTORCYCLE', 'TRICYCLE', 'OTHER');
CREATE TYPE PAYMENT_STATUS AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE ALERT_TYPE AS ENUM ('TEMPERATURE_ALERT', 'DELAY_ALERT', 'ROUTE_DEVIATION', 'DELIVERY_ISSUE', 'PRICE_ANOMALY');

-- TABLE: USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type USER_TYPE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    registration_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: USER_PROFILES
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Farmer specific fields
    farm_name VARCHAR(100),
    farm_location GEOMETRY(POINT, 4326),
    farm_size_hectares DECIMAL(10,2),
    primary_crop_type CROP_TYPE[],
    years_experience INTEGER,
    -- Trader specific fields
    business_name VARCHAR(100),
    business_license_number VARCHAR(50),
    market_location GEOMETRY(POINT, 4326),
    -- Transporter specific fields
    company_name VARCHAR(100),
    license_number VARCHAR(50),
    fleet_size INTEGER,
    -- Government specific fields
    department VARCHAR(100),
    position VARCHAR(100),
    region VARCHAR(100),
    -- Common fields
    profile_image_url VARCHAR(255),
    bio TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: LOCATIONS
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    zone VARCHAR(100),
    woreda VARCHAR(100),
    kebele VARCHAR(100),
    geolocation GEOMETRY(POINT, 4326),
    elevation_meters DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: CROPS
CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    crop_type CROP_TYPE NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(20) NOT NULL, -- e.g., 'kg', 'quintal', 'tons'
    image_url VARCHAR(255),
    storage_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: PRODUCE_LISTINGS
CREATE TABLE produce_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES users(id),
    crop_id UUID NOT NULL REFERENCES crops(id),
    quantity DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    quality_grade VARCHAR(20), -- e.g., 'Grade A', 'Grade B', 'Standard'
    harvest_date DATE NOT NULL,
    available_from TIMESTAMPTZ NOT NULL,
    available_until TIMESTAMPTZ,
    location_id UUID NOT NULL REFERENCES locations(id),
    description TEXT,
    images TEXT[], -- Array of image URLs
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, RESERVED, SOLD, EXPIRED
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_crop_id (crop_id),
    INDEX idx_location_id (location_id),
    INDEX idx_status (status)
);

-- TABLE: TRANSPORT_VEHICLES
CREATE TABLE transport_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transporter_id UUID NOT NULL REFERENCES users(id),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VEHICLE_TYPE NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    capacity_kg DECIMAL(10,2),
    has_refrigeration BOOLEAN DEFAULT FALSE,
    gps_device_id VARCHAR(50),
    certification_number VARCHAR(50),
    insurance_expiry_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: TRANSPORT_ROUTES
CREATE TABLE transport_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_id UUID NOT NULL REFERENCES locations(id),
    destination_id UUID NOT NULL REFERENCES locations(id),
    distance_km DECIMAL(10,2) NOT NULL,
    estimated_duration_hours DECIMAL(5,2) NOT NULL,
    road_conditions VARCHAR(50), -- e.g., 'GOOD', 'FAIR', 'POOR'
    toll_cost DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: SHIPMENTS
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    farmer_id UUID NOT NULL REFERENCES users(id),
    trader_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID NOT NULL REFERENCES transport_vehicles(id),
    route_id UUID NOT NULL REFERENCES transport_routes(id),
    produce_listing_id UUID NOT NULL REFERENCES produce_listings(id),
    quantity DECIMAL(12,2) NOT NULL,
    agreed_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    pickup_location_id UUID NOT NULL REFERENCES locations(id),
    delivery_location_id UUID NOT NULL REFERENCES locations(id),
    scheduled_pickup_time TIMESTAMPTZ NOT NULL,
    estimated_delivery_time TIMESTAMPTZ NOT NULL,
    actual_pickup_time TIMESTAMPTZ,
    actual_delivery_time TIMESTAMPTZ,
    status TRANSPORT_STATUS NOT NULL DEFAULT 'PENDING',
    temperature_range_min DECIMAL(5,2),
    temperature_range_max DECIMAL(5,2),
    humidity_range_min DECIMAL(5,2),
    humidity_range_max DECIMAL(5,2),
    qr_code_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_trader_id (trader_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_status (status)
);

-- TABLE: TRANSPORT_TRACKING
CREATE TABLE transport_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES transport_vehicles(id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location GEOMETRY(POINT, 4326) NOT NULL,
    speed_kmh DECIMAL(5,2),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    shock_detected BOOLEAN DEFAULT FALSE,
    fuel_level DECIMAL(5,2),
    driver_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_shipment_id (shipment_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_timestamp (timestamp)
);

-- TABLE: PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    payment_method VARCHAR(50), -- e.g., 'Mobile Money', 'Bank Transfer'
    transaction_id VARCHAR(100),
    status PAYMENT_STATUS NOT NULL DEFAULT 'PENDING',
    paid_by UUID REFERENCES users(id),
    paid_to UUID REFERENCES users(id),
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_shipment_id (shipment_id),
    INDEX idx_status (status)
);

-- TABLE: MARKET_PRICES
CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID NOT NULL REFERENCES crops(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    price_per_unit DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    unit_of_measure VARCHAR(20) NOT NULL,
    price_date DATE NOT NULL,
    source_type VARCHAR(50), -- e.g., 'MARKET_SURVEY', 'TRANSACTION', 'ESTIMATED'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_crop_id (crop_id),
    INDEX idx_location_id (location_id),
    INDEX idx_price_date (price_date)
);

-- TABLE: ALERTS
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    alert_type ALERT_TYPE NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_shipment_id (shipment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_is_resolved (is_resolved)
);

-- TABLE: TRANSPORT_CHECKPOINTS
CREATE TABLE transport_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    location GEOMETRY(POINT, 4326) NOT NULL,
    region VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: CHECKPOINT_VERIFICATIONS
CREATE TABLE checkpoint_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES transport_checkpoints(id),
    verification_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_by VARCHAR(100), -- Officer name/ID
    notes TEXT,
    vehicle_condition VARCHAR(100), -- e.g., 'GOOD', 'DAMAGED'
    cargo_temperature DECIMAL(5,2),
    cargo_humidity DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_shipment_id (shipment_id),
    INDEX idx_checkpoint_id (checkpoint_id),
    INDEX idx_verification_time (verification_time)
);

-- TABLE: TRANSPORT_ORDERS
CREATE TABLE transport_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trader_id UUID NOT NULL REFERENCES users(id),
    pickup_location_id UUID NOT NULL REFERENCES locations(id),
    delivery_location_id UUID NOT NULL REFERENCES locations(id),
    shipment_id UUID REFERENCES shipments(id),
    requested_pickup_time TIMESTAMPTZ NOT NULL,
    estimated_delivery_time TIMESTAMPTZ NOT NULL,
    cargo_description TEXT,
    weight_kg DECIMAL(10,2),
    requires_refrigeration BOOLEAN DEFAULT FALSE,
    max_price DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, ASSIGNED, COMPLETED, CANCELLED
    assigned_transporter_id UUID REFERENCES users(id),
    assigned_vehicle_id UUID REFERENCES transport_vehicles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_trader_id (trader_id),
    INDEX idx_status (status),
    INDEX idx_assigned_transporter_id (assigned_transporter_id)
);

-- TABLE: REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    shipment_id UUID REFERENCES shipments(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reviewee_id (reviewee_id),
    INDEX idx_shipment_id (shipment_id)
);

-- TABLE: SYSTEM_SETTINGS
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: AUDIT_LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
);

-- FUNCTION: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- TRIGGERS: Updated timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produce_listings_updated_at BEFORE UPDATE ON produce_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_vehicles_updated_at BEFORE UPDATE ON transport_vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_routes_updated_at BEFORE UPDATE ON transport_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_prices_updated_at BEFORE UPDATE ON market_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_orders_updated_at BEFORE UPDATE ON transport_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for geospatial queries
CREATE INDEX idx_produce_listings_location ON produce_listings USING GIST (location_id);
CREATE INDEX idx_transport_tracking_location ON transport_tracking USING GIST (location);
