"""
MiRemover Backend Unifié
Gère les 5 modes de traitement avec configuration via admin_settings
"""

import os
import time
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from io import BytesIO

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from PIL import Image
import numpy as np
import cv2
import requests
from supabase import create_client, Client

# Import des processeurs modulaires
from crop_processor import CropHeadProcessor
from resize_processor import ResizeProcessor
from bria_processor import BriaProcessor

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ConfigManager:
    """Gestionnaire de configuration depuis Supabase"""
    
    def __init__(self):
        self.supabase_url = os.environ.get('VITE_SUPABASE_URL', '')
        self.supabase_key = os.environ.get('VITE_SUPABASE_ANON_KEY', '')
        self.settings: Dict[str, str] = {}
        self.last_refresh = None
        self.refresh_interval = timedelta(minutes=5)
        
        # Charger la configuration initiale
        if self.supabase_url and self.supabase_key:
            self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
            self.load_settings()
        else:
            logger.warning("Supabase credentials not found, using defaults")
            self._load_defaults()
    
    def load_settings(self):
        """Charge tous les paramètres depuis admin_settings"""
        try:
            response = self.supabase.table('admin_settings').select('*').execute()
            self.settings = {item['key']: item['value'] for item in response.data}
            self.last_refresh = datetime.now()
            logger.info(f"Loaded {len(self.settings)} settings from database")
        except Exception as e:
            logger.error(f"Failed to load settings: {e}")
            self._load_defaults()
    
    def _load_defaults(self):
        """Charge les valeurs par défaut"""
        self.settings = {
            # Modes
            'mode_ai_enabled': 'true',
            'mode_resize_enabled': 'true',
            'mode_both_enabled': 'true',
            'mode_crop_head_enabled': 'true',
            'mode_all_enabled': 'true',
            'default_mode': 'ai',
            
            # Formats
            'output_format_ai': 'png',
            'output_format_resize': 'jpg',
            'output_format_both': 'png',
            'output_format_crop_head': 'jpg',
            'output_format_all': 'png',
            'output_quality': '95',
            
            # Bria
            'bria_api_token': os.environ.get('BRIA_API_TOKEN', ''),
            'bria_endpoint': 'https://engine.prod.bria-api.com/v1/background/remove',
            'bria_timeout': '30',
            'bria_max_retries': '3',
            'bria_optimize_before': 'true',
            'bria_max_size': '1500',
            
            # Resize
            'resize_tool': 'pillow',
            'resize_resampling': 'lanczos',
            'resize_mode': 'fit',
            'resize_keep_ratio': 'true',
            'resize_background_color': 'white',
            'resize_default_width': '1000',
            'resize_default_height': '1500',
            'resize_max_dimension': '4096',
            
            # Crop head (sous le nez)
            'face_scale_factor': '1.1',
            'face_min_neighbors': '4',
            'nose_position_ratio': '0.72',
            'crop_fallback_strategy': 'top_portion',
            
            # Pipeline
            'pipeline_both_order': 'resize_then_ai',
            'pipeline_all_order': 'crop_resize_ai',
            'pipeline_continue_on_crop_fail': 'true',
            'pipeline_continue_on_resize_fail': 'true',
            'pipeline_stop_on_bria_fail': 'true',
            
            # Performance
            'max_file_size_mb': '10',
            'auto_optimize_large_images': 'true',
            'optimization_threshold': '2048',
            
            # Monitoring
            'logging_level': 'INFO',
            'log_processing_times': 'true',
            'error_details_in_response': 'false'
        }
        self.last_refresh = datetime.now()
    
    def get(self, key: str, default: Any = None) -> Any:
        """Récupère une valeur avec refresh auto si nécessaire"""
        if self.last_refresh and datetime.now() - self.last_refresh > self.refresh_interval:
            self.load_settings()
        return self.settings.get(key, default)
    
    def get_bool(self, key: str, default: bool = False) -> bool:
        value = self.get(key, str(default))
        return str(value).lower() in ('true', '1', 'yes', 'on')
    
    def get_int(self, key: str, default: int = 0) -> int:
        try:
            return int(self.get(key, default))
        except:
            return default
    
    def get_float(self, key: str, default: float = 0.0) -> float:
        try:
            return float(self.get(key, default))
        except:
            return default


