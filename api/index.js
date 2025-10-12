const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const port = process.env.PORT || 3001;

// --- CONFIGURATION ---
const MAX_LOANS_PER_STUDENT = 3;

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
const BookSchema = new mongoose.Schema({ isbn: { type: String, required: true, unique: true, trim: true }, title: { type: String, required: true }, totalCopies: { type: Number, required: true, min: 1, default: 1 }, loanedCopies: { type: Number, default: 0 }, subject: String, level: String, language: String, cornerName: String, cornerNumber: String });
const LoanSchema = new mongoose.Schema({ isbn: { type: String, required: true }, studentName: { type: String, required: true }, studentClass: { type: String, required: true }, borrowerType: { type: String, enum: ['student', 'teacher'], default: 'student' }, loanDate: { type: Date, required: true }, returnDate: { type: Date, required: true } });
const HistorySchema = new mongoose.Schema({ isbn: { type: String, required: true }, bookTitle: { type: String, required: true }, studentName: { type: String, required: true }, studentClass: { type: String }, borrowerType: { type: String, enum: ['student', 'teacher'], default: 'student' }, loanDate: { type: Date, required: true }, actualReturnDate: { type: Date, default: Date.now } });

const Book = mongoose.model('Book', BookSchema);
const Loan = mongoose.model('Loan', LoanSchema);
const History = mongoose.model('History', HistorySchema);

// --- NOUVELLES ROUTES ---
app.get('/api/loans/students', async (req, res) => {
    try {
        const studentLoans = await Loan.find({ borrowerType: 'student' });
        res.json(studentLoans);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

app.get('/api/loans/teachers', async (req, res) => {
    try {
        const teacherLoans = await Loan.find({ borrowerType: 'teacher' });
        res.json(teacherLoans);
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

// Renvoie TOUS les livres de la base de données
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find({});
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
});

app.post('/api/books', async (req, res) => { try { const { isbn, title, totalCopies, ...rest } = req.body; const updatedBook = await Book.findOneAndUpdate({ isbn: isbn }, { $inc: { totalCopies: totalCopies || 1 }, $setOnInsert: { isbn, title, ...rest } }, { new: true, upsert: true, setDefaultsOnInsert: true }); res.status(201).json(updatedBook); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.post('/api/books/upload', upload.single('excelFile'), async (req, res) => { if (!req.file) { return res.status(400).json({ message: 'Aucun fichier uploadé.' }); } try { const workbook = xlsx.read(req.file.buffer, { type: 'buffer' }); const sheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[sheetName]; const json = xlsx.utils.sheet_to_json(worksheet); const booksToProcess = []; const duplicateCounter = new Map(); for (const row of json) { const isbn = row['ISBN'] ? String(row['ISBN']).trim() : null; const title = row['Title'] ? row['Title'].trim() : null; if (!isbn || !title) continue; let finalTitle = title; let finalIsbn = isbn; const existingWithSameIsbn = await Book.findOne({ isbn: isbn }); const existingWithSameTitle = await Book.findOne({ title: title }); if (existingWithSameIsbn || existingWithSameTitle) { const key = `${isbn}_${title}`; const count = duplicateCounter.get(key) || 1; duplicateCounter.set(key, count + 1); finalTitle = `${title} (${count + 1})`; finalIsbn = `${isbn}-(${count + 1})`; } booksToProcess.push({ title: finalTitle, isbn: finalIsbn, totalCopies: parseInt(row['QTY'], 10) || 1, subject: row['Subject'] || '', level: row['level'] || '', language: row['language'] || '', cornerName: row['Corner name'] || 'Non classé', cornerNumber: row['Corner number'] ? String(row['Corner number']) : '0', loanedCopies: 0 }); } if (booksToProcess.length > 0) { await Book.insertMany(booksToProcess, { ordered: false }); } res.json({ message: "Importation terminée!", addedCount: booksToProcess.length, ignoredCount: json.length - booksToProcess.length }); } catch (error) { res.status(500).json({ message: "Erreur lors du traitement du fichier Excel.", error: error.message }); } });
app.put('/api/books/:originalIsbn', async (req, res) => { try { const { originalIsbn } = req.params; const updatedBook = await Book.findOneAndUpdate({ isbn: originalIsbn }, req.body, { new: true }); if (!updatedBook) return res.status(404).json({ message: "Livre non trouvé" }); res.json(updatedBook); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.delete('/api/books/:isbn', async (req, res) => { try { const { isbn } = req.params; const result = await Book.deleteOne({ isbn: isbn }); if (result.deletedCount === 0) return res.status(404).json({ message: "Livre non trouvé" }); res.status(204).send(); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.get('/api/loans', async (req, res) => { try { const loans = await Loan.find({}); res.json(loans); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.post('/api/loans', async (req, res) => { try { const { isbn, studentName, studentClass, borrowerType = 'student', loanDate, returnDate } = req.body; const studentNameRegex = new RegExp(`^${studentName.trim()}$`, 'i'); const existingLoansCount = await Loan.countDocuments({ studentName: studentNameRegex }); const maxLoans = borrowerType === 'teacher' ? 10 : MAX_LOANS_PER_STUDENT; if (existingLoansCount >= maxLoans) { return res.status(400).json({ message: `Cet ${borrowerType === 'teacher' ? 'enseignant' : 'élève'} a déjà atteint la limite de ${maxLoans} prêts.` }); } const book = await Book.findOne({ isbn: isbn }); if (!book) return res.status(404).json({ message: "Livre non trouvé" }); if (book.loanedCopies >= book.totalCopies) return res.status(400).json({ message: "Toutes les copies de ce livre sont déjà prêtées." }); book.loanedCopies++; await book.save(); const newLoan = await Loan.create({ isbn, studentName, studentClass, borrowerType, loanDate, returnDate }); res.status(201).json(newLoan); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.delete('/api/loans', async (req, res) => { try { const { isbn, studentName } = req.body; const loan = await Loan.findOneAndDelete({ isbn, studentName }); if (!loan) return res.status(404).json({ message: "Prêt non trouvé" }); const book = await Book.findOne({ isbn: isbn }); if (book) { book.loanedCopies = Math.max(0, book.loanedCopies - 1); await book.save(); await History.create({ isbn: book.isbn, bookTitle: book.title, studentName: loan.studentName, studentClass: loan.studentClass, borrowerType: loan.borrowerType || 'student', loanDate: loan.loanDate, actualReturnDate: new Date() }); } res.status(204).send(); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.get('/api/history/book/:isbn', async (req, res) => { try { const history = await History.find({ isbn: req.params.isbn }).sort({ actualReturnDate: -1 }); res.json(history); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });
app.get('/api/history/student/:studentName', async (req, res) => { try { const history = await History.find({ studentName: { $regex: new RegExp(req.params.studentName, 'i') } }).sort({ actualReturnDate: -1 }); res.json(history); } catch (error) { res.status(500).json({ message: "Erreur serveur", error }); } });

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

module.exports = app;
