const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// --- Connexion à MongoDB ---
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connecté avec succès"))
  .catch(err => console.error("Erreur de connexion MongoDB:", err));

// --- Schémas Mongoose ---
const BookSchema = new mongoose.Schema({
    isbn: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    totalCopies: { type: Number, required: true, min: 1, default: 1 },
    loanedCopies: { type: Number, default: 0 },
    subject: String,
    level: String,
    language: String,
    cornerName: String,
    cornerNumber: String,
});

const LoanSchema = new mongoose.Schema({
    isbn: { type: String, required: true },
    studentName: { type: String, required: true },
    loanDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
});

const HistorySchema = new mongoose.Schema({
    isbn: { type: String, required: true },
    bookTitle: { type: String, required: true },
    studentName: { type: String, required: true },
    loanDate: { type: Date, required: true },
    actualReturnDate: { type: Date, default: Date.now },
});

const Book = mongoose.model('Book', BookSchema);
const Loan = mongoose.model('Loan', LoanSchema);
const History = mongoose.model('History', HistorySchema);

// --- ROUTES API ---

// ... (Les autres routes GET, POST, PUT, DELETE pour les livres et les prêts restent identiques) ...
// GET: Récupérer tous les livres
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find({});
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// POST: Ajouter/Mettre à jour un livre (manuel)
app.post('/api/books', async (req, res) => {
    try {
        const { isbn, title, totalCopies, ...rest } = req.body;
        const updatedBook = await Book.findOneAndUpdate(
            { isbn: isbn },
            { $inc: { totalCopies: totalCopies || 1 }, $setOnInsert: { isbn, title, ...rest } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(201).json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});
// PUT: Mettre à jour un livre
app.put('/api/books/:originalIsbn', async (req, res) => {
    try {
        const { originalIsbn } = req.params;
        const updatedBook = await Book.findOneAndUpdate({ isbn: originalIsbn }, req.body, { new: true });
        if (!updatedBook) return res.status(404).json({ message: "Livre non trouvé" });
        res.json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// DELETE: Supprimer un livre
app.delete('/api/books/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const result = await Book.deleteOne({ isbn: isbn });
        if (result.deletedCount === 0) return res.status(404).json({ message: "Livre non trouvé" });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});


// GET: Récupérer tous les prêts
app.get('/api/loans', async (req, res) => {
    try {
        const loans = await Loan.find({});
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});


// POST: Créer un prêt
app.post('/api/loans', async (req, res) => {
    try {
        const { isbn, studentName, loanDate, returnDate } = req.body;
        const book = await Book.findOne({ isbn: isbn });
        if (!book) return res.status(404).json({ message: "Livre non trouvé" });
        if (book.loanedCopies >= book.totalCopies) return res.status(400).json({ message: "Toutes les copies sont déjà prêtées" });

        book.loanedCopies++;
        await book.save();
        const newLoan = await Loan.create({ isbn, studentName, loanDate, returnDate });
        res.status(201).json(newLoan);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// DELETE: Retourner un livre (supprimer le prêt)
app.delete('/api/loans', async (req, res) => {
    try {
        const { isbn, studentName } = req.body;
        const loan = await Loan.findOneAndDelete({ isbn, studentName });
        if (!loan) return res.status(404).json({ message: "Prêt non trouvé" });

        const book = await Book.findOne({ isbn: isbn });
        if (book) {
            book.loanedCopies = Math.max(0, book.loanedCopies - 1);
            await book.save();
            await History.create({
                isbn: book.isbn,
                bookTitle: book.title,
                studentName: loan.studentName,
                loanDate: loan.loanDate,
                actualReturnDate: new Date()
            });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// GET: Historique d'un livre
app.get('/api/history/book/:isbn', async (req, res) => {
    try {
        const history = await History.find({ isbn: req.params.isbn }).sort({ actualReturnDate: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

// GET: Historique d'un élève
app.get('/api/history/student/:studentName', async (req, res) => {
    try {
        const history = await History.find({ studentName: { $regex: new RegExp(req.params.studentName, 'i') } }).sort({ actualReturnDate: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});


// NOUVELLE ROUTE D'UPLOAD AMÉLIORÉE
app.post('/api/books/upload', upload.single('excelFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier uploadé.' });
    }
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(worksheet);

        const processedIsbnsInFile = new Set();
        const newBooksPayload = [];

        // 1. Filtrer les doublons du fichier Excel lui-même
        for (const row of json) {
            const isbn = row['ISBN'] ? String(row['ISBN']).trim() : null;
            if (!isbn || !row['Title'] || processedIsbnsInFile.has(isbn)) {
                continue;
            }
            processedIsbnsInFile.add(isbn);
            newBooksPayload.push({
                title: row['Title'],
                isbn: isbn,
                totalCopies: parseInt(row['QTY'], 10) || 1,
                subject: row['Subject'] || '',
                level: row['level'] || '',
                language: row['language'] || '',
                cornerName: row['Corner name'] || 'Non classé',
                cornerNumber: row['Corner number'] ? String(row['Corner number']) : '0',
                loanedCopies: 0
            });
        }

        // 2. Vérifier en une seule fois quels ISBN existent déjà dans la base de données
        const existingIsbnsInDb = new Set(
            (await Book.find({ isbn: { $in: Array.from(processedIsbnsInFile) } }, 'isbn').lean())
            .map(b => b.isbn)
        );

        // 3. Ne garder que les livres qui ne sont pas déjà dans la base de données
        const booksToInsert = newBooksPayload.filter(book => !existingIsbnsInDb.has(book.isbn));

        const addedCount = booksToInsert.length;
        const ignoredCount = json.length - addedCount;

        // 4. Insérer en masse les nouveaux livres
        if (booksToInsert.length > 0) {
            await Book.insertMany(booksToInsert, { ordered: false });
        }

        res.json({ message: "Importation terminée!", addedCount, ignoredCount });

    } catch (error) {
        console.error("Error processing Excel file:", error);
        res.status(500).json({ message: "Erreur lors du traitement du fichier Excel. Vérifiez le format.", error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

module.exports = app;
