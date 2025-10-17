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

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cherifmed2030_db_user:Alkawthar01@library.ve29w9g.mongodb.net/?retryWrites=true&w=majority&appName=Library';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connecté avec succès');
    console.log('📊 Base de données: Library');
  })
  .catch(err => {
    console.error("❌ Erreur de connexion MongoDB:", err);
    process.exit(1);
  });

// Schémas MongoDB
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

// --- ROUTES API ---

app.get('/', (req, res) => {
    res.send(`<h2>📚 Al-Kawthar Library API</h2><p>✅ Le serveur fonctionne correctement.</p><p>Utilisez <a href="/api">/api</a> pour accéder aux données.</p>`);
});

app.get('/api', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        const dbStatusText = {0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting'}[dbStatus] || 'Unknown';
        let booksCount = 0;
        if (dbStatus === 1) {
            try {
                booksCount = await Book.countDocuments();
            } catch (e) {
                console.error('Erreur comptage livres:', e.message);
            }
        }
        
        res.json({
            message: 'API Bibliothèque Al-Kawthar - Fonctionnelle',
            mode: 'Production MongoDB',
            timestamp: new Date(),
            database: { status: dbStatusText, connected: dbStatus === 1, booksCount },
            environment: { hasMongoUri: !!process.env.MONGODB_URI, nodeEnv: process.env.NODE_ENV || 'development' }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur API', error: error.message });
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const totalCopiesResult = await Book.aggregate([{ $group: { _id: null, total: { $sum: '$totalCopies' } } }]);
        const loanedCopiesResult = await Book.aggregate([{ $group: { _id: null, total: { $sum: '$loanedCopies' } } }]);
        const activeLoans = await Loan.countDocuments();

        const totalCopies = totalCopiesResult[0]?.total || 0;
        const loanedCopies = loanedCopiesResult[0]?.total || 0;

        res.json({
            totalBooks,
            totalCopies,
            loanedCopies,
            availableCopies: totalCopies - loanedCopies,
            activeLoans
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// --- ROUTES POUR LES LIVRES (Books) ---

app.get('/api/books', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: "Base de données non connectée" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            query = { $or: [{ title: searchRegex }, { isbn: searchRegex }, { subject: searchRegex }, { level: searchRegex }] };
        }

        const totalBooks = await Book.countDocuments(query);
        const totalPages = Math.ceil(totalBooks / limit);
        const books = await Book.find(query).sort({ title: 1 }).skip(skip).limit(limit).lean();

        res.json({ books, totalBooks, totalPages, currentPage: page });
    } catch (error) {
        console.error('❌ Erreur /api/books:', error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let book = mongoose.Types.ObjectId.isValid(id) ? await Book.findById(id) : await Book.findOne({ isbn: id });
        
        if (book) res.json(book);
        else res.status(404).json({ message: 'Livre non trouvé' });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

app.post('/api/books', async (req, res) => {
    try {
        const { isbn, title, totalCopies, subject, level, language, cornerName, cornerNumber } = req.body;
        const copies = parseInt(totalCopies) || 1;
        
        const newBook = new Book({
            isbn, title, subject, level, language, cornerName, cornerNumber,
            totalCopies: copies,
            availableCopies: copies,
            loanedCopies: 0
        });

        await newBook.save();
        res.status(201).json({ message: 'Livre ajouté avec succès', book: newBook });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du livre", error: error.message });
    }
});

app.put('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date() };

        const book = await Book.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

        // Recalculer les copies disponibles si totalCopies a changé
        if (updateData.totalCopies !== undefined) {
            book.availableCopies = book.totalCopies - book.loanedCopies;
            await book.save();
        }

        res.json({ message: 'Livre mis à jour avec succès', book });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let book = await Book.findById(id);

        if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

        if (book.loanedCopies > 0) {
            return res.status(400).json({ message: `Impossible de supprimer: ${book.loanedCopies} copies sont actuellement prêtées` });
        }

        await Book.deleteOne({ _id: book._id });
        res.json({ message: 'Livre supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
});

// --- ROUTES POUR LES PRÊTS (Loans) ---

// Fonction utilitaire pour obtenir les prêts avec les titres des livres
const getEnrichedLoans = async (filter = {}) => {
    const loans = await Loan.find(filter).lean();
    const bookIds = loans.map(loan => loan.bookId);
    const books = await Book.find({ _id: { $in: bookIds } }).select('title').lean();
    const bookTitleMap = books.reduce((map, book) => {
        map[book._id.toString()] = book.title;
        return map;
    }, {});
    return loans.map(loan => ({
        ...loan,
        title: bookTitleMap[loan.bookId.toString()] || 'Livre non trouvé'
    }));
};

app.get('/api/loans', (req, res) => getEnrichedLoans({}).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message })));
app.get('/api/loans/students', (req, res) => getEnrichedLoans({ borrowerType: 'student' }).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message })));
app.get('/api/loans/teachers', (req, res) => getEnrichedLoans({ borrowerType: 'teacher' }).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message })));

app.post('/api/loans', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { bookId, studentName, studentClass, borrowerType, returnDate, copiesCount } = req.body;
        const copies = parseInt(copiesCount) || 1;

        const book = await Book.findById(bookId).session(session);
        if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
        if (book.availableCopies < copies) return res.status(400).json({ message: `Pas assez de copies disponibles. Disponibles: ${book.availableCopies}` });

        const newLoan = new Loan({ bookId, isbn: book.isbn, studentName, studentClass, borrowerType, returnDate, copiesCount: copies });
        await newLoan.save({ session });

        book.loanedCopies += copies;
        book.availableCopies -= copies;
        await book.save({ session });
        
        await session.commitTransaction();
        res.status(201).json({ message: 'Prêt créé avec succès', loan: newLoan });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: "Erreur lors de la création du prêt", error: error.message });
    } finally {
        session.endSession();
    }
});

