# 📚 Bibliothèque Al-Kawthar - Système de Gestion

Système complet de gestion de bibliothèque pour les Écoles Internationales Al-Kawthar avec support multilingue (Arabe, Français, Anglais).

## 🚀 Déploiement sur Vercel

### Configuration Requise

1. **Variable d'environnement MongoDB** - Ajouter dans Vercel :
   ```
   MONGODB_URI=mongodb+srv://cherifmed2030_db_user:Alkawthar01@library.ve29w9g.mongodb.net/?retryWrites=true&w=majority&appName=Library
   ```

### Étapes de Configuration Vercel

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet `Library-Alkawthar`
3. Aller dans **Settings** → **Environment Variables**
4. Ajouter la variable `MONGODB_URI` avec la valeur MongoDB
5. Redéployer le projet

## 📊 Base de Données MongoDB

- **Provider**: MongoDB Atlas
- **Database**: Library
- **Collections**:
  - `books` - Catalogue des livres
  - `loans` - Prêts actifs
  - `histories` - Historique des prêts

### Initialisation Automatique

Le système initialise automatiquement 8 livres de test si la base de données est vide :
- 3 livres en Anglais
- 3 livres en Français  
- 2 livres en Arabe

## 🔑 Connexion

- **Utilisateur**: `Alkawthar@30`
- **Mot de passe**: `Alkawthar@30`

## ✨ Fonctionnalités

- ✅ Gestion complète des livres (CRUD)
- ✅ Système de prêts pour étudiants et enseignants
- ✅ Scanner de code-barres
- ✅ Import/Export Excel
- ✅ Recherche et tri avancés
- ✅ Statistiques en temps réel
- ✅ Support multilingue (AR/FR/EN)
- ✅ Gestion des dates de retour
- ✅ Historique des prêts
- ✅ Notifications de retard

## 🛠️ Technologies

- **Backend**: Node.js + Express
- **Base de données**: MongoDB Atlas
- **Frontend**: HTML5 + CSS3 + JavaScript vanilla
- **Déploiement**: Vercel
- **Bibliothèques**: Mongoose, Multer, XLSX, jsQR

## 📝 Structure du Projet

```
/
├── api/
│   └── index.js          # API Backend Node.js/Express
├── public/
│   ├── index.html        # Page principale
│   ├── styles.css        # Styles CSS
│   └── scripts.js        # Logic JavaScript
├── package.json          # Dépendances Node.js
├── vercel.json          # Configuration Vercel
└── README.md            # Documentation
```

## 🔧 Développement Local

```bash
# Installer les dépendances
npm install

# Lancer le serveur local
npm start

# Le serveur démarre sur http://localhost:3000
```

## 📞 Support

Pour toute question ou problème, contactez l'équipe technique des Écoles Al-Kawthar.

---

© 2025 Écoles Internationales Al-Kawthar - Tous droits réservés