# Les processeurs ont été déplacés dans des fichiers séparés :
# - BriaProcessor -> bria_processor.py
# - ResizeProcessor -> resize_processor.py
# - CropHeadProcessor -> crop_processor.py


class UnifiedProcessor:
    """Orchestrateur principal des 5 modes"""
    
    def __init__(self):
        self.config = ConfigManager()
        self.bria = BriaProcessor(self.config)
        self.resize = ResizeProcessor(self.config)
        self.crop_head = CropHeadProcessor(self.config)
    
    def process_image(self, mode: str, image: Image.Image, params: Dict) -> Tuple[Image.Image, Dict]:
        """Process selon le mode avec gestion d'erreur intelligente"""
        
        # Vérifier si le mode est activé
        if not self.config.get_bool(f'mode_{mode}_enabled', True):
            raise ValueError(f"Mode '{mode}' is disabled by administrator")
        
        # Vérifier la taille du fichier
        max_size_mb = self.config.get_int('max_file_size_mb', 10)
        img_bytes = BytesIO()
        image.save(img_bytes, format='PNG')
        size_mb = len(img_bytes.getvalue()) / (1024 * 1024)
        
        if size_mb > max_size_mb:
            raise ValueError(f"Image too large: {size_mb:.1f}MB (max: {max_size_mb}MB)")
        
        # Optimiser si image trop grande
        if self.config.get_bool('auto_optimize_large_images', True):
            threshold = self.config.get_int('optimization_threshold', 2048)
            w, h = image.size
            if max(w, h) > threshold:
                ratio = threshold / max(w, h)
                new_w = int(w * ratio)
                new_h = int(h * ratio)
                image = image.resize((new_w, new_h), Image.LANCZOS)
                logger.info(f"Auto-optimized image from {w}x{h} to {new_w}x{new_h}")
        
        # Initialiser le tracking
        operations_logged = []
        processing_times = {}
        start_time = time.time()
        
        try:
            if mode == 'ai':
                result = self._process_ai(image, operations_logged, processing_times)
                
            elif mode == 'resize':
                result = self._process_resize(image, params, operations_logged, processing_times)
                
            elif mode == 'both':
                result = self._process_both(image, params, operations_logged, processing_times)
                
            elif mode == 'crop-head':
                result = self._process_crop_head(image, params, operations_logged, processing_times)
                
            elif mode == 'all':
                result = self._process_all(image, params, operations_logged, processing_times)
                
            else:
                raise ValueError(f"Unknown mode: {mode}")
            
            # Convertir selon le format configuré
            output_format = self.config.get(f'output_format_{mode}', 'png')
            result = self._convert_format(result, output_format)
            
            total_time = time.time() - start_time
            
            # Logger si activé
            if self.config.get_bool('log_processing_times', True):
                logger.info(f"Mode: {mode}, Operations: {[op['type'] for op in operations_logged]}, "
                           f"Time: {total_time:.2f}s")
            
            return result, {
                'operations': operations_logged,
                'total_time': total_time,
                'processing_times': processing_times,
                'output_format': output_format
            }
            
        except Exception as e:
            logger.error(f"Processing failed for mode {mode}: {e}")
            raise
    
    def _process_ai(self, image, ops_log, times):
        """Mode AI - Suppression de fond uniquement"""
        start = time.time()
        result = self.bria.process(image)
        times['bg_removal'] = time.time() - start
        ops_log.append({'type': 'bg_removal', 'count': 1})
        return result
    
    def _process_resize(self, image, params, ops_log, times):
        """Mode Resize - Redimensionnement uniquement"""
        start = time.time()
        width = params.get('width', self.config.get_int('resize_default_width', 1000))
        height = params.get('height', self.config.get_int('resize_default_height', 1500))
        
        result = self.resize.process(image, width, height)
        times['resize'] = time.time() - start
        ops_log.append({'type': 'resize', 'count': 1})
        return result
    
    def _process_both(self, image, params, ops_log, times):
        """Mode Both - Resize + AI selon ordre configuré"""
        order = self.config.get('pipeline_both_order', 'resize_then_ai')
        width = params.get('width', self.config.get_int('resize_default_width', 1000))
        height = params.get('height', self.config.get_int('resize_default_height', 1500))
        
        if order == 'resize_then_ai':
            # 1. Resize
            start = time.time()
            image = self.resize.process(image, width, height)
            times['resize'] = time.time() - start
            ops_log.append({'type': 'resize', 'count': 1})
            
            # 2. AI
            start = time.time()
            result = self.bria.process(image)
            times['bg_removal'] = time.time() - start
            ops_log.append({'type': 'bg_removal', 'count': 1})
            
        else:  # ai_then_resize
            # 1. AI
            start = time.time()
            image = self.bria.process(image)
            times['bg_removal'] = time.time() - start
            ops_log.append({'type': 'bg_removal', 'count': 1})
            
            # 2. Resize
            start = time.time()
            result = self.resize.process(image, width, height)
            times['resize'] = time.time() - start
            ops_log.append({'type': 'resize', 'count': 1})
        
        return result
    
    def _process_crop_head(self, image, params, ops_log, times):
        """Mode Crop-Head - Détection visage avec resize optionnel"""
        # 1. Crop head
        start = time.time()
        try:
            image = self.crop_head.process(image)
            times['head_crop'] = time.time() - start
            ops_log.append({'type': 'head_crop', 'count': 1})
        except Exception as e:
            logger.warning(f"Smart crop failed: {e}")
            if not self.config.get_bool('pipeline_continue_on_crop_fail', True):
                raise
            # Continuer avec l'image originale
            times['head_crop'] = time.time() - start
        
        # 2. Resize optionnel (inclus dans le mode, pas compté séparément)
        if params.get('width') and params.get('height'):
            start = time.time()
            try:
                image = self.resize.process(image, params['width'], params['height'])
                times['resize_in_crop'] = time.time() - start
            except Exception as e:
                if not self.config.get_bool('pipeline_continue_on_resize_fail', True):
                    raise
                logger.warning(f"Resize failed in crop-head: {e}")
        
        return image
    
    def _process_all(self, image, params, ops_log, times):
        """Mode All - Pipeline complet: Crop → Resize → AI"""
        width = params.get('width', self.config.get_int('resize_default_width', 1000))
        height = params.get('height', self.config.get_int('resize_default_height', 1500))
        
        # 1. Crop head (continue si échec)
        start = time.time()
        try:
            image = self.crop_head.process(image)
            times['head_crop'] = time.time() - start
            ops_log.append({'type': 'head_crop', 'count': 1})
            logger.info("Smart crop successful in 'all' mode")
        except Exception as e:
            logger.warning(f"Smart crop failed in 'all' mode: {e}")
            if not self.config.get_bool('pipeline_continue_on_crop_fail', True):
                raise
            times['head_crop'] = time.time() - start
            # Continuer avec l'image originale
        
        # 2. Resize (continue avec dimensions originales si échec)
        start = time.time()
        try:
            image = self.resize.process(image, width, height)
            times['resize'] = time.time() - start
            ops_log.append({'type': 'resize', 'count': 1})
            logger.info("Resize successful in 'all' mode")
        except Exception as e:
            logger.warning(f"Resize failed in 'all' mode: {e}")
            if not self.config.get_bool('pipeline_continue_on_resize_fail', True):
                raise
            times['resize'] = time.time() - start
            # Continuer avec dimensions originales
        
        # 3. AI (erreur immédiate si échec)
        start = time.time()
        try:
            result = self.bria.process(image)
            times['bg_removal'] = time.time() - start
            ops_log.append({'type': 'bg_removal', 'count': 1})
            logger.info("AI background removal successful in 'all' mode")
        except Exception as e:
            logger.error(f"Bria API failed in 'all' mode: {e}")
            # Toujours erreur pour Bria selon config
            raise
        
        return result
    
    def _convert_format(self, image: Image.Image, format: str) -> Image.Image:
        """Convertit l'image au format souhaité"""
        if format in ['jpg', 'jpeg']:
            # Convertir RGBA en RGB avec fond blanc
            if image.mode == 'RGBA':
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[3] if len(image.split()) > 3 else None)
                return background
            elif image.mode != 'RGB':
                return image.convert('RGB')
            return image
        
        elif format == 'webp':
            return image
        
        else:  # png par défaut
            if image.mode != 'RGBA':
                return image.convert('RGBA')
            return image


