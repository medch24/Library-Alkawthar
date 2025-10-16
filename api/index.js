const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

let devMode = false;
let mockBooks = [];
let mockLoans = [];
let mockHistory = [];

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.static(path.join(__dirname, '..', 'public')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alkawthar-library';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`MongoDB connecté avec succès sur ${MONGODB_URI}`))
    .catch(err => {
        console.error("Erreur de connexion MongoDB:", err);
        console.log("Mode développement activé.");
        devMode = true;
    });

// --- Schémas Mongoose ---
const BookSchema = new mongoose.Schema({
    isbn: { type: String, required: true, trim: true },
    title: { type: String, required: true },
    totalCopies: { type: Number, required: true, min: 0, default: 1 },
    loanedCopies: { type: Number, default: 0 },
    subject: String,
    level: String,
    language: String,
    cornerName: String,
    cornerNumber: String
});

const LoanSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    isbn: { type: String, required: true },
    studentName: { type: String, required: true },
    studentClass: { type: String, required: true },
    borrowerType: { type: String, enum: ['student', 'teacher'], default: 'student' },
    loanDate: { type: Date, required: true },
    returnDate: { type: Date, required: true }
});

const HistorySchema = new mongoose.Schema({
    isbn: { type: String, required: true },
    bookTitle: { type: String, required: true },
    studentName: { type: String, required: true },
    loanDate: { type: Date, required: true },
    actualReturnDate: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', BookSchema);
const Loan = mongoose.model('Loan', LoanSchema);
const History = mongoose.model('History', HistorySchema);

// --- ROUTES API ---

// Statistiques
app.get('/api/statistics', async (req, res) => {
    try {
        const totalBooksResult = await Book.aggregate([{ $group: { _id: null, total: { $sum: "$totalCopies" } } }]);
        const loanedBooksResult = await Book.aggregate([{ $group: { _id: null, total: { $sum: "$loanedCopies" } } }]);
        
        const totalCopies = totalBooksResult[0]?.total || 0;
        const loanedCopies = loanedBooksResult[0]?.total || 0;
        const bookCount = await Book.countDocuments();
        const activeLoans = await Loan.countDocuments();

        res.json({
            totalCopies,
            loanedCopies,
            availableCopies: totalCopies - loanedCopies,
            totalBooks: bookCount,
            activeLoans
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du calcul des statistiques', error: error.message });
    }
});

// Livres (avec pagination et recherche)
app.get('/api/books', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = search ? {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const books = await Book.find(query).skip(skip).limit(limit).lean();
        const totalCount = await Book.countDocuments(query);
        
        res.json({
            books,
            pagination: {
                current: page,
                pages: Math.ceil(totalCount / limit),
                total: totalCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de la récupération des livres", error: error.message });
    }
});

// Ajout d'un livre
app.post('/api/books', async (req, res) => {
    try {
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de l'ajout du livre", error: error.message });
    }
});

// NOUVEL ENDPOINT: Mise à jour en masse (batch)
app.post('/api/books/batch-update', async (req, res) => {
    const { updates } = req.body; // updates est un tableau de [{ id, field, value }]
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ message: 'Format de mise à jour invalide.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const operations = updates.map(update => {
            const updateQuery = { $set: {} };
            updateQuery.$set[update.field] = update.value;
            return Book.updateOne({ _id: update.id }, updateQuery, { session });
        });

        await Promise.all(operations);

        await session.commitTransaction();
        res.status(200).json({ message: 'Mises à jour effectuées avec succès !' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Erreur lors de la mise à jour en masse.', error: error.message });
    } finally {
        session.endSession();
    }
});


// Suppression d'un livre
app.delete('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Livre non trouvé" });
        if (book.loanedCopies > 0) return res.status(400).json({ message: "Impossible de supprimer un livre prêté." });

        await Book.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
});

// Prêts
app.get('/api/loans/:type', async (req, res) => {
    const borrowerType = req.params.type === 'students' ? 'student' : 'teacher';
    try {
        const loans = await Loan.find({ borrowerType }).populate('bookId', 'title').lean();
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

app.post('/api/loans', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { bookId, studentName, borrowerType } = req.body;

        const book = await Book.findById(bookId).session(session);
        if (!book) throw new Error("Livre non trouvé.");
        if (book.loanedCopies >= book.totalCopies) throw new Error("Pas de copies disponibles.");

        book.loanedCopies += 1;
        await book.save({ session });

        const newLoan = new Loan({ ...req.body, isbn: book.isbn });
        await newLoan.save({ session });

        await session.commitTransaction();
        res.status(201).json(newLoan);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
});

app.post('/api/loans/return', async (req, res) => {
    const { loanId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const loan = await Loan.findById(loanId).session(session);
        if (!loan) throw new Error("Prêt non trouvé.");

        const book = await Book.findById(loan.bookId).session(session);
        if (book) {
            book.loanedCopies = Math.max(0, book.loanedCopies - 1);
            await book.save({ session });
        }
        
        await History.create([{
            isbn: loan.isbn,
            bookTitle: book ? book.title : 'Titre Inconnu',
            studentName: loan.studentName,
            loanDate: loan.loanDate,
            actualReturnDate: new Date()
        }], { session });

        await Loan.findByIdAndDelete(loanId, { session });

        await session.commitTransaction();
        res.status(200).json({ message: 'Livre retourné avec succès.' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
});

// Prolonger la date de retour
app.put('/api/loans/extend', async (req, res) => {
    try {
        const { loanId, newReturnDate } = req.body;
        if (!loanId || !newReturnDate) {
            return res.status(400).json({ message: "ID du prêt et nouvelle date requis." });
        }
        
        const updatedLoan = await Loan.findByIdAndUpdate(loanId, { returnDate: newReturnDate }, { new: true });

        if (!updatedLoan) {
            return res.status(404).json({ message: "Prêt non trouvé." });
        }
        
        res.json({ message: "Date de retour mise à jour.", loan: updatedLoan });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});


// Historique
app.get('/api/history/book/:isbn', async (req, res) => {
    try {
        const history = await History.find({ isbn: req.params.isbn }).sort({ actualReturnDate: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});


// Export Excel
app.get('/api/export/excel', async (req, res) => {
    try {
        const books = await Book.find({}).lean();
        const loans = await Loan.find({}).populate('bookId', 'title').lean();
        const history = await History.find({}).lean();
        
        const workbook = xlsx.utils.book_new();
        
        const booksSheet = xlsx.utils.json_to_sheet(books.map(b => ({
            ISBN: b.isbn, Titre: b.title, 'Copies Totales': b.totalCopies, 'Copies Prêtées': b.loanedCopies,
            'Copies Disponibles': b.totalCopies - b.loanedCopies, Matière: b.subject, Niveau: b.level
        })));
        xlsx.utils.book_append_sheet(workbook, booksSheet, 'Inventaire Livres');
        
        const loansSheet = xlsx.utils.json_to_sheet(loans.map(l => ({
            'Nom Emprunteur': l.studentName, 'Classe/Matière': l.studentClass, 'Titre du Livre': l.bookId?.title || 'N/A',
            'Date de Prêt': new Date(l.loanDate).toLocaleDateString('fr-FR'), 'Date de Retour': new Date(l.returnDate).toLocaleDateString('fr-FR')
        })));
        xlsx.utils.book_append_sheet(workbook, loansSheet, 'Prêts Actuels');
        
        const historySheet = xlsx.utils.json_to_sheet(history.map(h => ({
            'Nom Emprunteur': h.studentName, 'Titre du Livre': h.bookTitle, 'Date de Prêt': new Date(h.loanDate).toLocaleDateString('fr-FR'),
            'Date de Retour Effectif': new Date(h.actualReturnDate).toLocaleDateString('fr-FR')
        })));
        xlsx.utils.book_append_sheet(workbook, historySheet, 'Historique des Prêts');
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', `attachment; filename="bibliotheque_alkawthar_${new Date().toISOString().split('T')[0]}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'export Excel", error: error.message });
    }
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

module.exports = app;
