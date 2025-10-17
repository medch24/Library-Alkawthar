const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS
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

// MongoDB connection - URI fournie par l'utilisateur
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cherifmed2030_db_user:Alkawthar01@library.ve29w9g.mongodb.net/?retryWrites=true&w=majority&appName=Library';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connecté avec succès');
    console.log('📊 Base de données: Library');
    
    // Initialiser des données de test si la base est vide
    await initializeSampleData();
  })
  .catch(err => {
    console.error("❌ Erreur de connexion MongoDB:", err);
    process.exit(1);
  });

// Schémas MongoDB - Utilisation d'ID au lieu d'ISBN comme identifiant principal
const BookSchema = new mongoose.Schema({
    isbn: { type: String, required: true },
    title: { type: String, required: true },
    totalCopies: { type: Number, default: 1 },
    loanedCopies: { type: Number, default: 0 },
    availableCopies: { type: Number, default: 1 },
    subject: String,
    level: String,
    language: String,
    cornerName: String,
    cornerNumber: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index pour recherche rapide
BookSchema.index({ isbn: 1 });
BookSchema.index({ title: 'text', subject: 'text' });

const LoanSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    isbn: { type: String, required: true },
    studentName: { type: String, required: true },
    studentClass: String,
    borrowerType: { type: String, enum: ['student', 'teacher'], default: 'student' },
    loanDate: { type: Date, default: Date.now },
    returnDate: { type: Date, required: true },
    copiesCount: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
});

// Index pour recherche rapide
LoanSchema.index({ bookId: 1, studentName: 1 });
LoanSchema.index({ isbn: 1 });
LoanSchema.index({ borrowerType: 1 });

const HistorySchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    isbn: String,
    studentName: String,
    studentClass: String,
    borrowerType: String,
    loanDate: Date,
    returnDate: Date,
    actualReturnDate: { type: Date, default: Date.now },
    copiesCount: { type: Number, default: 1 }
});

const Book = mongoose.model('Book', BookSchema);
const Loan = mongoose.model('Loan', LoanSchema);
const History = mongoose.model('History', HistorySchema);

// Fonction pour initialiser des données de test si la base est vide
async function initializeSampleData() {
    try {
        const bookCount = await Book.countDocuments();
        console.log(`📚 Nombre de livres dans MongoDB: ${bookCount}`);
        
        if (bookCount === 0) {
            console.log('🔄 Initialisation de données de test dans MongoDB...');
            
            const sampleBooks = [
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
                },
                {
                    isbn: '978-2-8104-1234-5',
                    title: 'Les Mathématiques CE2',
                    totalCopies: 10,
                    loanedCopies: 0,
                    availableCopies: 10,
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
                    loanedCopies: 0,
                    availableCopies: 8,
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
                    loanedCopies: 0,
                    availableCopies: 15,
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
                    loanedCopies: 0,
                    availableCopies: 6,
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
                    loanedCopies: 0,
                    availableCopies: 3,
                    subject: 'Physics',
                    level: 'Teacher Reference',
                    language: 'English',
                    cornerName: 'Teachers Corner',
                    cornerNumber: 'T-01'
                },
                {
                    isbn: '978-0-1234-5678-9',
                    title: 'الرياضيات للصف الرابع',
                    totalCopies: 12,
                    loanedCopies: 0,
                    availableCopies: 12,
                    subject: 'رياضيات',
                    level: 'الصف الرابع',
                    language: 'عربي',
                    cornerName: 'ركن الرياضيات',
                    cornerNumber: 'ر-02'
                },
                {
                    isbn: '978-2-3456-7890-1',
                    title: 'Géographie CM2',
                    totalCopies: 7,
                    loanedCopies: 0,
                    availableCopies: 7,
                    subject: 'Géographie',
                    level: 'CM2',
                    language: 'Français',
                    cornerName: 'Coin Géographie',
                    cornerNumber: 'G-01'
                }
            ];
            
            const insertedBooks = await Book.insertMany(sampleBooks);
            console.log(`✅ ${insertedBooks.length} livres initialisés dans MongoDB`);
            
            return insertedBooks;
        } else {
            console.log('✅ La base de données contient déjà des livres');
            return null;
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des données:', error);
        return null;
    }
}

// --- ROUTES API ---

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
    res.send(`
        <h2>📚 Al-Kawthar Library API</h2>
        <p>✅ Le serveur fonctionne correctement.</p>
        <p>Utilisez <a href="/api">/api</a> pour accéder aux données.</p>
    `);
});

app.get('/api', (req, res) => {
    res.json({
        message: 'API Bibliothèque Al-Kawthar - Fonctionnelle',
        mode: 'Production MongoDB',
        timestamp: new Date(),
        database: 'Connected'
    });
});

