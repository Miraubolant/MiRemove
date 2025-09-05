-- =====================================================
-- MIREMOVER - SUPPRESSION PARAMÈTRES INUTILES
-- Supprime les paramètres non utilisés dans le code actuel
-- Date: 2025-01-09
-- =====================================================

-- Cette migration fait suite à la simplification du backend unifié
-- où nous avons supprimé OpenCV et simplifié les processeurs

DELETE FROM admin_settings WHERE key IN (
    -- ==================== RESIZE : Paramètres inutiles ====================
    -- On utilise uniquement Pillow maintenant, pas besoin de choisir l'outil
    'resize_tool',                    -- Plus besoin, Pillow uniquement
    
    -- Mode fill évite les bandes blanches, ces paramètres sont obsolètes
    'resize_keep_ratio',              -- Géré automatiquement par le mode fill
    'resize_background_color',        -- Plus de bandes blanches avec mode fill
    'resize_crop_position',           -- Hardcodé à 'center' dans le code
    'resize_bg_alpha',                -- Plus de gestion d'alpha
    
    -- Dimensions passées directement par l'API
    'resize_default_width',           -- Valeurs passées par l'API
    'resize_default_height',          -- Valeurs passées par l'API
    'resize_max_dimension',           -- Pas de limite implémentée
    
    -- ==================== CROP : Paramètres OpenCV inutiles ====================
    -- La fonction crop_below_mouth utilise des valeurs hardcodées (1.1, 4, 0.75)
    'face_scale_factor',              -- Hardcodé à 1.1 dans crop_below_mouth
    'face_min_neighbors',             -- Hardcodé à 4 dans crop_below_mouth
    'mouth_position_ratio',           -- Hardcodé à 0.75 dans la fonction
    'crop_top_ratio',                 -- Plus utilisé après refactoring
    'crop_fallback_strategy',         -- Plus de fallback strategy
    
    -- ==================== PIPELINE : Paramètres complexes non implémentés ====================
    -- Pipeline simplifié dans UnifiedProcessor, pas de configuration complexe
    'pipeline_both_order',            -- Pipeline simple dans UnifiedProcessor
    'pipeline_all_order',             -- Pipeline simple dans UnifiedProcessor
    'pipeline_continue_on_crop_fail', -- Gestion d'erreur basique (return image)
    'pipeline_continue_on_resize_fail', -- Gestion d'erreur basique
    'pipeline_stop_on_bria_fail',     -- Gestion d'erreur basique avec exception
    
    -- ==================== PERFORMANCE : Optimisations non implémentées ====================
    -- Pas d'optimisation automatique dans le code actuel
    'auto_optimize_large_images',     -- Pas d'optimisation auto
    'optimization_threshold',         -- Pas de seuil d'optimisation
    'max_file_size_mb',              -- Pas de limite de taille fichier
    
    -- ==================== MONITORING : Détails non utilisés ====================
    -- Logs basiques seulement, pas de monitoring avancé
    'log_processing_times',           -- Logs basiques seulement
    'log_api_calls',                  -- Logs basiques seulement
    'error_details_in_response'       -- Pas de détails d'erreur exposés
);

-- =====================================================
-- PARAMÈTRES CONSERVÉS (utilisés dans le code actuel)
-- =====================================================
-- 
-- MODES & ACTIVATION (6 paramètres - tous utilisés dans UnifiedProcessor)
-- ✅ mode_ai_enabled        : Active/désactive le mode AI
-- ✅ mode_resize_enabled    : Active/désactive le mode resize
-- ✅ mode_both_enabled      : Active/désactive le mode both
-- ✅ mode_crop_head_enabled : Active/désactive le mode crop-head
-- ✅ mode_all_enabled       : Active/désactive le mode all
-- ✅ default_mode           : Mode par défaut
--
-- FORMATS DE SORTIE (6 paramètres - tous utilisés)
-- ✅ output_format_ai       : Format pour mode AI (png/jpg/webp)
-- ✅ output_format_resize   : Format pour mode resize
-- ✅ output_format_both     : Format pour mode both
-- ✅ output_format_crop_head: Format pour mode crop-head
-- ✅ output_format_all      : Format pour mode all
-- ✅ output_quality         : Qualité compression JPG/WebP
--
-- API BRIA (7 paramètres - tous utilisés dans BriaProcessor)
-- ✅ bria_api_token         : Token API Bria (requis)
-- ✅ bria_endpoint          : URL endpoint Bria
-- ✅ bria_timeout           : Timeout appels API
-- ✅ bria_content_moderation: Modération contenu
-- ✅ bria_max_retries       : Nombre de tentatives
-- ✅ bria_optimize_before   : Optimisation avant envoi
-- ✅ bria_max_size          : Taille max pour optimisation
--
-- RESIZE SIMPLIFIÉ (2 paramètres)
-- ✅ resize_mode            : Mode resize (fill par défaut, évite bandes blanches)
-- ✅ resize_resampling      : Méthode resampling (lanczos, bicubic, etc.)
--
-- MONITORING BASIQUE (1 paramètre)
-- ✅ logging_level          : Niveau de log (DEBUG, INFO, WARNING, ERROR)
--
-- TOTAL: 22 paramètres conservés (utiles et utilisés)
-- =====================================================

-- Message de confirmation
DO $$
DECLARE
    deleted_count INTEGER;
    remaining_count INTEGER;
BEGIN
    -- Compter les suppressions
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Compter les paramètres restants
    SELECT count(*) INTO remaining_count FROM admin_settings;
    
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '🗑️  NETTOYAGE TERMINÉ';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Paramètres supprimés: %', deleted_count;
    RAISE NOTICE 'Paramètres restants: %', remaining_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Backend simplifié et optimisé!';
    RAISE NOTICE '✅ Mode fill par défaut = plus de bandes blanches';
    RAISE NOTICE '✅ Fonction crop_below_mouth simplifiée';
    RAISE NOTICE '✅ Resize avec Pillow uniquement';
    RAISE NOTICE '=====================================================';
END $$;