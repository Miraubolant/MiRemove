"""
ResizeProcessor - Redimensionnement d'images avec Pillow uniquement
Fonction resize_with_pil exactement comme dans le code de référence
"""

import logging
from PIL import Image

logger = logging.getLogger(__name__)

# Paramètres de redimensionnement par défaut (modifiés pour éviter les bandes blanches)
DEFAULT_RESIZE_PARAMS = {
    'RESIZE_MODE': 'fill',       # Mode fill par défaut pour éviter les bandes blanches
    'KEEP_RATIO': 'true',        # Conserver le ratio d'aspect
    'RESAMPLING': 'hanning',     # Méthode de ré-échantillonnage
    'CROP_POSITION': 'center',   # Position du recadrage (center, top, bottom, left, right)
    'BG_COLOR': 'white',         # Couleur de fond
    'BG_ALPHA': '255'            # Alpha pour la couleur de fond (0-255)
}

# Mapping des méthodes de rééchantillonnage pour PIL (copié du code de référence)
RESAMPLING_METHODS = {
    'nearest': Image.NEAREST,
    'box': Image.BOX,
    'bilinear': Image.BILINEAR,
    'hamming': Image.HAMMING,
    'bicubic': Image.BICUBIC,
    'lanczos': Image.LANCZOS,
    'hanning': Image.LANCZOS,  # Hanning n'existe pas dans PIL, on utilise Lanczos comme alternative
}