// Route pour obtenir les statistiques
app.get('/api/statistics', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// Route pour obtenir les prêts d'étudiants
app.get('/api/loans/students', async (req, res) => {
    try {
        const loans = await Loan.find({ borrowerType: 'student' }).lean();
        // Enrichir avec les titres des livres
        const enrichedLoans = await Promise.all(loans.map(async (loan) => {
            const book = await Book.findById(loan.bookId);
            return {
                ...loan,
                title: book ? book.title : 'Livre non trouvé'
            };
        }));
        res.json(enrichedLoans);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// Route pour obtenir les prêts d'enseignants
app.get('/api/loans/teachers', async (req, res) => {
    try {
        const loans = await Loan.find({ borrowerType: 'teacher' }).lean();
        // Enrichir avec les titres des livres
        const enrichedLoans = await Promise.all(loans.map(async (loan) => {
            const book = await Book.findById(loan.bookId);
            return {
                ...loan,
                title: book ? book.title : 'Livre non trouvé'
            };
        }));
        res.json(enrichedLoans);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// Route pour obtenir la liste des livres avec pagination et recherche
app.get('/api/books', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

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
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// Route pour obtenir un livre spécifique par ID
app.get('/api/books/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Chercher par ID MongoDB si c'est un ObjectId valide
        let book;
        if (mongoose.Types.ObjectId.isValid(id)) {
            book = await Book.findById(id);
        }
        
        // Sinon, chercher par ISBN
        if (!book) {
            book = await Book.findOne({ isbn: id });
        }
        
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: 'Livre non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// Route pour obtenir tous les prêts
app.get('/api/loans', async (req, res) => {
    try {
        const loans = await Loan.find().lean();
        const enrichedLoans = await Promise.all(loans.map(async (loan) => {
            const book = await Book.findById(loan.bookId);
            return {
                ...loan,
                title: book ? book.title : 'Livre non trouvé'
            };
        }));
        res.json(enrichedLoans);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// Route pour ajouter un livre manuellement
app.post('/api/books', async (req, res) => {
    try {
        const bookData = {
            isbn: req.body.isbn,
            title: req.body.title,
            totalCopies: parseInt(req.body.totalCopies) || 1,
            loanedCopies: 0,
            availableCopies: parseInt(req.body.totalCopies) || 1,
            subject: req.body.subject || '',
            level: req.body.level || '',
            language: req.body.language || '',
            cornerName: req.body.cornerName || '',
            cornerNumber: req.body.cornerNumber || ''
        };

        const newBook = new Book(bookData);
        await newBook.save();
        
        res.status(201).json({ 
            message: 'Livre ajouté avec succès', 
            book: newBook 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de l'ajout du livre", 
            error: error.message 
        });
    }
});

// Route pour uploader un fichier Excel
app.post('/api/books/upload', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        let addedCount = 0;
        const errors = [];

        for (const row of data) {
            try {
                const bookData = {
                    isbn: row.ISBN || row.isbn || '',
                    title: row.Title || row.title || row['Titre'] || '',
                    totalCopies: parseInt(row.TotalCopies || row['Total Copies'] || row['Nombre de copies'] || 1),
                    loanedCopies: 0,
                    availableCopies: parseInt(row.TotalCopies || row['Total Copies'] || row['Nombre de copies'] || 1),
                    subject: row.Subject || row.subject || row['Matière'] || '',
                    level: row.Level || row.level || row['Niveau'] || '',
                    language: row.Language || row.language || row['Langue'] || '',
                    cornerName: row.CornerName || row['Corner Name'] || row['Nom du coin'] || '',
                    cornerNumber: row.CornerNumber || row['Corner Number'] || row['Numéro du coin'] || ''
                };

                if (bookData.isbn && bookData.title) {
                    const newBook = new Book(bookData);
                    await newBook.save();
                    addedCount++;
                }
            } catch (err) {
                errors.push({ row: row, error: err.message });
            }
        }

        res.json({ 
            message: 'Import terminé', 
            addedCount, 
            errors: errors.length > 0 ? errors : undefined 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de l'import", 
            error: error.message 
        });
    }
});

// Route pour créer un prêt
app.post('/api/loans', async (req, res) => {
    try {
        const { bookId, studentName, studentClass, borrowerType, loanDate, returnDate, copiesCount } = req.body;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        const copies = copiesCount || 1;
        if (book.availableCopies < copies) {
            return res.status(400).json({ 
                message: `Pas assez de copies disponibles. Disponibles: ${book.availableCopies}` 
            });
        }

        const loanData = {
            bookId: book._id,
            isbn: book.isbn,
            studentName,
            studentClass,
            borrowerType: borrowerType || 'student',
            loanDate: loanDate || new Date(),
            returnDate,
            copiesCount: copies
        };

        const newLoan = new Loan(loanData);
        await newLoan.save();

        // Mettre à jour les copies disponibles
        book.loanedCopies += copies;
        book.availableCopies -= copies;
        book.updatedAt = new Date();
        await book.save();

        res.status(201).json({ 
            message: 'Prêt créé avec succès', 
            loan: newLoan 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de la création du prêt", 
            error: error.message 
        });
    }
});

// Route pour retourner un livre
app.delete('/api/loans', async (req, res) => {
    try {
        const { isbn, studentName } = req.body;

        const loan = await Loan.findOne({ isbn, studentName });
        if (!loan) {
            return res.status(404).json({ message: 'Prêt non trouvé' });
        }

        const book = await Book.findById(loan.bookId);
        if (book) {
            book.loanedCopies = Math.max(0, book.loanedCopies - (loan.copiesCount || 1));
            book.availableCopies = book.totalCopies - book.loanedCopies;
            book.updatedAt = new Date();
            await book.save();
        }

        // Archiver dans l'historique
        const historyEntry = new History({
            bookId: loan.bookId,
            isbn: loan.isbn,
            studentName: loan.studentName,
            studentClass: loan.studentClass,
            borrowerType: loan.borrowerType,
            loanDate: loan.loanDate,
            returnDate: loan.returnDate,
            actualReturnDate: new Date(),
            copiesCount: loan.copiesCount
        });
        await historyEntry.save();

        await Loan.deleteOne({ _id: loan._id });

        res.json({ message: 'Livre retourné avec succès' });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors du retour", 
            error: error.message 
        });
    }
});

// Route pour étendre la date de retour
app.put('/api/loans/extend', async (req, res) => {
    try {
        const { isbn, studentName, newReturnDate } = req.body;

        const loan = await Loan.findOne({ isbn, studentName });
        if (!loan) {
            return res.status(404).json({ message: 'Prêt non trouvé' });
        }

        loan.returnDate = new Date(newReturnDate);
        await loan.save();

        res.json({ 
            message: 'Date de retour mise à jour avec succès', 
            loan 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de l'extension", 
            error: error.message 
        });
    }
});

// Route pour modifier un livre
app.put('/api/books/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = { ...req.body, updatedAt: new Date() };

        let book;
        if (mongoose.Types.ObjectId.isValid(id)) {
            book = await Book.findByIdAndUpdate(id, updateData, { new: true });
        }
        
        if (!book) {
            book = await Book.findOneAndUpdate({ isbn: id }, updateData, { new: true });
        }

        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        // Recalculer les copies disponibles si totalCopies a changé
        if (updateData.totalCopies !== undefined) {
            book.availableCopies = book.totalCopies - book.loanedCopies;
            await book.save();
        }

        res.json({ 
            message: 'Livre mis à jour avec succès', 
            book 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour", 
            error: error.message 
        });
    }
});

// Route pour supprimer un livre
app.delete('/api/books/:id', async (req, res) => {
    try {
        const id = req.params.id;

        let book;
        if (mongoose.Types.ObjectId.isValid(id)) {
            book = await Book.findById(id);
        }
        
        if (!book) {
            book = await Book.findOne({ isbn: id });
        }

        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        // Vérifier s'il y a des prêts actifs
        if (book.loanedCopies > 0) {
            return res.status(400).json({ 
                message: `Impossible de supprimer: ${book.loanedCopies} copies sont actuellement prêtées` 
            });
        }

        await Book.deleteOne({ _id: book._id });

        res.json({ message: 'Livre supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de la suppression", 
            error: error.message 
        });
    }
});

// Route pour obtenir l'historique d'un livre
app.get('/api/history/book/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        let history;
        if (mongoose.Types.ObjectId.isValid(id)) {
            history = await History.find({ bookId: id }).sort({ actualReturnDate: -1 });
        } else {
            history = await History.find({ isbn: id }).sort({ actualReturnDate: -1 });
        }

        res.json(history);
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de la récupération de l'historique", 
            error: error.message 
        });
    }
});

// Route pour exporter en Excel
app.get('/api/export/excel', async (req, res) => {
    try {
        const books = await Book.find().lean();
        const loans = await Loan.find().lean();

        // Créer un workbook
        const wb = xlsx.utils.book_new();

        // Feuille des livres
        const booksSheet = xlsx.utils.json_to_sheet(books.map(book => ({
            ISBN: book.isbn,
            Titre: book.title,
            'Total Copies': book.totalCopies,
            'Copies Prêtées': book.loanedCopies,
            'Copies Disponibles': book.availableCopies,
            Matière: book.subject,
            Niveau: book.level,
            Langue: book.language,
            'Nom du Coin': book.cornerName,
            'Numéro du Coin': book.cornerNumber
        })));
        xlsx.utils.book_append_sheet(wb, booksSheet, 'Livres');

        // Feuille des prêts
        const loansSheet = xlsx.utils.json_to_sheet(loans.map(loan => ({
            ISBN: loan.isbn,
            'Nom Emprunteur': loan.studentName,
            'Classe/Matière': loan.studentClass,
            Type: loan.borrowerType,
            'Date Prêt': loan.loanDate.toLocaleDateString(),
            'Date Retour': loan.returnDate.toLocaleDateString(),
            'Nombre Copies': loan.copiesCount
        })));
        xlsx.utils.book_append_sheet(wb, loansSheet, 'Prêts');

        // Générer le buffer
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=library_data.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de l'export", 
            error: error.message 
        });
    }
});

// Export pour Vercel
module.exports = app;

// Si tu veux tester en local
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`✅ Serveur local sur http://localhost:${PORT}`);
    });
}