# ==================== APPLICATION FLASK ====================

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://localhost:5174'])  # Frontend React

# Initialiser le processeur global
processor = None

def init_processor():
    """Initialise le processeur (appelé au démarrage)"""
    global processor
    processor = UnifiedProcessor()
    logger.info("Unified processor initialized")


@app.route('/process', methods=['POST'])
def process_endpoint():
    """Endpoint unique pour tous les modes de traitement"""
    try:
        # Récupérer le mode
        mode = request.args.get('mode', processor.config.get('default_mode', 'ai'))
        
        # Log de la requête
        logger.info(f"Processing request - Mode: {mode}")
        
        # Vérifier le fichier
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if not file or file.filename == '':
            return jsonify({'error': 'Invalid file'}), 400
        
        # Vérifier l'extension
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'}
        filename = file.filename.lower()
        if not any(filename.endswith(ext) for ext in allowed_extensions):
            return jsonify({'error': f'File type not allowed. Allowed: {", ".join(allowed_extensions)}'}), 400
        
        # Charger l'image
        try:
            image = Image.open(file.stream)
            # Convertir en RGB/RGBA si nécessaire
            if image.mode not in ['RGB', 'RGBA']:
                image = image.convert('RGBA')
        except Exception as e:
            logger.error(f"Failed to open image: {e}")
            return jsonify({'error': 'Invalid image file'}), 400
        
        # Récupérer les paramètres
        params = {
            'width': request.args.get('width', type=int),
            'height': request.args.get('height', type=int)
        }
        
        # Filtrer les None
        params = {k: v for k, v in params.items() if v is not None}
        
        logger.info(f"Processing with params: {params}")
        
        # Traiter l'image
        try:
            result, metadata = processor.process_image(mode, image, params)
        except ValueError as e:
            # Erreur de validation (mode désactivé, image trop grande, etc.)
            logger.warning(f"Validation error: {e}")
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            # Erreur de traitement
            logger.error(f"Processing error: {e}")
            if processor.config.get_bool('error_details_in_response', False):
                return jsonify({
                    'error': str(e),
                    'type': type(e).__name__,
                    'mode': mode
                }), 500
            return jsonify({'error': 'Processing failed'}), 500
        
        # Préparer la réponse
        output_format = metadata['output_format']
        quality = processor.config.get_int('output_quality', 95)
        
        output = BytesIO()
        
        if output_format in ['jpg', 'jpeg']:
            result.save(output, 'JPEG', quality=quality, optimize=True)
            mimetype = 'image/jpeg'
            extension = 'jpg'
        elif output_format == 'webp':
            result.save(output, 'WebP', quality=quality, lossless=False)
            mimetype = 'image/webp'
            extension = 'webp'
        else:  # png
            result.save(output, 'PNG', optimize=True)
            mimetype = 'image/png'
            extension = 'png'
        
        output.seek(0)
        
        # Créer la réponse
        response = send_file(
            output,
            mimetype=mimetype,
            as_attachment=False,
            download_name=f'processed.{extension}'
        )
        
        # Ajouter les métadonnées dans les headers
        response.headers['X-Processing-Mode'] = mode
        response.headers['X-Processing-Time'] = str(round(metadata['total_time'], 2))
        response.headers['X-Operations-Count'] = str(len(metadata['operations']))
        
        # Ajouter les opérations pour le comptage frontend
        operations_str = ','.join([op['type'] for op in metadata['operations']])
        response.headers['X-Operations'] = operations_str
        
        logger.info(f"Request completed - Mode: {mode}, Time: {metadata['total_time']:.2f}s, "
                   f"Operations: {operations_str}")
        
        return response
        
    except Exception as e:
        logger.error(f"Unexpected error in process endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check avec statut des modes et configuration"""
    try:
        return jsonify({
            'status': 'healthy',
            'backend': 'unified',
            'version': '1.0.0',
            'modes': {
                'ai': {
                    'enabled': processor.config.get_bool('mode_ai_enabled'),
                    'format': processor.config.get(f'output_format_ai', 'png')
                },
                'resize': {
                    'enabled': processor.config.get_bool('mode_resize_enabled'),
                    'format': processor.config.get(f'output_format_resize', 'jpg')
                },
                'both': {
                    'enabled': processor.config.get_bool('mode_both_enabled'),
                    'format': processor.config.get(f'output_format_both', 'png')
                },
                'crop_head': {
                    'enabled': processor.config.get_bool('mode_crop_head_enabled'),
                    'format': processor.config.get(f'output_format_crop_head', 'jpg')
                },
                'all': {
                    'enabled': processor.config.get_bool('mode_all_enabled'),
                    'format': processor.config.get(f'output_format_all', 'png')
                }
            },
            'config': {
                'default_mode': processor.config.get('default_mode'),
                'resize_tool': processor.config.get('resize_tool'),
                'nose_crop_ratio': processor.config.get('nose_position_ratio'),
                'bria_configured': bool(processor.config.get('bria_api_token')),
                'config_age_seconds': (
                    (datetime.now() - processor.config.last_refresh).total_seconds()
                    if processor.config.last_refresh else -1
                )
            }
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/admin/reload-config', methods=['POST'])
def reload_config():
    """Force le rechargement de la configuration depuis Supabase"""
    try:
        # Vérifier un token admin simple (optionnel)
        admin_token = request.headers.get('X-Admin-Token')
        expected_token = os.environ.get('ADMIN_TOKEN')
        
        if expected_token and admin_token != expected_token:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Recharger la configuration
        processor.config.load_settings()
        
        # Réinitialiser les détecteurs si nécessaire
        processor.crop_head._init_detector()
        
        logger.info("Configuration reloaded by admin")
        
        return jsonify({
            'status': 'Configuration reloaded successfully',
            'settings_count': len(processor.config.settings),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Failed to reload config: {e}")
        return jsonify({'error': f'Failed to reload: {e}'}), 500


@app.route('/test', methods=['GET'])
def test_endpoint():
    """Endpoint de test simple"""
    return jsonify({
        'message': 'MiRemover backend is running',
        'timestamp': datetime.now().isoformat()
    })


@app.errorhandler(413)
def request_entity_too_large(error):
    """Gestion des fichiers trop gros"""
    max_size = processor.config.get_int('max_file_size_mb', 10) if processor else 10
    return jsonify({
        'error': f'File too large. Maximum size: {max_size}MB'
    }), 413


# Serve static files from React build - MUST be last route
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    """Serve React app for all non-API routes"""
    import os
    
    # Skip API routes
    if path.startswith('process') or path.startswith('health') or path.startswith('admin') or path.startswith('test'):
        return jsonify({'error': 'Not found'}), 404
    
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')
    
    # Special handling for favicon
    if path == 'favicon.ico':
        favicon_path = os.path.join(static_dir, 'favicon.ico')
        if os.path.exists(favicon_path):
            return send_from_directory(static_dir, 'favicon.ico', mimetype='image/x-icon')
        else:
            return '', 204  # No content instead of 404 for favicon
    
    # Serve static files (assets, images, etc.)
    if path and os.path.exists(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    
    # Serve index.html for all other routes (React routing)
    index_path = os.path.join(static_dir, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(static_dir, 'index.html')
    
    return jsonify({'error': 'Frontend not built'}), 404


@app.errorhandler(500)
def internal_server_error(error):
    """Gestion des erreurs serveur"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


# ==================== POINT D'ENTRÉE ====================

if __name__ == '__main__':
    # Initialiser le processeur
    init_processor()
    
    # Configuration du serveur
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    if debug:
        logger.info(f"Starting development server on port {port}")
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        logger.info(f"Starting production server on port {port}")
        # En production, utiliser gunicorn:
        # gunicorn -w 4 -b 0.0.0.0:5000 --timeout 60 app_unified:app
        app.run(host='0.0.0.0', port=port, debug=False)