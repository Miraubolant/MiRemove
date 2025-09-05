"""
CropHeadProcessor - Crop sous la bouche avec détection de visage OpenCV
Fonction crop_below_mouth exactement comme dans le code de référence
"""

import logging
import numpy as np
import cv2
import os
from PIL import Image

logger = logging.getLogger(__name__)


class CropHeadProcessor:
    """Processeur pour crop sous la bouche avec détection de visage OpenCV"""
    
    def __init__(self, config_manager):
        self.config = config_manager
    
    def process(self, image: Image.Image) -> Image.Image:
        """Crop sous la bouche avec détection de visage"""
        try:
            result = self.crop_below_mouth(image)
            if result is not None:
                return result
            else:
                logger.warning("Face detection failed, returning original image")
                return image
        except Exception as e:
            logger.error(f"Crop processing failed: {e}")
            return image
    
    def crop_below_mouth(self, image, resampling_filter='lanczos'):
        """
        Détecte le visage sur une image PIL, garde uniquement la partie en dessous de la bouche.
        
        Args:
            image: Image PIL à traiter
            resampling_filter: Paramètre conservé pour compatibilité mais non utilisé
            
        Returns:
            Image PIL traitée ou None en cas d'échec
        """
        try:
            # Convertir l'image PIL en format OpenCV
            img_array = np.array(image)
            img = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            
            # Obtenir les dimensions originales de l'image
            original_height, original_width = img.shape[:2]
            
            # Charger les classificateurs pré-entraînés pour la détection du visage
            face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            
            if not os.path.exists(face_cascade_path):
                logger.error(f"Fichier de cascade introuvable: {face_cascade_path}")
                return None
                
            face_cascade = cv2.CascadeClassifier(face_cascade_path)
            
            # Convertir en niveau de gris pour la détection
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Détecter les visages avec OpenCV
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) == 0:
                logger.info("Aucun visage détecté dans l'image")
                return None
            
            # Prendre le premier visage détecté
            x, y, w, h = faces[0]
            
            # Estimer la position de la bouche en fonction des proportions du visage (environ 70-75% depuis le haut)
            mouth_y = y + int(h * 0.75)
            
            # Découper l'image pour ne garder que la partie en dessous de la bouche
            cropped = img[mouth_y:original_height, 0:original_width]
            
            if cropped.size == 0:
                logger.info("Échec de la découpe: image résultante vide")
                return None
            
            # Convertir l'image découpée en PIL et la retourner
            cropped_rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
            cropped_pil = Image.fromarray(cropped_rgb)
            
            return cropped_pil
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement du visage: {str(e)}")
            return None