class ResizeProcessor:
    """Processeur pour le redimensionnement d'images avec Pillow uniquement"""
    
    def __init__(self, config_manager):
        self.config = config_manager
    
    def process(self, image: Image.Image, width: int, height: int) -> Image.Image:
        """Redimensionne l'image avec la fonction resize_with_pil du code de référence"""
        try:
            # Récupérer les paramètres depuis la configuration ou utiliser les défauts
            resize_params = {
                'RESIZE_MODE': self.config.get('resize_mode', DEFAULT_RESIZE_PARAMS['RESIZE_MODE']),
                'KEEP_RATIO': self.config.get('resize_keep_ratio', DEFAULT_RESIZE_PARAMS['KEEP_RATIO']),
                'RESAMPLING': self.config.get('resize_resampling', DEFAULT_RESIZE_PARAMS['RESAMPLING']),
                'CROP_POSITION': self.config.get('resize_crop_position', DEFAULT_RESIZE_PARAMS['CROP_POSITION']),
                'BG_COLOR': self.config.get('resize_background_color', DEFAULT_RESIZE_PARAMS['BG_COLOR']),
                'BG_ALPHA': self.config.get('resize_bg_alpha', DEFAULT_RESIZE_PARAMS['BG_ALPHA'])
            }
            
            # ANTI-BANDES BLANCHES : Forcer le mode fill pour éviter les bandes
            # Le mode fill remplit complètement les dimensions sans ajouter de background
            if resize_params['RESIZE_MODE'].lower() == 'fit':
                logger.info("Mode 'fit' détecté, passage en mode 'fill' pour éviter les bandes blanches")
                resize_params['RESIZE_MODE'] = 'fill'
            
            return self.resize_with_pil(image, width, height, resize_params)
                
        except Exception as e:
            logger.error(f"Resize failed: {e}")
            raise Exception(f"Resize error: {e}")
    
    def resize_with_pil(self, image, width, height, resize_params):
        """
        Redimensionne une image avec PIL (Pillow) - COPIE EXACTE DU CODE DE RÉFÉRENCE
        
        Args:
            image: Image PIL à redimensionner
            width: Largeur cible
            height: Hauteur cible
            resize_params: Dictionnaire de paramètres de redimensionnement
            
        Returns:
            Image PIL redimensionnée
        """
        try:
            # Extraire les paramètres
            resize_mode = resize_params.get('RESIZE_MODE', DEFAULT_RESIZE_PARAMS['RESIZE_MODE']).lower()
            keep_ratio = resize_params.get('KEEP_RATIO', DEFAULT_RESIZE_PARAMS['KEEP_RATIO']).lower() in ('true', '1', 't', 'y', 'yes')
            resampling = resize_params.get('RESAMPLING', DEFAULT_RESIZE_PARAMS['RESAMPLING']).lower()
            crop_position = resize_params.get('CROP_POSITION', DEFAULT_RESIZE_PARAMS['CROP_POSITION']).lower()
            bg_color = resize_params.get('BG_COLOR', DEFAULT_RESIZE_PARAMS['BG_COLOR'])
            bg_alpha_str = resize_params.get('BG_ALPHA', DEFAULT_RESIZE_PARAMS['BG_ALPHA'])
            
            try:
                bg_alpha = int(bg_alpha_str)
                bg_alpha = max(0, min(255, bg_alpha))  # Limiter entre 0 et 255
            except ValueError:
                bg_alpha = 255  # Valeur par défaut en cas d'erreur
            
            # Déterminer la méthode de rééchantillonnage
            resampling_method = RESAMPLING_METHODS.get(resampling, Image.LANCZOS)
            
            # Dimensions originales
            orig_width, orig_height = image.size
            logger.info(f"Dimensions originales: {orig_width}x{orig_height}")
            logger.info(f"Dimensions cibles: {width}x{height}")
            logger.info(f"Mode: {resize_mode}, Keep ratio: {keep_ratio}, Resampling: {resampling}")
            
            # Si les dimensions sont déjà correctes, retourner l'image originale
            if orig_width == width and orig_height == height:
                logger.info("Aucun redimensionnement nécessaire, dimensions déjà correctes")
                return image.copy()
            
            # Préparer l'image résultante
            result_image = None
            
            # Mode "fit" - Ajuste l'image dans les dimensions cibles tout en conservant le ratio
            if resize_mode == 'fit':
                if keep_ratio:
                    # Calculer les ratios
                    ratio_width = width / orig_width
                    ratio_height = height / orig_height
                    
                    if ratio_width > ratio_height:
                        # L'image sera plus large proportionnellement
                        # Redimensionner selon la largeur, puis rogner en hauteur
                        new_width = width
                        new_height = int(orig_height * ratio_width)
                        
                        # Redimensionner
                        resized = image.resize((new_width, new_height), resampling_method)
                        
                        # Calculer les coordonnées de rognage
                        left = 0
                        right = new_width
                        
                        if crop_position == 'center':
                            top = (new_height - height) // 2
                        elif crop_position == 'top':
                            top = 0
                        elif crop_position == 'bottom':
                            top = new_height - height
                        else:  # Par défaut, centre
                            top = (new_height - height) // 2
                            
                        bottom = top + height
                        
                        # Rogner l'image
                        result_image = resized.crop((left, top, right, bottom))
                        
                    else:
                        # L'image sera plus haute proportionnellement
                        # Redimensionner selon la hauteur, puis rogner en largeur
                        new_height = height
                        new_width = int(orig_width * ratio_height)
                        
                        # Redimensionner
                        resized = image.resize((new_width, new_height), resampling_method)
                        
                        # Calculer les coordonnées de rognage
                        top = 0
                        bottom = new_height
                        
                        if crop_position == 'center':
                            left = (new_width - width) // 2
                        elif crop_position == 'left':
                            left = 0
                        elif crop_position == 'right':
                            left = new_width - width
                        else:  # Par défaut, centre
                            left = (new_width - width) // 2
                            
                        right = left + width
                        
                        # Rogner l'image
                        result_image = resized.crop((left, top, right, bottom))
                else:
                    # Redimensionner sans conserver le ratio
                    resized = image.resize((width, height), resampling_method)
                    result_image = resized
            
            # Mode "stretch" - Étire l'image aux dimensions exactes
            elif resize_mode == 'stretch':
                result_image = image.resize((width, height), resampling_method)
                
            # Mode "fill" - Remplit entièrement la zone cible, recadre si nécessaire
            elif resize_mode == 'fill':
                # Calculer le ratio pour remplir complètement
                ratio = max(width / orig_width, height / orig_height)
                new_width = int(orig_width * ratio)
                new_height = int(orig_height * ratio)
                
                # Redimensionner l'image pour qu'elle couvre la zone
                resized = image.resize((new_width, new_height), resampling_method)
                
                # Calculer les coordonnées de recadrage
                if crop_position == 'center':
                    left = (new_width - width) // 2
                    top = (new_height - height) // 2
                elif crop_position == 'top':
                    left = (new_width - width) // 2
                    top = 0
                elif crop_position == 'bottom':
                    left = (new_width - width) // 2
                    top = new_height - height
                elif crop_position == 'left':
                    left = 0
                    top = (new_height - height) // 2
                elif crop_position == 'right':
                    left = new_width - width
                    top = (new_height - height) // 2
                else:  # Par défaut, centre
                    left = (new_width - width) // 2
                    top = (new_height - height) // 2
                    
                # Recadrer l'image
                right = left + width
                bottom = top + height
                result_image = resized.crop((left, top, right, bottom))
            
            return result_image
            
        except Exception as e:
            logger.error(f"Erreur lors du redimensionnement avec PIL: {str(e)}")
            raise