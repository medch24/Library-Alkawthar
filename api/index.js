const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');

// Mode de développement avec données en mémoire si MongoDB n'est pas disponible
let devMode = false;
let mockBooks = [];
let mockLoans = [];
let mockHistory = [];

const app = express();
const port = process.env.PORT || 3002;

// --- CONFIGURATION ---
const MAX_LOANS_PER_STUDENT = 3;

// Middlewares
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// --- Connexion à MongoDB ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alkawthar-library';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log(`MongoDB connecté avec succès sur ${MONGODB_URI}`);
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
    mockBooks = [
        {
            isbn: '978-0-7475-3269-9',
            title: 'OXFORD Treetops the Canterville Ghost',
            totalCopies: 3,
            loanedCopies: 1,
            subject: 'Fiction',
            level: 'undefined',
            language: 'English',
            cornerName: 'Fantasy',
            cornerNumber: 'A1'
        },
        {
            isbn: '978-2-8104-1234-5', 
            title: 'LE PETIT LAROUSSE ILLUSTRE 2017',
            totalCopies: 2,
            loanedCopies: 1,
            subject: 'Reference',
            level: 'undefined', 
            language: 'French',
            cornerName: 'Reference',
            cornerNumber: 'B2'
        },
        {
            isbn: '978-0-439-70818-8',
            title: 'Charlotte\'s Web',
            totalCopies: 5,
            loanedCopies: 0,
            subject: 'Fiction',
            level: 'Grade 4',
            language: 'English', 
            cornerName: 'Children',
            cornerNumber: 'C3'
        },
        {
            isbn: '978-1-4012-1234-5',
            title: 'Mathematics Grade 6',
            totalCopies: 10,
            loanedCopies: 3,
            subject: 'Mathematics',
            level: 'Grade 6',
            language: 'English',
            cornerName: 'Math',
            cornerNumber: 'M1'
        },
        {
            isbn: '978-2-2101-5678-9',
            title: 'Sciences Physiques 3ème',
            totalCopies: 8,
            loanedCopies: 2,
            subject: 'Sciences',
            level: '3ème',
            language: 'French',
            cornerName: 'Sciences',
            cornerNumber: 'S1'
        }
    ];
    
    mockLoans = [
        {
            isbn: '978-0-7475-3269-9',
            studentName: 'Miss Jana',
            studentClass: 'undefined',
            borrowerType: 'student',
            loanDate: new Date('2025-10-07'),
            returnDate: new Date('2025-10-14')
        },
        {
            isbn: '978-2-8104-1234-5',
            studentName: 'Miss Nour Hnich',
            studentClass: 'undefined', 
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
        }
    ];
    
    mockHistory = [
        {
            isbn: '978-0-439-70818-8',
            bookTitle: 'Charlotte\'s Web',
            studentName: 'Fatima Hassan',
            studentClass: '4A',
            borrowerType: 'student',
            loanDate: new Date('2025-09-01'),
            actualReturnDate: new Date('2025-09-15')
        },
        {
            isbn: '978-1-4012-1234-5',
            bookTitle: 'Mathematics Grade 6', 
            studentName: 'Prof. Lisa Smith',
            studentClass: 'Mathematics',
            borrowerType: 'teacher',
            loanDate: new Date('2025-08-20'),
            actualReturnDate: new Date('2025-09-20')
        }
    ];
    
    console.log('Données de test en mémoire initialisées');
    // Synchroniser les loanedCopies avec les prêts actifs
    syncLoanedCopies();
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
            book.loanedCopies = loanCounts[book.isbn] || 0;
        });
        
        console.log('Synchronisation des loanedCopies terminée');
    }
};

// Fonction pour initialiser des données de test
const initializeTestData = async () => {
    try {
        const bookCount = await Book.countDocuments();
        if (bookCount === 0) {
            await Book.insertMany([
                {
                    isbn: '978-0-7475-3269-9',
                    title: 'Harry Potter and the Philosopher\'s Stone',
                    totalCopies: 3,
                    loanedCopies: 1,
                    subject: 'Fiction',
                    level: 'Grade 6',
                    language: 'English',
                    cornerName: 'Fantasy',
                    cornerNumber: 'A1'
                },
                {
                    isbn: '978-0-439-70818-8',
                    title: 'Charlotte\'s Web',
                    totalCopies: 2,
                    loanedCopies: 0,
                    subject: 'Fiction',
                    level: 'Grade 4',
                    language: 'English',
                    cornerName: 'Children',
                    cornerNumber: 'B2'
                }
            ]);
            
            await Loan.insertMany([
                {
                    isbn: '978-0-7475-3269-9',
                    studentName: 'Miss Jana',
                    studentClass: 'undefined',
                    borrowerType: 'student',
                    loanDate: new Date('2025-10-07'),
                    returnDate: new Date('2025-10-14')
                }
            ]);
            
            console.log('Données de test initialisées');
        }
    } catch (error) {
        console.log('Pas d\'initialisation des données de test:', error.message);
    }
};

