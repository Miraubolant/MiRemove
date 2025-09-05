#!/bin/bash

# Démarrer le backend Flask
cd backend
python3 -m gunicorn -b 0.0.0.0:5000 app_unified:app &

# Démarrer le frontend
cd ..
npm run preview