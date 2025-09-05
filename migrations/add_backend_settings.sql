-- =====================================================
-- MIREMOVER - AJOUT PARAMÈTRES BACKEND UNIFIÉ
-- Nouvelles entrées admin_settings pour backend unifié
-- =====================================================

-- ==================== MODES & ACTIVATION ====================
INSERT INTO admin_settings (key, value, description) VALUES
('mode_ai_enabled', 'true', 'Activer le mode AI (suppression fond)'),
('mode_resize_enabled', 'true', 'Activer le mode resize'),
('mode_both_enabled', 'true', 'Activer le mode both (resize + AI)'),
('mode_crop_head_enabled', 'true', 'Activer le mode crop-head'),
('mode_all_enabled', 'true', 'Activer le mode all (crop + resize + AI)'),
('default_mode', 'ai', 'Mode par défaut: ai, resize, both, crop-head, all')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- ==================== FORMATS DE SORTIE ====================
INSERT INTO admin_settings (key, value, description) VALUES
('output_format_ai', 'png', 'Format sortie mode AI: png, jpg, webp'),
('output_format_resize', 'jpg', 'Format sortie mode resize: png, jpg, webp'),
('output_format_both', 'png', 'Format sortie mode both: png, jpg, webp'),
('output_format_crop_head', 'jpg', 'Format sortie mode crop-head: png, jpg, webp'),
('output_format_all', 'png', 'Format sortie mode all: png, jpg, webp'),
('output_quality', '95', 'Qualité compression (0-100) pour JPG/WebP')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- ==================== API BRIA ====================
INSERT INTO admin_settings (key, value, description) VALUES
('bria_api_token', '', 'Token API Bria (à configurer)'),
('bria_endpoint', 'https://engine.prod.bria-api.com/v1/background/remove', 'URL API Bria'),
('bria_timeout', '30', 'Timeout API Bria en secondes'),
('bria_content_moderation', 'false', 'Activer la modération de contenu'),
('bria_max_retries', '3', 'Nombre de tentatives API Bria'),
('bria_optimize_before', 'true', 'Optimiser l''image avant envoi à Bria'),
('bria_max_size', '1500', 'Taille max avant optimisation pour Bria')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- ==================== RESIZE CONFIGURATION ====================
INSERT INTO admin_settings (key, value, description) VALUES
('resize_tool', 'pillow', 'Outil de resize: pillow, opencv'),
('resize_resampling', 'lanczos', 'Méthode: nearest, bilinear, bicubic, lanczos'),
('resize_mode', 'fill', 'Mode resize: fill (évite bandes blanches), fit, stretch'),
('resize_keep_ratio', 'true', 'Conserver le ratio d''aspect'),
('resize_background_color', 'white', 'Couleur de fond: white, black, transparent'),
('resize_default_width', '1000', 'Largeur par défaut'),
('resize_default_height', '1500', 'Hauteur par défaut'),
('resize_max_dimension', '4096', 'Dimension maximale autorisée')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- ==================== CROP HEAD CONFIGURATION (CROP SOUS LA BOUCHE) ====================
INSERT INTO admin_settings (key, value, description) VALUES
('mouth_position_ratio', '0.75', 'Position bouche dans visage (0.75 = 75% depuis le haut du visage)'),
('face_scale_factor', '1.1', 'Facteur échelle pour détection visage OpenCV'),
('face_min_neighbors', '4', 'Nombre minimum de voisins pour détection visage')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- ==================== PIPELINE CONFIGURATION ====================
INSERT INTO admin_settings (key, value, description) VALUES
('pipeline_both_order', 'resize_then_ai', 'Ordre mode both: resize_then_ai, ai_then_resize'),
('pipeline_all_order', 'crop_resize_ai', 'Ordre mode all: crop_resize_ai'),
('pipeline_continue_on_crop_fail', 'true', 'Continuer avec image originale si crop échoue'),
('pipeline_continue_on_resize_fail', 'true', 'Continuer avec dimensions originales si resize échoue'),
('pipeline_stop_on_bria_fail', 'true', 'Arrêter immédiatement si Bria échoue')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- ==================== PERFORMANCE ====================
INSERT INTO admin_settings (key, value, description) VALUES
('auto_optimize_large_images', 'true', 'Optimiser auto les grandes images'),
('optimization_threshold', '2048', 'Seuil pour optimization auto')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- ==================== MONITORING ====================
INSERT INTO admin_settings (key, value, description) VALUES
('logging_level', 'INFO', 'Niveau: DEBUG, INFO, WARNING, ERROR'),
('log_processing_times', 'true', 'Logger les temps de traitement'),
('log_api_calls', 'true', 'Logger les appels API'),
('error_details_in_response', 'false', 'Inclure détails erreur dans réponse (dev only)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- Commentaire final
COMMENT ON TABLE admin_settings IS 'Paramètres de configuration - Maintenant avec support backend unifié';

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE 'Backend settings added to admin_settings! 🚀';
    RAISE NOTICE 'Total settings count: %', (SELECT count(*) FROM admin_settings);
    RAISE NOTICE 'Next: Configure BRIA_API_TOKEN in environment variables';
END $$;