// --- Schémas Mongoose ---
const BookSchema = new mongoose.Schema({ isbn: { type: String, required: true, unique: true, trim: true }, title: { type: String, required: true }, totalCopies: { type: Number, required: true, min: 1, default: 1 }, loanedCopies: { type: Number, default: 0 }, subject: String, level: String, language: String, cornerName: String, cornerNumber: String });
const LoanSchema = new mongoose.Schema({ isbn: { type: String, required: true }, studentName: { type: String, required: true }, studentClass: { type: String, required: true }, borrowerType: { type: String, enum: ['student', 'teacher'], default: 'student' }, loanDate: { type: Date, required: true }, returnDate: { type: Date, required: true } });
const HistorySchema = new mongoose.Schema({ isbn: { type: String, required: true }, bookTitle: { type: String, required: true }, studentName: { type: String, required: true }, studentClass: { type: String }, borrowerType: { type: String, enum: ['student', 'teacher'], default: 'student' }, loanDate: { type: Date, required: true }, actualReturnDate: { type: Date, default: Date.now } });

const Book = mongoose.model('Book', BookSchema);
const Loan = mongoose.model('Loan', LoanSchema);
const History = mongoose.model('History', HistorySchema);

// --- SYNCHRONISATION ET STATISTIQUES ---
// Endpoint pour synchroniser les loanedCopies avec les prêts actifs
app.post('/api/sync-loans', async (req, res) => {
    try {
        if (devMode) {
            syncLoanedCopies();
            res.json({ message: 'Synchronisation terminée (mode développement)' });
        } else {
            // Pour MongoDB, recalculer les loanedCopies basé sur les prêts actifs
            const books = await Book.find({});
            for (const book of books) {
                const activeLoansCount = await Loan.countDocuments({ isbn: book.isbn });
                book.loanedCopies = activeLoansCount;
                await book.save();
            }
            res.json({ message: 'Synchronisation terminée (MongoDB)' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la synchronisation', error });
    }
});

// Endpoint pour les statistiques
app.get('/api/statistics', async (req, res) => {
    try {
        let totalCopies = 0;
        let loanedCopies = 0;
        
        if (devMode) {
            totalCopies = mockBooks.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
            loanedCopies = mockBooks.reduce((sum, book) => sum + (book.loanedCopies || 0), 0);
        } else {
            const books = await Book.find({});
            totalCopies = books.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
            loanedCopies = books.reduce((sum, book) => sum + (book.loanedCopies || 0), 0);
        }
        
        const availableCopies = totalCopies - loanedCopies;
        
        res.json({
            totalCopies,
            loanedCopies,
            availableCopies,
            totalBooks: devMode ? mockBooks.length : await Book.countDocuments(),
            activeLoans: devMode ? mockLoans.length : await Loan.countDocuments()
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du calcul des statistiques', error });
    }
});

// --- NOUVELLES ROUTES ---
app.get('/api/loans/students', async (req, res) => {
    try {
        if (devMode) {
            const studentLoans = mockLoans.filter(loan => loan.borrowerType === 'student');
            res.json(studentLoans);
        } else {
            const studentLoans = await Loan.find({ borrowerType: 'student' });
            res.json(studentLoans);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

app.get('/api/loans/teachers', async (req, res) => {
    try {
        if (devMode) {
            const teacherLoans = mockLoans.filter(loan => loan.borrowerType === 'teacher');
            res.json(teacherLoans);
        } else {
            const teacherLoans = await Loan.find({ borrowerType: 'teacher' });
            res.json(teacherLoans);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

app.get('/api/export/excel', async (req, res) => {
    try {
        const books = await Book.find({}).lean();
        const loans = await Loan.find({}).lean();
        const history = await History.find({}).lean();

        const workbook = xlsx.utils.book_new();
        
        // Feuille des livres
        const booksSheet = xlsx.utils.json_to_sheet(books.map(book => ({
            'ISBN': book.isbn,
            'Titre': book.title,
            'Exemplaires Total': book.totalCopies,
            'Exemplaires Prêtés': book.loanedCopies,
            'Exemplaires Disponibles': book.totalCopies - book.loanedCopies,
            'Matière': book.subject || '',
            'Niveau': book.level || '',
            'Langue': book.language || '',
            'Nom du Coin': book.cornerName || '',
            'Numéro du Coin': book.cornerNumber || ''
        })));
        xlsx.utils.book_append_sheet(workbook, booksSheet, 'Livres');
        
        // Feuille des prêts actuels
        const loansWithBooks = await Promise.all(loans.map(async loan => {
            const book = await Book.findOne({ isbn: loan.isbn }).lean();
            return {
                'ISBN': loan.isbn,
                'Titre du Livre': book ? book.title : 'Non trouvé',
                'Nom': loan.studentName,
                'Classe': loan.studentClass || '',
                'Type': loan.borrowerType === 'teacher' ? 'Enseignant' : 'Élève',
                'Date de Prêt': loan.loanDate.toLocaleDateString('fr-FR'),
                'Date de Retour Prévue': loan.returnDate.toLocaleDateString('fr-FR')
            };
        }));
        const loansSheet = xlsx.utils.json_to_sheet(loansWithBooks);
        xlsx.utils.book_append_sheet(workbook, loansSheet, 'Prêts Actuels');
        
        // Feuille de l'historique
        const historySheet = xlsx.utils.json_to_sheet(history.map(h => ({
            'ISBN': h.isbn,
            'Titre du Livre': h.bookTitle,
            'Nom': h.studentName,
            'Classe': h.studentClass || '',
            'Type': h.borrowerType === 'teacher' ? 'Enseignant' : 'Élève',
            'Date de Prêt': h.loanDate.toLocaleDateString('fr-FR'),
            'Date de Retour Réelle': h.actualReturnDate.toLocaleDateString('fr-FR')
        })));
        xlsx.utils.book_append_sheet(workbook, historySheet, 'Historique');
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', `attachment; filename="library_data_${new Date().toISOString().split('T')[0]}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'export", error });
    }
});

// --- ROUTES API ---

// Renvoie TOUS les livres de la base de données ou en mémoire
app.get('/api/books', async (req, res) => {
    try {
        if (devMode) {
            res.json(mockBooks);
        } else {
            const books = await Book.find({});
            res.json(books);
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

app.post('/api/books', async (req, res) => { try { const { isbn, title, totalCopies, ...rest } = req.body; const updatedBook = await Book.findOneAndUpdate({ isbn: isbn }, { $inc: { totalCopies: totalCopies || 1 }, $setOnInsert: { isbn, title, ...rest } }, { new: true, upsert: true, setDefaultsOnInsert: true }); res.status(201).json(updatedBook); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.post('/api/books/upload', upload.single('excelFile'), async (req, res) => { if (!req.file) { return res.status(400).json({ message: 'Aucun fichier uploadé.' }); } try { const workbook = xlsx.read(req.file.buffer, { type: 'buffer' }); const sheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[sheetName]; const json = xlsx.utils.sheet_to_json(worksheet); const booksToProcess = []; const duplicateCounter = new Map(); for (const row of json) { const isbn = row['ISBN'] ? String(row['ISBN']).trim() : null; const title = row['Title'] ? row['Title'].trim() : null; if (!isbn || !title) continue; let finalTitle = title; let finalIsbn = isbn; const existingWithSameIsbn = await Book.findOne({ isbn: isbn }); const existingWithSameTitle = await Book.findOne({ title: title }); if (existingWithSameIsbn || existingWithSameTitle) { const key = `${isbn}_${title}`; const count = duplicateCounter.get(key) || 1; duplicateCounter.set(key, count + 1); finalTitle = `${title} (${count + 1})`; finalIsbn = `${isbn}-(${count + 1})`; } booksToProcess.push({ title: finalTitle, isbn: finalIsbn, totalCopies: parseInt(row['QTY'], 10) || 1, subject: row['Subject'] || '', level: row['level'] || '', language: row['language'] || '', cornerName: row['Corner name'] || 'Non classé', cornerNumber: row['Corner number'] ? String(row['Corner number']) : '0', loanedCopies: 0 }); } if (booksToProcess.length > 0) { await Book.insertMany(booksToProcess, { ordered: false }); } res.json({ message: "Importation terminée!", addedCount: booksToProcess.length, ignoredCount: json.length - booksToProcess.length }); } catch (error) { res.status(500).json({ message: "Erreur lors du traitement du fichier Excel.", error: error.message }); } });
app.put('/api/books/:originalIsbn', async (req, res) => { try { const { originalIsbn } = req.params; const updatedBook = await Book.findOneAndUpdate({ isbn: originalIsbn }, req.body, { new: true }); if (!updatedBook) return res.status(404).json({ message: "Livre non trouvé" }); res.json(updatedBook); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.delete('/api/books/:isbn', async (req, res) => { try { const { isbn } = req.params; const result = await Book.deleteOne({ isbn: isbn }); if (result.deletedCount === 0) return res.status(404).json({ message: "Livre non trouvé" }); res.status(204).send(); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.get('/api/loans', async (req, res) => { try { if (devMode) { res.json(mockLoans); } else { const loans = await Loan.find({}); res.json(loans); } } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.post('/api/loans', async (req, res) => { try { const { isbn, studentName, studentClass, borrowerType = 'student', loanDate, returnDate } = req.body; if (devMode) { const existingLoansCount = mockLoans.filter(loan => loan.studentName.toLowerCase() === studentName.toLowerCase()).length; const maxLoans = borrowerType === 'teacher' ? 10 : MAX_LOANS_PER_STUDENT; if (existingLoansCount >= maxLoans) { return res.status(400).json({ message: `Cet ${borrowerType === 'teacher' ? 'enseignant' : 'élève'} a déjà atteint la limite de ${maxLoans} prêts.` }); } const book = mockBooks.find(b => b.isbn === isbn); if (!book) return res.status(404).json({ message: "Livre non trouvé" }); if (book.loanedCopies >= book.totalCopies) return res.status(400).json({ message: "Toutes les copies de ce livre sont déjà prêtées." }); book.loanedCopies++; const newLoan = { isbn, studentName, studentClass, borrowerType, loanDate: new Date(loanDate), returnDate: new Date(returnDate) }; mockLoans.push(newLoan); res.status(201).json(newLoan); } else { const studentNameRegex = new RegExp(`^${studentName.trim()}$`, 'i'); const existingLoansCount = await Loan.countDocuments({ studentName: studentNameRegex }); const maxLoans = borrowerType === 'teacher' ? 10 : MAX_LOANS_PER_STUDENT; if (existingLoansCount >= maxLoans) { return res.status(400).json({ message: `Cet ${borrowerType === 'teacher' ? 'enseignant' : 'élève'} a déjà atteint la limite de ${maxLoans} prêts.` }); } const book = await Book.findOne({ isbn: isbn }); if (!book) return res.status(404).json({ message: "Livre non trouvé" }); if (book.loanedCopies >= book.totalCopies) return res.status(400).json({ message: "Toutes les copies de ce livre sont déjà prêtées." }); book.loanedCopies++; await book.save(); const newLoan = await Loan.create({ isbn, studentName, studentClass, borrowerType, loanDate, returnDate }); res.status(201).json(newLoan); } } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.delete('/api/loans', async (req, res) => { try { const { isbn, studentName } = req.body; if (devMode) { const loanIndex = mockLoans.findIndex(loan => loan.isbn === isbn && loan.studentName === studentName); if (loanIndex === -1) return res.status(404).json({ message: "Prêt non trouvé" }); const loan = mockLoans[loanIndex]; mockLoans.splice(loanIndex, 1); const book = mockBooks.find(b => b.isbn === isbn); if (book) { book.loanedCopies = Math.max(0, book.loanedCopies - 1); mockHistory.push({ isbn: book.isbn, bookTitle: book.title, studentName: loan.studentName, studentClass: loan.studentClass, borrowerType: loan.borrowerType || 'student', loanDate: loan.loanDate, actualReturnDate: new Date() }); } res.status(204).send(); } else { const loan = await Loan.findOneAndDelete({ isbn, studentName }); if (!loan) return res.status(404).json({ message: "Prêt non trouvé" }); const book = await Book.findOne({ isbn: isbn }); if (book) { book.loanedCopies = Math.max(0, book.loanedCopies - 1); await book.save(); await History.create({ isbn: book.isbn, bookTitle: book.title, studentName: loan.studentName, studentClass: loan.studentClass, borrowerType: loan.borrowerType || 'student', loanDate: loan.loanDate, actualReturnDate: new Date() }); } res.status(204).send(); } } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.get('/api/history/book/:isbn', async (req, res) => { try { if (devMode) { const history = mockHistory.filter(h => h.isbn === req.params.isbn).sort((a, b) => new Date(b.actualReturnDate) - new Date(a.actualReturnDate)); res.json(history); } else { const history = await History.find({ isbn: req.params.isbn }).sort({ actualReturnDate: -1 }); res.json(history); } } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.get('/api/history/student/:studentName', async (req, res) => { try { if (devMode) { const searchName = req.params.studentName.toLowerCase(); const history = mockHistory.filter(h => h.studentName.toLowerCase().includes(searchName)).sort((a, b) => new Date(b.actualReturnDate) - new Date(a.actualReturnDate)); res.json(history); } else { const history = await History.find({ studentName: { $regex: new RegExp(req.params.studentName, 'i') } }).sort({ actualReturnDate: -1 }); res.json(history); } } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

module.exports = app;