app.delete('/api/loans', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { isbn, studentName } = req.body;
        const loan = await Loan.findOne({ isbn, studentName }).session(session);
        if (!loan) return res.status(404).json({ message: 'Prêt non trouvé' });

        const book = await Book.findById(loan.bookId).session(session);
        if (book) {
            const copies = loan.copiesCount || 1;
            book.loanedCopies = Math.max(0, book.loanedCopies - copies);
            book.availableCopies = book.totalCopies - book.loanedCopies;
            await book.save({ session });
        }

        const historyEntry = new History({ ...loan.toObject(), _id: undefined, __v: undefined, actualReturnDate: new Date() });
        await historyEntry.save({ session });
        await Loan.deleteOne({ _id: loan._id }).session(session);

        await session.commitTransaction();
        res.json({ message: 'Livre retourné avec succès' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: "Erreur lors du retour", error: error.message });
    } finally {
        session.endSession();
    }
});

app.put('/api/loans/extend', async (req, res) => {
    try {
        const { isbn, studentName, newReturnDate } = req.body;
        if (!newReturnDate) {
            return res.status(400).json({ message: "La nouvelle date de retour est requise." });
        }

        const loan = await Loan.findOneAndUpdate(
            { isbn, studentName },
            { returnDate: new Date(newReturnDate) },
            { new: true }
        );

        if (!loan) return res.status(404).json({ message: 'Prêt non trouvé' });

        res.json({ message: 'Date de retour mise à jour avec succès', loan });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'extension", error: error.message });
    }
});


// --- ROUTES D'IMPORT / EXPORT ---

app.post('/api/books/upload', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        let addedCount = 0;
        const errors = [];
        const booksToInsert = [];

        for (const row of data) {
            const totalCopies = parseInt(row.TotalCopies || row['Total Copies'] || row['Nombre de copies'] || 1);
            if (isNaN(totalCopies)) continue; // Ignorer les lignes invalides

            const bookData = {
                isbn: String(row.ISBN || row.isbn || ''),
                title: String(row.Title || row.title || row['Titre'] || ''),
                totalCopies: totalCopies,
                loanedCopies: 0,
                availableCopies: totalCopies,
                subject: String(row.Subject || row.subject || row['Matière'] || ''),
                level: String(row.Level || row.level || row['Niveau'] || ''),
                language: String(row.Language || row.language || row['Langue'] || ''),
                cornerName: String(row.CornerName || row['Corner Name'] || row['Nom du coin'] || ''),
                cornerNumber: String(row.CornerNumber || row['Corner Number'] || row['Numéro du coin'] || '')
            };

            if (bookData.isbn && bookData.title) {
                booksToInsert.push(bookData);
            }
        }

        if (booksToInsert.length > 0) {
            const result = await Book.insertMany(booksToInsert, { ordered: false }).catch(err => {
                // Gérer les erreurs de doublons, etc.
                addedCount = err.result.nInserted;
                errors.push(...err.writeErrors.map(e => ({ row: booksToInsert[e.index], error: e.errmsg })));
            });
            if (result) addedCount = result.length;
        }

        res.json({ message: 'Import terminé', addedCount, errors: errors.length > 0 ? errors : undefined });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'import", error: error.message });
    }
});


app.get('/api/export/excel', async (req, res) => {
    try {
        const books = await Book.find().lean();
        const loans = await getEnrichedLoans(); // Utiliser notre fonction pour avoir les titres

        const wb = xlsx.utils.book_new();

        const booksSheet = xlsx.utils.json_to_sheet(books.map(book => ({
            'ISBN': book.isbn,
            'Titre': book.title,
            'Total Copies': book.totalCopies,
            'Copies Prêtées': book.loanedCopies,
            'Copies Disponibles': book.availableCopies,
            'Matière': book.subject,
            'Niveau': book.level,
            'Langue': book.language,
            'Nom du Coin': book.cornerName,
            'Numéro du Coin': book.cornerNumber
        })));
        xlsx.utils.book_append_sheet(wb, booksSheet, 'Livres');

        const loansSheet = xlsx.utils.json_to_sheet(loans.map(loan => ({
            'ISBN': loan.isbn,
            'Titre du Livre': loan.title,
            'Nom Emprunteur': loan.studentName,
            'Classe/Matière': loan.studentClass,
            'Type': loan.borrowerType,
            'Date Prêt': new Date(loan.loanDate).toLocaleDateString('fr-CA'),
            'Date Retour': new Date(loan.returnDate).toLocaleDateString('fr-CA'),
            'Nombre Copies': loan.copiesCount
        })));
        xlsx.utils.book_append_sheet(wb, loansSheet, 'Prêts');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=library_data.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'export", error: error.message });
    }
});


// --- ROUTE POUR L'HISTORIQUE ---

app.get('/api/history/book/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let query = mongoose.Types.ObjectId.isValid(id) ? { bookId: id } : { isbn: id };
        
        const history = await History.find(query).sort({ actualReturnDate: -1 }).lean();
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'historique", error: error.message });
    }
});


// Export pour Vercel
module.exports = app;

// Démarrer le serveur pour les tests locaux
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`✅ Serveur local démarré sur http://localhost:${PORT}`);
    });
}
