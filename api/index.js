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
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Fonctions de persistance
function saveDevData() {
    if (devMode) {
        try {
            fs.writeFileSync(BOOKS_FILE, JSON.stringify(mockBooks, null, 2));
            fs.writeFileSync(LOANS_FILE, JSON.stringify(mockLoans, null, 2));
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(mockHistory, null, 2));
            console.log('Données sauvegardées en mode développement');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }
}

function loadDevData() {
    if (devMode) {
        try {
            if (fs.existsSync(BOOKS_FILE)) {
                mockBooks = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
            }
            if (fs.existsSync(LOANS_FILE)) {
                mockLoans = JSON.parse(fs.readFileSync(LOANS_FILE, 'utf8'));
            }
            if (fs.existsSync(HISTORY_FILE)) {
                mockHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
            }
            console.log('Données chargées depuis les fichiers');
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            console.log('Initialisation avec des données par défaut');
        }
    }
}

const app = express();
const port = process.env.PORT || 3002;

// --- CONFIGURATION ---
const MAX_LOANS_PER_STUDENT = 3;

// Middlewares
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Connexion à MongoDB ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alkawthar-library';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log(`MongoDB connecté avec succès sur ${MONGODB_URI}`);
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
    loadDevData();
    if (mockBooks.length === 0) {
        mockBooks = [
            { _id: "652f1f3b3a2b1a1f3c8a1b1a", isbn: '978-0-7475-3269-9', title: 'OXFORD Treetops the Canterville Ghost', totalCopies: 3, loanedCopies: 1, subject: 'Fiction', level: 'undefined', language: 'English', cornerName: 'Fantasy', cornerNumber: 'A1' },
            { _id: "652f1f3b3a2b1a1f3c8a1b1b", isbn: '978-2-8104-1234-5', title: 'LE PETIT LAROUSSE ILLUSTRE 2017', totalCopies: 2, loanedCopies: 1, subject: 'Reference', level: 'undefined', language: 'French', cornerName: 'Reference', cornerNumber: 'B2' },
            { _id: "652f1f3b3a2b1a1f3c8a1b1c", isbn: '978-0-439-70818-8', title: 'Charlotte\'s Web', totalCopies: 5, loanedCopies: 0, subject: 'Fiction', level: 'Grade 4', language: 'English', cornerName: 'Children', cornerNumber: 'C3' }
        ];
        mockLoans = [
            { isbn: '978-0-7475-3269-9', studentName: 'Miss Jana', studentClass: 'undefined', borrowerType: 'student', loanDate: new Date('2025-10-07'), returnDate: new Date('2025-10-14') },
            { isbn: '978-2-8104-1234-5', studentName: 'Miss Nour Hnich', studentClass: 'undefined', borrowerType: 'student', loanDate: new Date('2025-09-30'), returnDate: new Date('2025-10-31') }
        ];
        console.log('Données de test en mémoire initialisées');
    }
    syncLoanedCopies();
    saveDevData();
};

const syncLoanedCopies = () => {
    if (devMode) {
        const loanCounts = {};
        mockLoans.forEach(loan => {
            loanCounts[loan.isbn] = (loanCounts[loan.isbn] || 0) + (loan.copiesCount || 1);
        });
        mockBooks.forEach(book => {
            book.loanedCopies = loanCounts[book.isbn] || 0;
        });
    }
};

const initializeTestData = async () => {
    try {
        const bookCount = await Book.countDocuments();
        if (bookCount === 0) {
            await Book.insertMany([
                { isbn: '978-0-7475-3269-9', title: 'Harry Potter and the Philosopher\'s Stone', totalCopies: 3, loanedCopies: 1, subject: 'Fiction', level: 'Grade 6', language: 'English', cornerName: 'Fantasy', cornerNumber: 'A1' },
                { isbn: '978-0-439-70818-8', title: 'Charlotte\'s Web', totalCopies: 2, loanedCopies: 0, subject: 'Fiction', level: 'Grade 4', language: 'English', cornerName: 'Children', cornerNumber: 'B2' }
            ]);
            await Loan.insertMany([
                { isbn: '978-0-7475-3269-9', studentName: 'Miss Jana', studentClass: 'undefined', borrowerType: 'student', loanDate: new Date('2025-10-07'), returnDate: new Date('2025-10-14') }
            ]);
            console.log('Données de test initialisées');
        }
    } catch (error) {
        console.log('Pas d\'initialisation des données de test:', error.message);
    }
};

// --- Schémas Mongoose ---
// IMPORTANT: `unique` est retiré de l'ISBN pour permettre plusieurs livres avec le même code-barres
const BookSchema = new mongoose.Schema({ 
    isbn: { type: String, required: true, trim: true },
    title: { type: String, required: true }, 
    totalCopies: { type: Number, required: true, min: 1, default: 1 }, 
    loanedCopies: { type: Number, default: 0 }, 
    subject: String, 
    level: String, 
    language: String, 
    cornerName: String, 
    cornerNumber: String 
});

