const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Mode de développement avec données en mémoire si MongoDB n'est pas disponible
let devMode = false;
let mockBooks = [];
let mockLoans = [];
let mockHistory = [];

// Persistance des données en mode développement
const DATA_DIR = path.join(__dirname, 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const LOANS_FILE = path.join(DATA_DIR, 'loans.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Fonctions pour sauvegarder et charger les données en mode dev
const saveDevData = () => {
    if (devMode) {
        try {
            fs.writeFileSync(BOOKS_FILE, JSON.stringify(mockBooks, null, 2));
            fs.writeFileSync(LOANS_FILE, JSON.stringify(mockLoans, null, 2));
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(mockHistory, null, 2));
            console.log('Données sauvegardées localement');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
        }
    }
};

const loadDevData = () => {
    if (devMode) {
        try {
            if (fs.existsSync(BOOKS_FILE)) {
                mockBooks = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
                console.log(mockBooks.length + ' livres chargés depuis le fichier');
            }
            if (fs.existsSync(LOANS_FILE)) {
                mockLoans = JSON.parse(fs.readFileSync(LOANS_FILE, 'utf8'));
                console.log(mockLoans.length + ' prêts chargés depuis le fichier');
            }
            if (fs.existsSync(HISTORY_FILE)) {
                mockHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
                console.log(mockHistory.length + ' historiques chargés depuis le fichier');
            }
        } catch (error) {
            console.error('Erreur chargement des données:', error);
        }
    }
};

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS appropriée
app.use(cors({
    origin: ['https://library-alkawthar.vercel.app', 'http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuration multer pour upload de fichiers
const upload = multer({ 
    dest: '/tmp/uploads',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// MongoDB connection avec fallback vers mode développement
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connecté avec succès sur ' + MONGODB_URI);
    // Initialiser quelques données de test si la base est vide
    initializeTestData();
  })
  .catch(err => {
    console.error("Erreur de connexion MongoDB:", err);
    console.log("Mode développement: MongoDB non disponible, utilisation de données en mémoire");
    devMode = true;
    initializeMockData();
  });

// Initialiser des données en mémoire pour les tests
const initializeMockData = () => {
    // D'abord essayer de charger les données existantes
    loadDevData();
    
    // Si aucune donnée n'existe, initialiser avec des données par défaut
    if (mockBooks.length === 0) {
    mockBooks = [
        {
            isbn: '978-0-7475-3269-9',
            title: 'Harry Potter and the Philosopher\'s Stone',
            totalCopies: 5,
            loanedCopies: 1,
            availableCopies: 4,
            subject: 'English Literature',
            level: 'Grade 6',
            language: 'English',
            cornerName: 'Fantasy Corner',
            cornerNumber: 'F-01'
        },
        {
            isbn: '978-2-8104-1234-5',
            title: 'Les Mathématiques CE2',
            totalCopies: 10,
            loanedCopies: 2,
            availableCopies: 8,
            subject: 'Mathématiques',
            level: 'CE2',
            language: 'Français',
            cornerName: 'Coin des Sciences',
            cornerNumber: 'S-02'
        },
        {
            isbn: '978-1-4012-1234-5',
            title: 'Science Textbook Grade 6',
            totalCopies: 8,
            loanedCopies: 2,
            availableCopies: 6,
            subject: 'Science',
            level: 'Grade 6',
            language: 'English',
            cornerName: 'Science Corner',
            cornerNumber: 'S-01'
        },
        {
            isbn: '978-3-1615-4321-8',
            title: 'التربية الإسلامية الصف الخامس',
            totalCopies: 15,
            loanedCopies: 1,
            availableCopies: 14,
            subject: 'التربية الإسلامية',
            level: 'الصف الخامس',
            language: 'عربي',
            cornerName: 'ركن التربية الإسلامية',
            cornerNumber: 'إ-01'
        },
        {
            isbn: '978-1-2345-6789-0',
            title: 'Histoire de France CM1',
            totalCopies: 6,
            loanedCopies: 1,
            availableCopies: 5,
            subject: 'Histoire',
            level: 'CM1',
            language: 'Français',
            cornerName: 'Coin Histoire-Géo',
            cornerNumber: 'H-01'
        },
        {
            isbn: '978-2-2101-5678-9',
            title: 'Physics for Teachers',
            totalCopies: 3,
            loanedCopies: 1,
            availableCopies: 2,
            subject: 'Physics',
            level: 'Teacher Reference',
            language: 'English',
            cornerName: 'Teachers Corner',
            cornerNumber: 'T-01'
        }
    ];
    
    mockLoans = [
        {
            isbn: '978-0-7475-3269-9',
            studentName: 'Miss Jana',
            studentClass: 'Grade 6A',
            borrowerType: 'student',
            loanDate: new Date('2025-10-07'),
            returnDate: new Date('2025-10-14')
        },
        {
            isbn: '978-2-8104-1234-5',
            studentName: 'Miss Nour Hnich',
            studentClass: 'CE2 B', 
            borrowerType: 'student',
            loanDate: new Date('2025-09-30'),
            returnDate: new Date('2025-10-31')
        },
        {
            isbn: '978-1-4012-1234-5',
            studentName: 'Ahmed Ali',
            studentClass: '6A',
            borrowerType: 'student',
            loanDate: new Date('2025-10-01'),
            returnDate: new Date('2025-10-15')
        },
        {
            isbn: '978-1-4012-1234-5',
            studentName: 'Sarah Mohamed',
            studentClass: '6B',
            borrowerType: 'student', 
            loanDate: new Date('2025-10-05'),
            returnDate: new Date('2025-10-19')
        },
        {
            isbn: '978-2-2101-5678-9',
            studentName: 'Prof. Martin Dupont',
            studentClass: 'Physique',
            borrowerType: 'teacher',
            loanDate: new Date('2025-10-01'),
            returnDate: new Date('2025-11-01')
        },
        {
            isbn: '978-3-1615-4321-8',
            studentName: 'Fatima Hassan',
            studentClass: '5A',
            borrowerType: 'student',
            loanDate: new Date('2025-10-08'),
            returnDate: new Date('2025-10-22')
        },
        {
            isbn: '978-1-2345-6789-0',
            studentName: 'Omar Abdullah',
            studentClass: '4B',
            borrowerType: 'student',
            loanDate: new Date('2025-10-09'),
            returnDate: new Date('2025-10-23')
        }
    ];
    
    console.log('Données de test en mémoire initialisées');
    }
    
    // Synchroniser les loanedCopies avec les prêts actifs
    syncLoanedCopies();
    // Sauvegarder les données après initialisation
    saveDevData();
};

// Fonction pour synchroniser les loanedCopies avec les prêts réels
const syncLoanedCopies = () => {
    if (devMode) {
        // Créer un compteur des prêts par ISBN
        const loanCounts = {};
        mockLoans.forEach(loan => {
            loanCounts[loan.isbn] = (loanCounts[loan.isbn] || 0) + 1;
        });
        
        // Mettre à jour les loanedCopies dans mockBooks
        mockBooks.forEach(book => {
            const loanedCount = loanCounts[book.isbn] || 0;
            book.loanedCopies = loanedCount;
            book.availableCopies = book.totalCopies - loanedCount;
        });
        
        console.log('LoanedCopies synchronisées avec les prêts actifs');
    }
};

// Schémas MongoDB
const BookSchema = new mongoose.Schema({
    isbn: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    totalCopies: { type: Number, default: 1 },
    loanedCopies: { type: Number, default: 0 },
    availableCopies: { type: Number, default: 1 },
    subject: String,
    level: String,
    language: String,
    cornerName: String,
    cornerNumber: String
});

const LoanSchema = new mongoose.Schema({
    isbn: { type: String, required: true },
    studentName: { type: String, required: true },
    studentClass: String,
    borrowerType: { type: String, enum: ['student', 'teacher'], default: 'student' },
    loanDate: { type: Date, default: Date.now },
    returnDate: { type: Date, required: true }
});

const Book = mongoose.model('Book', BookSchema);
const Loan = mongoose.model('Loan', LoanSchema);

// Initialiser des données de test en base si elle est vide
const initializeTestData = async () => {
    try {
        const bookCount = await Book.countDocuments();
        if (bookCount === 0) {
            console.log('Base de données vide, initialisation des données de test...');
            await Book.insertMany([
                {
                    isbn: '978-0-7475-3269-9',
                    title: 'Harry Potter and the Philosopher\'s Stone',
                    totalCopies: 5,
                    loanedCopies: 0,
                    availableCopies: 5,
                    subject: 'English Literature',
                    level: 'Grade 6',
                    language: 'English',
                    cornerName: 'Fantasy Corner',
                    cornerNumber: 'F-01'
                }
            ]);
            console.log('Données de test insérées en base MongoDB');
        }
    } catch (error) {
        console.error('Erreur lors de initialisation des données de test:', error);
    }
};

// --- ROUTES API ---

// Route de base pour vérifier que l'API fonctionne
app.get('/api', (req, res) => {
    const mode = devMode ? 'Mode Développement (mémoire)' : 'Mode Production (MongoDB)';
    res.json({
        message: 'API Bibliothèque Al-Kawthar - Fonctionnelle',
        mode: mode,
        timestamp: new Date(),
        stats: {
            books: devMode ? mockBooks.length : 'Connecté à MongoDB',
            loans: devMode ? mockLoans.length : 'Connecté à MongoDB'
        }
    });
});

// Route pour obtenir les statistiques
app.get('/api/statistics', async (req, res) => {
    try {
        if (devMode) {
            const stats = {
                totalBooks: mockBooks.length,
                totalCopies: mockBooks.reduce((sum, book) => sum + book.totalCopies, 0),
                loanedCopies: mockBooks.reduce((sum, book) => sum + book.loanedCopies, 0),
                availableCopies: mockBooks.reduce((sum, book) => sum + book.availableCopies, 0),
                activeLoans: mockLoans.length
            };
            res.json(stats);
        } else {
            const totalBooks = await Book.countDocuments();
            const totalCopiesResult = await Book.aggregate([{ $group: { _id: null, total: { $sum: '$totalCopies' } } }]);
            const loanedCopiesResult = await Book.aggregate([{ $group: { _id: null, total: { $sum: '$loanedCopies' } } }]);
            const availableCopiesResult = await Book.aggregate([{ $group: { _id: null, total: { $sum: '$availableCopies' } } }]);
            const activeLoans = await Loan.countDocuments();

            res.json({
                totalBooks,
                totalCopies: totalCopiesResult[0]?.total || 0,
                loanedCopies: loanedCopiesResult[0]?.total || 0,
                availableCopies: availableCopiesResult[0]?.total || 0,
                activeLoans: activeLoans
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// Route pour obtenir les prêts d'étudiants
app.get('/api/loans/students', async (req, res) => {
    try {
        if (devMode) {
            const studentLoans = mockLoans.filter(loan => loan.borrowerType === 'student');
            res.json(studentLoans);
        } else {
            const loans = await Loan.find({ borrowerType: 'student' });
            res.json(loans);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// Route pour obtenir les prêts d'enseignants
app.get('/api/loans/teachers', async (req, res) => {
    try {
        if (devMode) {
            const teacherLoans = mockLoans.filter(loan => loan.borrowerType === 'teacher');
            res.json(teacherLoans);
        } else {
            const loans = await Loan.find({ borrowerType: 'teacher' });
            res.json(loans);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// Route pour obtenir la liste des livres avec pagination et recherche
app.get('/api/books', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        if (devMode) {
            let filteredBooks = mockBooks;
            if (search) {
                const searchLower = search.toLowerCase();
                filteredBooks = mockBooks.filter(book => 
                    book.title.toLowerCase().includes(searchLower) ||
                    book.isbn.toLowerCase().includes(searchLower) ||
                    (book.subject && book.subject.toLowerCase().includes(searchLower)) ||
                    (book.level && book.level.toLowerCase().includes(searchLower))
                );
            }
            
            const totalBooks = filteredBooks.length;
            const totalPages = Math.ceil(totalBooks / limit);
            const paginatedBooks = filteredBooks.slice(skip, skip + limit);
            
            res.json({
                books: paginatedBooks,
                totalBooks,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            });
        } else {
            let query = {};
            if (search) {
                query = {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { isbn: { $regex: search, $options: 'i' } },
                        { subject: { $regex: search, $options: 'i' } },
                        { level: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            const totalBooks = await Book.countDocuments(query);
            const totalPages = Math.ceil(totalBooks / limit);
            const books = await Book.find(query).skip(skip).limit(limit);

            res.json({
                books,
                totalBooks,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// Route pour obtenir un livre spécifique par ISBN
app.get('/api/books/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        
        if (devMode) {
            const book = mockBooks.find(b => b.isbn === isbn);
            if (book) {
                res.json(book);
            } else {
                res.status(404).json({ message: 'Livre non trouvé' });
            }
        } else {
            const book = await Book.findOne({ isbn });
            if (book) {
                res.json(book);
            } else {
                res.status(404).json({ message: 'Livre non trouvé' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// Route pour obtenir tous les prêts
app.get('/api/loans', async (req, res) => {
    try {
        if (devMode) {
            // En mode dev, enrichir les prêts avec les titres des livres
            const enrichedLoans = mockLoans.map(loan => {
                const book = mockBooks.find(b => b.isbn === loan.isbn);
                return {
                    ...loan,
                    title: book ? book.title : 'Livre non trouvé'
                };
            });
            res.json(enrichedLoans);
        } else {
            const loans = await Loan.find();
            const enrichedLoans = [];
            for (const loan of loans) {
                const book = await Book.findOne({ isbn: loan.isbn });
                enrichedLoans.push({
                    ...loan.toObject(),
                    title: book ? book.title : 'Livre non trouvé'
                });
            }
            res.json(enrichedLoans);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// Export pour Vercel
module.exports = app;

// Si tu veux tester en local :
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Serveur local sur http://localhost:${PORT}`);
  });
}
