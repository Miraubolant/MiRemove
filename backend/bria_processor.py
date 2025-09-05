"""
BriaProcessor - Suppression de fond via API Bria
Gestion complète des appels API avec retry, optimisation et modération de contenu
"""

import logging
import requests
import time
from PIL import Image
import io

logger = logging.getLogger(__name__)


class BriaProcessor:
    """Processeur pour suppression de fond via API Bria"""
    
    def __init__(self, config_manager):
        self.config = config_manager
        self.session = requests.Session()
    
    def process(self, image: Image.Image) -> Image.Image:
        """Supprime le fond via l'API Bria"""
        try:
            # Vérifier le token
            api_token = self.config.get('bria_api_token')
            if not api_token:
                raise Exception("BRIA API token not configured")
            
            # Optimiser l'image avant envoi si configuré
            processed_image = image
            if self.config.get_bool('bria_optimize_before', True):
                processed_image = self._optimize_for_bria(image)
            
            # Appel API avec retry
            result_image = self._call_bria_api(processed_image, api_token)
            
            logger.info("Background removed successfully via Bria API")
            return result_image
            
        except Exception as e:
            logger.error(f"Bria processing failed: {e}")
            raise Exception(f"Background removal failed: {e}")
    
    def _optimize_for_bria(self, image: Image.Image) -> Image.Image:
        """Optimise l'image avant envoi à Bria (réduction de taille si nécessaire)"""
        max_size = self.config.get_int('bria_max_size', 1500)
        
        # Vérifier si l'optimisation est nécessaire
        if max(image.size) <= max_size:
            return image
        
        # Calculer les nouvelles dimensions
        width, height = image.size
        if width > height:
            new_width = max_size
            new_height = int(height * (max_size / width))
        else:
            new_height = max_size
            new_width = int(width * (max_size / height))
        
        logger.info(f"Optimizing image for Bria: {width}x{height} -> {new_width}x{new_height}")
        
        # Redimensionner avec une méthode de qualité
        optimized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        return optimized
    
    def _call_bria_api(self, image: Image.Image, api_token: str) -> Image.Image:
        """Appel API Bria avec gestion des retry"""
        endpoint = self.config.get('bria_endpoint', 'https://engine.prod.bria-api.com/v1/background/remove')
        timeout = self.config.get_int('bria_timeout', 30)
        max_retries = self.config.get_int('bria_max_retries', 3)
        content_moderation = self.config.get_bool('bria_content_moderation', False)
        
        # Préparer l'image en bytes
        img_bytes = io.BytesIO()
        
        # Convertir en RGB si nécessaire (Bria n'aime pas toujours RGBA)
        if image.mode in ('RGBA', 'P'):
            # Créer un fond blanc pour les images transparentes
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        image.save(img_bytes, format='JPEG', quality=95)
        img_bytes.seek(0)
        
        # Headers pour l'API
        headers = {
            'api_token': api_token
        }
        
        # Données du formulaire
        files = {
            'file': ('image.jpg', img_bytes.getvalue(), 'image/jpeg')
        }
        
        data = {}
        if content_moderation:
            data['sync'] = 'true'  # Mode synchrone pour la modération
        
        # Tentatives avec backoff exponentiel
        for attempt in range(max_retries + 1):
            try:
                logger.info(f"Calling Bria API (attempt {attempt + 1}/{max_retries + 1})")
                
                start_time = time.time()
                response = self.session.post(
                    endpoint,
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=timeout
                )
                
                api_time = time.time() - start_time
                logger.info(f"Bria API call completed in {api_time:.2f}s")
                
                if response.status_code == 200:
                    # Succès - convertir la réponse en image
                    result_image = Image.open(io.BytesIO(response.content))
                    return result_image
                
                # Gestion des erreurs spécifiques
                elif response.status_code == 401:
                    raise Exception("Invalid Bria API token")
                elif response.status_code == 403:
                    raise Exception("Bria API access forbidden - check your subscription")
                elif response.status_code == 413:
                    raise Exception("Image too large for Bria API")
                elif response.status_code == 429:
                    # Rate limiting - attendre plus longtemps
                    if attempt < max_retries:
                        wait_time = (2 ** attempt) * 2  # Backoff plus long pour rate limiting
                        logger.warning(f"Bria API rate limited, waiting {wait_time}s")
                        time.sleep(wait_time)
                        continue
                    raise Exception("Bria API rate limit exceeded")
                elif response.status_code >= 500:
                    # Erreur serveur - peut être temporaire
                    if attempt < max_retries:
                        wait_time = 2 ** attempt
                        logger.warning(f"Bria API server error {response.status_code}, retrying in {wait_time}s")
                        time.sleep(wait_time)
                        continue
                    raise Exception(f"Bria API server error: {response.status_code}")
                else:
                    # Autres erreurs
                    error_msg = f"Bria API error {response.status_code}"
                    try:
                        error_data = response.json()
                        error_msg += f": {error_data.get('message', 'Unknown error')}"
                    except:
                        pass
                    
                    if attempt < max_retries and 400 <= response.status_code < 500:
                        # Erreurs client - ne pas retry sauf cas spéciaux
                        raise Exception(error_msg)
                    elif attempt < max_retries:
                        wait_time = 2 ** attempt
                        logger.warning(f"{error_msg}, retrying in {wait_time}s")
                        time.sleep(wait_time)
                        continue
                    
                    raise Exception(error_msg)
                    
            except requests.exceptions.Timeout:
                if attempt < max_retries:
                    wait_time = 2 ** attempt
                    logger.warning(f"Bria API timeout, retrying in {wait_time}s")
                    time.sleep(wait_time)
                    continue
                raise Exception("Bria API timeout")
                
            except requests.exceptions.ConnectionError:
                if attempt < max_retries:
                    wait_time = 2 ** attempt
                    logger.warning(f"Bria API connection error, retrying in {wait_time}s")
                    time.sleep(wait_time)
                    continue
                raise Exception("Bria API connection failed")
                
            except Exception as e:
                if attempt < max_retries and "Request cancelled" not in str(e):
                    wait_time = 2 ** attempt
                    logger.warning(f"Bria API error: {e}, retrying in {wait_time}s")
                    time.sleep(wait_time)
                    continue
                raise
        
        raise Exception("Bria API failed after all retry attempts")
    
    def test_connection(self) -> bool:
        """Test la connexion à l'API Bria"""
        try:
            api_token = self.config.get('bria_api_token')
            if not api_token:
                logger.error("No Bria API token configured")
                return False
            
            # Créer une petite image de test
            test_image = Image.new('RGB', (100, 100), color='red')
            
            # Tester l'API
            self._call_bria_api(test_image, api_token)
            logger.info("Bria API connection test successful")
            return True
            
        except Exception as e:
            logger.error(f"Bria API connection test failed: {e}")
            return False
    
    def get_api_status(self) -> dict:
        """Récupère le statut de l'API Bria"""
        try:
            api_token = self.config.get('bria_api_token')
            endpoint = self.config.get('bria_endpoint', 'https://engine.prod.bria-api.com/v1/background/remove')
            
            # Certaines APIs ont un endpoint de status
            # Pour Bria, on peut essayer de faire un appel simple
            status_info = {
                'configured': bool(api_token),
                'endpoint': endpoint,
                'timeout': self.config.get_int('bria_timeout', 30),
                'max_retries': self.config.get_int('bria_max_retries', 3),
                'optimize_before': self.config.get_bool('bria_optimize_before', True),
                'max_size': self.config.get_int('bria_max_size', 1500)
            }
            
            return status_info
            
        except Exception as e:
            logger.error(f"Failed to get Bria API status: {e}")
            return {'configured': False, 'error': str(e)}
    
    def __del__(self):
        """Nettoyage de la session requests"""
        if hasattr(self, 'session'):
            self.session.close()