const LoanSchema = new mongoose.Schema({ 
    isbn: { type: String, required: true }, 
    studentName: { type: String, required: true }, 
    studentClass: { type: String, required: true }, 
    borrowerType: { type: String, enum: ['student', 'teacher'], default: 'student' }, 
    loanDate: { type: Date, required: true }, 
    returnDate: { type: Date, required: true },
    copiesCount: { type: Number, default: 1, min: 1 }
});

const HistorySchema = new mongoose.Schema({ 
    isbn: { type: String, required: true }, 
    bookTitle: { type: String, required: true }, 
    studentName: { type: String, required: true }, 
    studentClass: { type: String }, 
    borrowerType: { type: String, enum: ['student', 'teacher'], default: 'student' }, 
    loanDate: { type: Date, required: true }, 
    actualReturnDate: { type: Date, default: Date.now },
    copiesCount: { type: Number, default: 1, min: 1 }
});

const Book = mongoose.model('Book', BookSchema);
const Loan = mongoose.model('Loan', LoanSchema);
const History = mongoose.model('History', HistorySchema);

// --- ROUTES ---

// STATISTIQUES
app.get('/api/statistics', async (req, res) => {
    try {
        let totalCopies = 0;
        let loanedCopies = 0;
        if (devMode) {
            totalCopies = mockBooks.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
            loanedCopies = mockLoans.reduce((sum, loan) => sum + (loan.copiesCount || 1), 0);
        } else {
            const books = await Book.find({});
            totalCopies = books.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
            loanedCopies = books.reduce((sum, book) => sum + (book.loanedCopies || 0), 0);
        }
        res.json({
            totalCopies,
            loanedCopies,
            availableCopies: totalCopies - loanedCopies,
            totalBooks: devMode ? mockBooks.length : await Book.countDocuments(),
            activeLoans: devMode ? mockLoans.length : await Loan.countDocuments()
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du calcul des statistiques', error: error.message });
    }
});

// LIVRES
app.get('/api/books', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        
        let query = {};
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            query = { $or: [{ title: searchRegex }, { isbn: searchRegex }, { subject: searchRegex }] };
        }

        if (devMode) {
            const filtered = mockBooks.filter(b => !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.isbn.includes(search));
            res.json({
                books: filtered.slice(skip, skip + limit),
                pagination: { current: page, pages: Math.ceil(filtered.length / limit), total: filtered.length }
            });
        } else {
            const books = await Book.find(query).skip(skip).limit(limit).lean();
            const totalCount = await Book.countDocuments(query);
            res.json({
                books,
                pagination: { current: page, pages: Math.ceil(totalCount / limit), total: totalCount }
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

app.post('/api/books', async (req, res) => {
    try {
        const newBookData = req.body;
        if (devMode) {
            newBookData._id = new mongoose.Types.ObjectId().toString();
            mockBooks.push(newBookData);
            saveDevData();
            res.status(201).json(newBookData);
        } else {
            const book = new Book(newBookData);
            await book.save();
            res.status(201).json(book);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// Mise à jour via l'ID unique de la base de données (_id)
app.put('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (devMode) {
            const index = mockBooks.findIndex(b => b._id === id);
            if (index === -1) return res.status(404).json({ message: "Livre non trouvé" });
            mockBooks[index] = { ...mockBooks[index], ...req.body };
            saveDevData();
            res.json(mockBooks[index]);
        } else {
            const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true });
            if (!updatedBook) return res.status(404).json({ message: "Livre non trouvé" });
            res.json(updatedBook);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// Suppression via l'ID unique de la base de données (_id)
app.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (devMode) {
            const initialLength = mockBooks.length;
            mockBooks = mockBooks.filter(b => b._id !== id);
            if (mockBooks.length === initialLength) return res.status(404).json({ message: "Livre non trouvé" });
            saveDevData();
            res.status(204).send();
        } else {
            const result = await Book.findByIdAndDelete(id);
            if (!result) return res.status(404).json({ message: "Livre non trouvé" });
            res.status(204).send();
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// UPLOAD EXCEL
app.post('/api/books/upload', upload.single('excelFile'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier uploadé.' });
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(worksheet);
        
        const booksToProcess = json.map(row => ({
            isbn: String(row['ISBN'] || '').trim(),
            title: String(row['Title'] || '').trim(),
            totalCopies: parseInt(row['QTY'], 10) || 1,
            subject: row['Subject'] || 'Non classé',
            level: row['level'] || 'undefined',
            language: row['language'] || 'Non spécifié',
            cornerName: row['Corner name'] || 'Non classé',
            cornerNumber: String(row['Corner number'] || '0'),
            loanedCopies: 0
        })).filter(book => book.isbn && book.title);

        if (devMode) {
            mockBooks.push(...booksToProcess.map(b => ({ ...b, _id: new mongoose.Types.ObjectId().toString() })));
            saveDevData();
        } else {
            if (booksToProcess.length > 0) {
                await Book.insertMany(booksToProcess);
            }
        }
        res.json({ message: "Importation terminée!", addedCount: booksToProcess.length });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du traitement du fichier Excel.", error: error.message });
    }
});

// PRÊTS (LOANS)
app.get('/api/loans/:type', async (req, res) => {
    const { type } = req.params;
    const borrowerType = type === 'students' ? 'student' : 'teacher';
    try {
        if (devMode) {
            res.json(mockLoans.filter(l => l.borrowerType === borrowerType));
        } else {
            const loans = await Loan.find({ borrowerType });
            res.json(loans);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});


app.post('/api/loans', async (req, res) => {
    try {
        const loanData = req.body;
        const { isbn, studentName, borrowerType, copiesCount = 1 } = loanData;

        if (devMode) {
            const maxLoans = borrowerType === 'teacher' ? 10 : MAX_LOANS_PER_STUDENT;
            const existingLoansCount = mockLoans.filter(l => l.studentName.toLowerCase() === studentName.toLowerCase()).length;
            if (existingLoansCount >= maxLoans) return res.status(400).json({ message: `Limite de prêts atteinte pour cet utilisateur.` });

            const book = mockBooks.find(b => b.isbn === isbn); // Simplifié, le client doit avoir choisi le bon livre
            if (!book) return res.status(404).json({ message: "Livre non trouvé" });
            if ((book.totalCopies - book.loanedCopies) < copiesCount) return res.status(400).json({ message: "Pas assez de copies disponibles." });
            
            book.loanedCopies += copiesCount;
            mockLoans.push(loanData);
            saveDevData();
            res.status(201).json(loanData);
        } else {
            const book = await Book.findOne({ isbn: isbn }); // De même, le client a résolu l'ambiguïté
            if (!book) return res.status(404).json({ message: "Livre non trouvé" });
            if ((book.totalCopies - book.loanedCopies) < copiesCount) return res.status(400).json({ message: "Pas assez de copies disponibles." });

            book.loanedCopies += copiesCount;
            await book.save();
            
            const newLoan = new Loan(loanData);
            await newLoan.save();
            res.status(201).json(newLoan);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

app.delete('/api/loans', async (req, res) => {
    try {
        const { isbn, studentName } = req.body;
        if (devMode) {
            const loanIndex = mockLoans.findIndex(l => l.isbn === isbn && l.studentName === studentName);
            if (loanIndex === -1) return res.status(404).json({ message: "Prêt non trouvé" });
            const loan = mockLoans[loanIndex];
            mockLoans.splice(loanIndex, 1);

            const book = mockBooks.find(b => b.isbn === isbn);
            if (book) {
                book.loanedCopies = Math.max(0, book.loanedCopies - (loan.copiesCount || 1));
                mockHistory.push({ isbn: book.isbn, bookTitle: book.title, studentName: loan.studentName, loanDate: loan.loanDate, actualReturnDate: new Date() });
            }
            saveDevData();
            res.status(204).send();
        } else {
            const loan = await Loan.findOneAndDelete({ isbn, studentName });
            if (!loan) return res.status(404).json({ message: "Prêt non trouvé" });

            const book = await Book.findOne({ isbn: isbn });
            if (book) {
                book.loanedCopies = Math.max(0, book.loanedCopies - (loan.copiesCount || 1));
                await book.save();
                await History.create({ isbn: book.isbn, bookTitle: book.title, studentName: loan.studentName, loanDate: loan.loanDate });
            }
            res.status(204).send();
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// HISTORIQUE
app.get('/api/history/book/:isbn', async (req, res) => {
    try {
        if (devMode) {
            res.json(mockHistory.filter(h => h.isbn === req.params.isbn));
        } else {
            const history = await History.find({ isbn: req.params.isbn }).sort({ actualReturnDate: -1 });
            res.json(history);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// EXPORT EXCEL
app.get('/api/export/excel', async (req, res) => {
    try {
        let booksData, loansData, historyData;
        if (devMode) {
            booksData = mockBooks;
            loansData = mockLoans;
            historyData = mockHistory;
        } else {
            booksData = await Book.find({}).lean();
            loansData = await Loan.find({}).lean();
            historyData = await History.find({}).lean();
        }
        
        const workbook = xlsx.utils.book_new();
        const booksSheet = xlsx.utils.json_to_sheet(booksData.map(b => ({ ...b, availableCopies: b.totalCopies - b.loanedCopies })));
        xlsx.utils.book_append_sheet(workbook, booksSheet, 'Livres');
        
        const loansSheet = xlsx.utils.json_to_sheet(loansData.map(l => ({...l, bookTitle: booksData.find(b => b.isbn === l.isbn)?.title || 'Titre non trouvé'})));
        xlsx.utils.book_append_sheet(workbook, loansSheet, 'Prêts Actuels');
        
        const historySheet = xlsx.utils.json_to_sheet(historyData);
        xlsx.utils.book_append_sheet(workbook, historySheet, 'Historique');
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', `attachment; filename="library_data_${new Date().toISOString().split('T')[0]}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

module.exports = app;
