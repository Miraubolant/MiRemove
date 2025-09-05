-- =====================================================
-- MIREMOVER - DATABASE SETUP PART 1
-- Schéma de base, tables principales et index
-- =====================================================

-- =================
-- ÉTAPE 1 - Extensions et Types
-- =================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Type ENUM pour les niveaux utilisateur
CREATE TYPE user_level AS ENUM ('free', 'premium', 'admin');

-- Type ENUM pour les types d'opération
CREATE TYPE operation_type AS ENUM ('bg_removal', 'resize', 'head_crop');

-- =================
-- ÉTAPE 2 - Tables principales
-- =================

-- Table des profils utilisateurs
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    user_level user_level NOT NULL DEFAULT 'free',
    image_limit INTEGER NOT NULL DEFAULT 100,
    current_month_start DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des statistiques utilisateur (remise à zéro mensuelle)
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    bg_removal_count INTEGER NOT NULL DEFAULT 0,
    resize_count INTEGER NOT NULL DEFAULT 0,
    head_crop_count INTEGER NOT NULL DEFAULT 0,
    total_operations INTEGER NOT NULL DEFAULT 0,
    current_month_start DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table historique mensuel
CREATE TABLE monthly_usage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    year_month TEXT NOT NULL, -- Format: 'YYYY-MM'
    bg_removal_count INTEGER NOT NULL DEFAULT 0,
    resize_count INTEGER NOT NULL DEFAULT 0,
    head_crop_count INTEGER NOT NULL DEFAULT 0,
    total_operations INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, year_month)
);

-- Table des groupes
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_limit INTEGER NOT NULL DEFAULT 1000,
    current_month_operations INTEGER NOT NULL DEFAULT 0,
    current_month_start DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des membres de groupe
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Table des logs de traitement
CREATE TABLE processing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    operation_type operation_type NOT NULL,
    operations_count INTEGER NOT NULL DEFAULT 1, -- Nombre d'opérations dans ce traitement
    success BOOLEAN NOT NULL DEFAULT TRUE,
    processing_time_ms INTEGER,
    file_size_bytes BIGINT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des paramètres admin
CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =================
-- ÉTAPE 3 - Index pour performance
-- =================

-- Index pour les requêtes fréquentes
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_processing_logs_user_id ON processing_logs(user_id);
CREATE INDEX idx_processing_logs_created_at ON processing_logs(created_at);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_monthly_usage_history_user_year_month ON monthly_usage_history(user_id, year_month);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_user_level ON user_profiles(user_level);

-- =================
-- FIN PART 1
-- =================

-- Une fois ce fichier exécuté avec succès, 
-- demandez la PART 2 avec les triggers, RLS et fonctions RPC !