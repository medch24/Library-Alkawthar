const API_BASE_URL = '';
let allBooks = [];
let allLoans = [];
let currentLoanType = 'students';
let currentLanguage = 'ar';
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let pendingChanges = [];
let barcodeStream = null;
let barcodeScanner = null;

// Fonction pour formater les dates selon la langue courante
function formatDateByLanguage(date, language = currentLanguage) {
    const d = new Date(date);
    switch (language) {
        case 'ar':
            return d.toLocaleDateString('fr-FR'); // Utilise les chiffres français même en arabe
        case 'fr':
            return d.toLocaleDateString('fr-FR');
        case 'en':
            return d.toLocaleDateString('en-US');
        default:
            return d.toLocaleDateString('fr-FR');
    }
}

// Fonction pour obtenir le texte traduit
function getTranslatedText(key) {
    return translations[currentLanguage] && translations[currentLanguage][key] || key;
}

// Dictionnaire des traductions
const translations = {
    ar: {
        school_name: 'مدارس الكوثر العالمية',
        logout: 'تسجيل الخروج',
        library_stats: 'إحصائيات المكتبة',
        total_books: 'إجمالي الكتب',
        loaned_books: 'الكتب المعارة',
        available_books: 'الكتب المتاحة',
        copies_loaned: 'عدد النسخ المعارة',
        inventory_search: 'البحث في المخزون وإدارة الكتب',
        search_placeholder: 'ابحث بالعنوان أو ISBN أو المادة...',
        refresh: 'تحديث',
        scan_barcode: 'مسح الباركود',
        save_all_changes: 'حفظ جميع التغييرات',
        books_loaned_list: 'قائمة الكتب المعارة',
        search_in_loans: 'ابحث في الإعارات...',
        student_borrowers_list: 'قائمة الطلاب المستعيرين',
        teacher_borrowers_list: 'قائمة المدرسين المستعيرين',
        extend_return_date: 'تمديد فترة الارجاع',
        new_return_date: 'تاريخ الإرجاع الجديد',
        extend_loan: 'تمديد الإعارة',
        current_return_date: 'تاريخ الإرجاع الحالي',
        return_book: 'إرجاع',
        book_returned_success: 'تم إرجاع الكتاب بنجاح!',
        return_error: 'خطأ في إرجاع الكتاب',
        cannot_delete_loaned: 'لا يمكن حذف هذا الكتاب!',
        copies_currently_loaned: 'نسخة معارة حالياً',
        must_return_all_copies: 'يجب إرجاع جميع النسخ أولاً',
        borrower_name: 'اسم المستعير',
        class_section: 'الصف/القسم',
        loan_type: 'النوع',
        loan_date_col: 'تاريخ الإعارة',
        return_date_col: 'تاريخ الإرجاع',
        loading_data: 'تحميل البيانات...',
        isbn: 'ISBN',
        title: 'العنوان',
        total_copies: 'إجمالي النسخ',
        loaned_copies: 'النسخ المعارة',
        available_copies: 'النسخ المتاحة',
        subject: 'المادة',
        level: 'المستوى',
        language: 'اللغة',
        corner_name: 'اسم الركن',
        corner_number: 'رقم الركن',
        actions: 'الإجراءات',
        teacher_name: 'اسم المدرس',
        student_name: 'اسم الطالب',
        book_title: 'عنوان الكتاب',
        copies_count: 'عدد النسخ',
        overdue_days: 'أيام التأخير',
        book_not_found: 'كتاب غير موجود',
        loading_books: 'جاري تحميل الكتب...',
        loading_loans: 'جاري تحميل الإعارات...',
        loading_stats: 'جاري حساب الإحصائيات...',
        data_loaded: 'تم تحميل البيانات بنجاح!',
        loan_management: 'إدارة الإعارة',
        add_book_manually: 'إضافة كتاب يدوياً',
        upload_excel: 'رفع ملف Excel للكتب',
        overdue_books_title: 'كتب متأخرة في الإرجاع',
        dismiss: 'إخفاء التنبيه',
        borrower_type: 'نوع المستعير',
        student: 'طالب',
        teacher: 'مدرس/ة',
        view_student_borrowers: 'عرض الطلاب المستعيرين',
        view_teacher_borrowers: 'عرض المدرسين المستعيرين',
        export_excel_data: 'تحميل بيانات Excel'
    },
    fr: {
        school_name: 'Écoles Internationales Al-Kawthar',
        logout: 'Se déconnecter',
        library_stats: 'Statistiques de la bibliothèque',
        total_books: 'Total des livres',
        loaned_books: 'Livres prêtés',
        available_books: 'Livres disponibles',
        copies_loaned: 'Nombre de copies prêtées',
        inventory_search: 'Recherche et gestion de l\'inventaire',
        search_placeholder: 'Rechercher par titre, ISBN ou matière...',
        refresh: 'Actualiser',
        scan_barcode: 'Scanner code-barres',
        save_all_changes: 'Sauvegarder tous les changements',
        books_loaned_list: 'Liste des livres prêtés',
        search_in_loans: 'Rechercher dans les prêts...',
        student_borrowers_list: 'Liste des étudiants emprunteurs',
        teacher_borrowers_list: 'Liste des enseignants emprunteurs',
        extend_return_date: 'Prolonger la date de retour',
        new_return_date: 'Nouvelle date de retour',
        extend_loan: 'Prolonger le prêt',
        current_return_date: 'Date de retour actuelle',
        return_book: 'Retourner',
        book_returned_success: 'Livre retourné avec succès!',
        return_error: 'Erreur lors du retour',
        cannot_delete_loaned: 'Impossible de supprimer ce livre!',
        copies_currently_loaned: 'copies actuellement prêtées',
        must_return_all_copies: 'Toutes les copies doivent être retournées d\'abord',
        borrower_name: 'Nom de l\'emprunteur',
        class_section: 'Classe/Section',
        loan_type: 'Type',
        loan_date_col: 'Date de prêt',
        return_date_col: 'Date de retour',
        loading_data: 'Chargement des données...',
        isbn: 'ISBN',
        title: 'Titre',
        total_copies: 'Copies totales',
        loaned_copies: 'Copies prêtées',
        available_copies: 'Copies disponibles',
        subject: 'Matière',
        level: 'Niveau',
        language: 'Langue',
        corner_name: 'Nom du coin',
        corner_number: 'Numéro du coin',
        actions: 'Actions',
        teacher_name: 'Nom de l\'enseignant',
        student_name: 'Nom de l\'étudiant',
        book_title: 'Titre du livre',
        copies_count: 'Nombre de copies',
        overdue_days: 'Jours de retard',
        book_not_found: 'Livre introuvable',
        loading_books: 'Chargement des livres...',
        loading_loans: 'Chargement des prêts...',
        loading_stats: 'Calcul des statistiques...',
        data_loaded: 'Données chargées avec succès!',
        loan_management: 'Gestion des prêts',
        add_book_manually: 'Ajouter un livre manuellement',
        upload_excel: 'Télécharger fichier Excel',
        overdue_books_title: 'Livres en retard',
        dismiss: 'Masquer l\'alerte',
        borrower_type: 'Type d\'emprunteur',
        student: 'Étudiant',
        teacher: 'Enseignant',
        view_student_borrowers: 'Voir les étudiants emprunteurs',
        view_teacher_borrowers: 'Voir les enseignants emprunteurs',
        export_excel_data: 'Télécharger données Excel'
    },
    en: {
        school_name: 'Al-Kawthar International Schools',
        logout: 'Logout',
        library_stats: 'Library Statistics',
        total_books: 'Total Books',
        loaned_books: 'Loaned Books',
        available_books: 'Available Books',
        copies_loaned: 'Copies Loaned',
        inventory_search: 'Inventory Search & Management',
        search_placeholder: 'Search by title, ISBN or subject...',
        refresh: 'Refresh',
        scan_barcode: 'Scan Barcode',
        save_all_changes: 'Save All Changes',
        books_loaned_list: 'Loaned Books List',
        search_in_loans: 'Search in loans...',
        student_borrowers_list: 'Student Borrowers List',
        teacher_borrowers_list: 'Teacher Borrowers List',
        extend_return_date: 'Extend Return Date',
        new_return_date: 'New Return Date',
        extend_loan: 'Extend Loan',
        current_return_date: 'Current Return Date',
        return_book: 'Return',
        book_returned_success: 'Book returned successfully!',
        return_error: 'Error returning book',
        cannot_delete_loaned: 'Cannot delete this book!',
        copies_currently_loaned: 'copies currently on loan',
        must_return_all_copies: 'All copies must be returned first',
        borrower_name: 'Borrower Name',
        class_section: 'Class/Section',
        loan_type: 'Type',
        loan_date_col: 'Loan Date',
        return_date_col: 'Return Date',
        loading_data: 'Loading data...',
        isbn: 'ISBN',
        title: 'Title',
        total_copies: 'Total Copies',
        loaned_copies: 'Loaned Copies',
        available_copies: 'Available Copies',
        subject: 'Subject',
        level: 'Level',
        language: 'Language',
        corner_name: 'Corner Name',
        corner_number: 'Corner Number',
        actions: 'Actions',
        teacher_name: 'Teacher Name',
        student_name: 'Student Name',
        book_title: 'Book Title',
        copies_count: 'Number of Copies',
        overdue_days: 'Overdue Days',
        book_not_found: 'Book not found',
        loading_books: 'Loading books...',
        loading_loans: 'Loading loans...',
        loading_stats: 'Calculating statistics...',
        data_loaded: 'Data loaded successfully!',
        loan_management: 'Loan Management',
        add_book_manually: 'Add Book Manually',
        upload_excel: 'Upload Excel File',
        overdue_books_title: 'Overdue Books',
        dismiss: 'Dismiss Alert',
        borrower_type: 'Borrower Type',
        student: 'Student',
        teacher: 'Teacher',
        view_student_borrowers: 'View Student Borrowers',
        view_teacher_borrowers: 'View Teacher Borrowers',
        export_excel_data: 'Download Excel Data'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    const loginForm = document.getElementById('login-form');
    const loanForm = document.getElementById('loan-form');
    const searchInput = document.getElementById('search-input');
    const modalOverlay = document.getElementById('modal-overlay');
    const loansModal = document.getElementById('loans-modal');

    // FONCTIONS DE TRADUCTION ET BARRE DE PROGRESSION
    
    // Fonction pour changer la langue
    function changeLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('preferred_language', lang);
        
        // Changer la direction du document
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', lang);
        }
        
        // Mettre à jour tous les éléments traduits
        updateTranslations();
        
        // Mettre à jour les boutons de langue
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }
    
    // Fonction pour mettre à jour les traductions
    function updateTranslations() {
        const currentTranslations = translations[currentLanguage];
        if (!currentTranslations) {
            console.warn('No translations found for language:', currentLanguage);
            return;
        }
        
        // Mettre à jour les éléments avec data-key
        document.querySelectorAll('[data-key]').forEach(element => {
            if (!element) return;
            const key = element.getAttribute('data-key');
            if (key && currentTranslations[key]) {
                try {
                    element.textContent = currentTranslations[key];
                } catch (error) {
                    console.warn('Error updating text for element with key:', key, error);
                }
            }
        });
        
        // Mettre à jour les placeholders
        document.querySelectorAll('[data-key-placeholder]').forEach(element => {
            if (!element) return;
            const key = element.getAttribute('data-key-placeholder');
            if (key && currentTranslations[key]) {
                try {
                    element.placeholder = currentTranslations[key];
                } catch (error) {
                    console.warn('Error updating placeholder for element with key:', key, error);
                }
            }
        });
    }
    
    // Gestionnaires d'événements pour les boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            changeLanguage(btn.dataset.lang);
        });
    });
    
    // Charger la langue préférée après la définition des gestionnaires
    const savedLang = localStorage.getItem('preferred_language') || 'ar';
    // Attendre un peu pour s'assurer que le DOM est prêt
    setTimeout(() => {
        changeLanguage(savedLang);
    }, 100);
    
    // FONCTIONS DE BARRE DE PROGRESSION
    
    let loadingSteps = [];
    let currentStep = 0;
    
    function showLoadingBar(steps) {
        loadingSteps = steps;
        currentStep = 0;
        const loadingBar = document.getElementById('loading-bar');
        const progressFill = document.getElementById('progress-fill');
        
        if (loadingBar) loadingBar.style.display = 'block';
        if (loadingBar) loadingBar.classList.add('show');
        if (progressFill) progressFill.style.width = '0%';
        
        if (steps && steps.length > 0) {
            updateLoadingText(steps[0]);
        }
    }
    
    function updateProgress(stepIndex, stepText) {
        if (!loadingSteps || stepIndex >= loadingSteps.length) return;
        
        currentStep = stepIndex;
        const progressPercent = ((stepIndex + 1) / loadingSteps.length) * 100;
        const progressFill = document.getElementById('progress-fill');
        
        if (progressFill) {
            progressFill.style.width = progressPercent + '%';
        }
        
        if (stepText) {
            updateLoadingText(stepText);
        }
        
        // Si c'est la dernière étape, cacher la barre après un délai
        if (stepIndex === loadingSteps.length - 1) {
            setTimeout(() => {
                hideLoadingBar();
            }, 1000);
        }
    }
    
    function updateLoadingText(text) {
        const loadingTextSpan = document.getElementById('loading-text-span');
        if (loadingTextSpan) {
            // Utiliser la traduction si disponible
            const currentTranslations = translations[currentLanguage];
            const translatedText = currentTranslations[text] || text;
            loadingTextSpan.textContent = translatedText;
        }
    }
    
    function hideLoadingBar() {
        const loadingBar = document.getElementById('loading-bar');
        if (!loadingBar) return;
        
        loadingBar.classList.remove('show');
        loadingBar.classList.add('hide');
        
        setTimeout(() => {
            loadingBar.style.display = 'none';
            loadingBar.classList.remove('hide');
        }, 500);
    }

    // Connexion
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('username').value === 'Alkawthar@30' && 
            document.getElementById('password').value === 'Alkawthar@30') {
            localStorage.setItem('isLoggedIn', 'true');
            showDashboard();
        } else {
            document.getElementById('login-error').textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
        }
    });

    // Déconnexion
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        window.location.reload();
    });

    // Afficher le tableau de bord
    function showDashboard() {
        loginPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        loadAllData();
    }

    // Vérifier la session après définition de toutes les fonctions
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }

    // Charger les données avec pagination optimisée
    async function loadAllData(page = 1, search = '') {
        if (isLoading) return;
        isLoading = true;
        
        try {
            console.log('Démarrage du chargement des données...');
            // Afficher la barre de progression
            showLoadingBar(['loading_books', 'loading_loans', 'loading_stats', 'data_loaded']);
            
            // Étape 1: Charger les livres avec pagination
            updateProgress(0, 'loading_books');
            console.log('Chargement des livres depuis:', '/api/books');
            const booksUrl = `/api/books?page=${page}&limit=50&search=${encodeURIComponent(search)}`;
            const booksResponse = await fetch(booksUrl);
            if (!booksResponse.ok) {
                throw new Error(`HTTP Error: ${booksResponse.status} - ${booksResponse.statusText}`);
            }
            const booksData = await booksResponse.json();
            
            if (booksData.books) {
                // Format avec pagination
                allBooks = booksData.books;
                currentPage = booksData.pagination.current;
                totalPages = booksData.pagination.pages;
                updatePaginationControls();
            } else {
                // Format ancien (compatibilité)
                allBooks = Array.isArray(booksData) ? booksData : [];
            }
            console.log('Livres chargés:', allBooks.length);
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Étape 2: Charger les prêts (seulement si pas de recherche pour éviter de surcharger)
            updateProgress(1, 'loading_loans');
            if (!search) {
                console.log('Chargement des prêts depuis:', '/api/loans');
                const loansResponse = await fetch('/api/loans');
                if (loansResponse.ok) {
                    const loans = await loansResponse.json();
                    allLoans = Array.isArray(loans) ? loans : [];
                    console.log('Prêts chargés:', allLoans.length);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Étape 3: Calculer les statistiques
            updateProgress(2, 'loading_stats');
            await updateStatsFromAPI();
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Étape 4: Afficher les données
            console.log('Rendu du tableau...');
            renderTable(allBooks);
            updateProgress(3, 'data_loaded');
            
            // Vérifier et afficher les livres en retard (seulement si pas de recherche)
            if (!search) {
                checkOverdueBooks();
            }
            
            // Mettre à jour les traductions après le rendu
            setTimeout(() => {
                console.log('Mise à jour des traductions...');
                updateTranslations();
            }, 200);
            
            console.log('Données chargées avec succès:', allBooks.length, 'livres,', allLoans.length, 'prêts');
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            hideLoadingBar();
            
            // Message d'erreur plus informatif
            let errorMessage = 'خطأ في تحميل البيانات';
            if (error.message.includes('fetch')) {
                errorMessage += ' - مشكلة في الاتصال بالخادم';
            } else if (error.message.includes('HTTP Error')) {
                errorMessage += ' - خطأ في الخادم: ' + error.message;
            } else {
                errorMessage += ': ' + error.message;
            }
            
            alert(errorMessage);
        } finally {
            isLoading = false;
        }
    }

    // Mettre à jour les statistiques depuis l'API
    async function updateStatsFromAPI() {
        try {
            const response = await fetch('/api/statistics');
            if (response.ok) {
                const stats = await response.json();
                document.getElementById('total-books-stat').textContent = stats.totalCopies || 0;
                document.getElementById('loaned-books-stat').textContent = stats.loanedCopies || 0;
                document.getElementById('available-books-stat').textContent = stats.availableCopies || 0;
                document.getElementById('copies-loaned-stat').textContent = stats.loanedCopies || 0;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            // Fallback vers le calcul local
            updateStats();
        }
    }
    
    // Mettre à jour les statistiques (méthode locale de fallback)
    function updateStats() {
        const totalCopies = allBooks.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
        const loanedCopies = allBooks.reduce((sum, book) => sum + (book.loanedCopies || 0), 0);
        document.getElementById('total-books-stat').textContent = totalCopies;
        document.getElementById('loaned-books-stat').textContent = loanedCopies;
        document.getElementById('available-books-stat').textContent = totalCopies - loanedCopies;
        document.getElementById('copies-loaned-stat').textContent = loanedCopies;
    }
    
    // Contrôles de pagination
    function updatePaginationControls() {
        const paginationControls = document.getElementById('pagination-controls');
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');
        
        if (totalPages > 1) {
            paginationControls.style.display = 'flex';
            pageInfo.textContent = `الصفحة ${currentPage} من ${totalPages}`;
            prevBtn.disabled = currentPage <= 1;
            nextBtn.disabled = currentPage >= totalPages;
        } else {
            paginationControls.style.display = 'none';
        }
    }

    // Vérifier les livres en retard avec différents niveaux de criticité
    function checkOverdueBooks() {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time to compare dates only
        
        const overdueLoans = allLoans.filter(loan => {
            const returnDate = new Date(loan.returnDate);
            returnDate.setHours(0, 0, 0, 0);
            return returnDate < currentDate;
        });
        
        // Catégoriser par niveau de retard
        const criticalOverdue = overdueLoans.filter(loan => {
            const returnDate = new Date(loan.returnDate);
            const daysDiff = Math.floor((currentDate - returnDate) / (1000 * 60 * 60 * 24));
            return daysDiff >= 7; // 7 jours ou plus
        });
        
        const moderateOverdue = overdueLoans.filter(loan => {
            const returnDate = new Date(loan.returnDate);
            const daysDiff = Math.floor((currentDate - returnDate) / (1000 * 60 * 60 * 24));
            return daysDiff >= 3 && daysDiff < 7; // 3-6 jours
        });
        
        const recentOverdue = overdueLoans.filter(loan => {
            const returnDate = new Date(loan.returnDate);
            const daysDiff = Math.floor((currentDate - returnDate) / (1000 * 60 * 60 * 24));
            return daysDiff > 0 && daysDiff < 3; // 1-2 jours
        });
        
        const overdueNotifications = document.getElementById('overdue-notifications');
        const overdueList = document.getElementById('overdue-list');
        
        if (overdueLoans.length > 0) {
            let overdueHTML = '';
            
            // Section critique (7+ jours)
            if (criticalOverdue.length > 0) {
                overdueHTML += '<div class="overdue-section critical-overdue">';
                overdueHTML += `<h4><i class="fas fa-exclamation-triangle"></i> تأخير خطير (${criticalOverdue.length} كتاب)</h4>`;
                
                criticalOverdue.forEach(loan => {
                    const book = allBooks.find(b => b.isbn === loan.isbn);
                    const bookTitle = book ? book.title : 'عنوان غير محدد';
                    const daysOverdue = Math.floor((currentDate - new Date(loan.returnDate)) / (1000 * 60 * 60 * 24));
                    const borrowerTypeAr = loan.borrowerType === 'teacher' ? 'المدرس' : 'الطالب';
                    
                    overdueHTML += `
                        <div class="overdue-item critical">
                            <div class="overdue-info">
                                <strong>${loan.studentName}</strong> (${borrowerTypeAr})
                                <br>
                                <span class="book-title">${bookTitle}</span>
                                <br>
                                <span class="overdue-days critical">متأخر ${daysOverdue} يوم</span>
                                <span class="due-date">(الموعد المحدد: ${formatDateByLanguage(loan.returnDate)})</span>
                            </div>
                            <div class="overdue-actions">
                                <button class="btn-small btn-danger contact-borrower" data-name="${loan.studentName}" data-type="${loan.borrowerType}">
                                    <i class="fas fa-phone"></i> تواصل عاجل
                                </button>
                            </div>
                        </div>
                    `;
                });
                overdueHTML += '</div>';
            }
            
            // Section modérée (3-6 jours)
            if (moderateOverdue.length > 0) {
                overdueHTML += '<div class="overdue-section moderate-overdue">';
                overdueHTML += `<h4><i class="fas fa-clock"></i> تأخير متوسط (${moderateOverdue.length} كتاب)</h4>`;
                
                moderateOverdue.forEach(loan => {
                    const book = allBooks.find(b => b.isbn === loan.isbn);
                    const bookTitle = book ? book.title : 'عنوان غير محدد';
                    const daysOverdue = Math.floor((currentDate - new Date(loan.returnDate)) / (1000 * 60 * 60 * 24));
                    const borrowerTypeAr = loan.borrowerType === 'teacher' ? 'المدرس' : 'الطالب';
                    
                    overdueHTML += `
                        <div class="overdue-item moderate">
                            <div class="overdue-info">
                                <strong>${loan.studentName}</strong> (${borrowerTypeAr})
                                <br>
                                <span class="book-title">${bookTitle}</span>
                                <br>
                                <span class="overdue-days moderate">متأخر ${daysOverdue} يوم</span>
                                <span class="due-date">(الموعد المحدد: ${formatDateByLanguage(loan.returnDate)})</span>
                            </div>
                            <div class="overdue-actions">
                                <button class="btn-small btn-warning contact-borrower" data-name="${loan.studentName}" data-type="${loan.borrowerType}">
                                    <i class="fas fa-phone"></i> تذكير
                                </button>
                            </div>
                        </div>
                    `;
                });
                overdueHTML += '</div>';
            }
            
            // Section récente (1-2 jours)
            if (recentOverdue.length > 0) {
                overdueHTML += '<div class="overdue-section recent-overdue">';
                overdueHTML += `<h4><i class="fas fa-info-circle"></i> تأخير حديث (${recentOverdue.length} كتاب)</h4>`;
                
                recentOverdue.forEach(loan => {
                    const book = allBooks.find(b => b.isbn === loan.isbn);
                    const bookTitle = book ? book.title : 'عنوان غير محدد';
                    const daysOverdue = Math.floor((currentDate - new Date(loan.returnDate)) / (1000 * 60 * 60 * 24));
                    const borrowerTypeAr = loan.borrowerType === 'teacher' ? 'المدرس' : 'الطالب';
                    
                    overdueHTML += `
                        <div class="overdue-item recent">
                            <div class="overdue-info">
                                <strong>${loan.studentName}</strong> (${borrowerTypeAr})
                                <br>
                                <span class="book-title">${bookTitle}</span>
                                <br>
                                <span class="overdue-days recent">متأخر ${daysOverdue} يوم</span>
                                <span class="due-date">(الموعد المحدد: ${formatDateByLanguage(loan.returnDate)})</span>
                            </div>
                            <div class="overdue-actions">
                                <button class="btn-small btn-info contact-borrower" data-name="${loan.studentName}" data-type="${loan.borrowerType}">
                                    <i class="fas fa-phone"></i> تواصل
                                </button>
                            </div>
                        </div>
                    `;
                });
                overdueHTML += '</div>';
            }
            
            overdueList.innerHTML = overdueHTML;
            overdueNotifications.style.display = 'block';
            
            // Add event listeners for contact buttons
            document.querySelectorAll('.contact-borrower').forEach(btn => {
                btn.addEventListener('click', function() {
                    const name = this.dataset.name;
                    const type = this.dataset.type;
                    const typeAr = type === 'teacher' ? 'المدرس' : 'الطالب';
                    alert(`يرجى التواصل مع ${typeAr}: ${name}
لتذكيره بإرجاع الكتاب المتأخر.`);
                });
            });
        } else {
            overdueNotifications.style.display = 'none';
        }
    }
    
    // Add dismiss alert event listener after DOM is ready
    setTimeout(() => {
        const dismissButton = document.getElementById('dismiss-alert');
        if (dismissButton) {
            dismissButton.addEventListener('click', () => {
                document.getElementById('overdue-notifications').style.display = 'none';
            });
        }
    }, 1000);

    // Afficher le tableau des livres - VERSION COMPLÈTE AVEC ÉDITION
    function renderTable(bookList) {
        const tableBody = document.getElementById('books-table-body');
        if (!tableBody) {
            console.error('Element books-table-body not found');
            return;
        }
        
        if (!Array.isArray(bookList)) {
            console.warn('bookList is not an array:', bookList);
            bookList = [];
        }
        
        let tableHTML = '';
        bookList.forEach((book, index) => {
            if (!book || typeof book !== 'object') {
                console.warn('Invalid book object at index', index, ':', book);
                return;
            }
            
            const totalCopies = parseInt(book.totalCopies) || 0;
            const loanedCopies = parseInt(book.loanedCopies) || 0;
            const availableCopies = totalCopies - loanedCopies;
            const availabilityClass = availableCopies > 0 ? 'status-available' : 'status-unavailable';
            const availabilityText = `${availableCopies}`;
            
            // Escape HTML content to prevent XSS
            const escapeHtml = (text) => {
                const div = document.createElement('div');
                div.textContent = text || '';
                return div.innerHTML;
            };
            
            // Affichage amélioré avec gestion des copies multiples
            const loanedCopiesDisplay = loanedCopies > 0 ? 
                `<span class="loaned-copies-badge">${loanedCopies}</span>` : 
                `<span class="no-loans">0</span>`;
            
            tableHTML += `<tr data-isbn="${escapeHtml(book.isbn)}" class="book-row">
                <td class="editable-cell" data-field="isbn" data-original="${escapeHtml(book.isbn || '')}">${escapeHtml(book.isbn || '')}</td>
                <td class="editable-cell" data-field="title" data-original="${escapeHtml(book.title || '')}">${escapeHtml(book.title || '')}</td>
                <td class="editable-cell" data-field="totalCopies" data-original="${totalCopies}">${totalCopies}</td>
                <td class="loaned-copies-cell">${loanedCopiesDisplay}</td>
                <td class="${availabilityClass} availability-cell">${availabilityText}</td>
                <td class="editable-cell" data-field="subject" data-original="${escapeHtml(book.subject || 'Non classé')}">${escapeHtml(book.subject || 'Non classé')}</td>
                <td class="editable-cell" data-field="level" data-original="${escapeHtml(book.level || 'undefined')}">${escapeHtml(book.level || 'undefined')}</td>
                <td class="editable-cell" data-field="language" data-original="${escapeHtml(book.language || 'Non spécifié')}">${escapeHtml(book.language || 'Non spécifié')}</td>
                <td class="editable-cell" data-field="cornerName" data-original="${escapeHtml(book.cornerName || 'Non classé')}">${escapeHtml(book.cornerName || 'Non classé')}</td>
                <td class="editable-cell" data-field="cornerNumber" data-original="${escapeHtml(book.cornerNumber || '0')}">${escapeHtml(book.cornerNumber || '0')}</td>
                <td class="action-buttons">
                    <button class="btn-small btn-primary edit-book-btn" data-isbn="${escapeHtml(book.isbn || '')}" title="Modifier le livre">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small btn-danger delete-book-btn" data-isbn="${escapeHtml(book.isbn || '')}" title="Supprimer le livre">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-small btn-info history-book-btn" data-isbn="${escapeHtml(book.isbn || '')}" title="Voir l'historique">
                        <i class="fas fa-history"></i>
                    </button>
                </td>
            </tr>`;
        });
        
        tableBody.innerHTML = tableHTML;
        console.log('Table rendered with', bookList.length, 'books');
        
        // Ajouter les gestionnaires d'événements pour l'édition
        try {
            addTableEventListeners();
        } catch (error) {
            console.error('Error adding table event listeners:', error);
        }
        
        // Mettre à jour les traductions après le rendu du tableau
        setTimeout(() => {
            try {
                updateTranslations();
            } catch (error) {
                console.error('Error updating translations after table render:', error);
            }
        }, 100);
    }

    // Recherche optimisée avec debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value.toLowerCase();
        
        // Debounce pour éviter trop de requêtes
        searchTimeout = setTimeout(() => {
            currentPage = 1; // Reset à la première page lors d'une nouvelle recherche
            loadAllData(currentPage, searchTerm);
        }, 300);
    });
    
    // Gestionnaires de pagination
    document.getElementById('prev-page-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            const searchTerm = searchInput.value.toLowerCase();
            loadAllData(currentPage, searchTerm);
        }
    });
    
    document.getElementById('next-page-btn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            const searchTerm = searchInput.value.toLowerCase();
            loadAllData(currentPage, searchTerm);
        }
    });

    // Mise à jour du titre du livre et des copies disponibles lors de la saisie ISBN
    document.getElementById('loan-isbn').addEventListener('input', async (e) => {
        const isbn = e.target.value.trim();
        const bookTitleElement = document.getElementById('loan-book-title');
        const availableCopiesDisplay = document.getElementById('available-copies-display');
        const loanCopiesInput = document.getElementById('loan-copies');
        
        // Reset les champs d'abord
        bookTitleElement.textContent = '-';
        availableCopiesDisplay.textContent = '-';
        
        if (!isbn) return;
        
        // Chercher le livre dans les données locales d'abord
        let book = allBooks.find(b => b.isbn === isbn);
        
        // Si le livre n'est pas trouvé localement, faire une requête à l'API
        if (!book && isbn.length >= 10) { // ISBN minimum length
            try {
                console.log(`Recherche du livre ISBN: ${isbn} via API...`);
                const response = await fetch(`/api/books?search=${encodeURIComponent(isbn)}&limit=1`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.books && data.books.length > 0) {
                        book = data.books.find(b => b.isbn === isbn);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la recherche du livre:', error);
            }
        }
        
        if (book) {
            const availableCopies = (book.totalCopies || 0) - (book.loanedCopies || 0);
            bookTitleElement.textContent = book.title;
            bookTitleElement.style.color = 'var(--primary-color)';
            availableCopiesDisplay.textContent = availableCopies;
            loanCopiesInput.max = availableCopies;
            loanCopiesInput.value = Math.min(1, availableCopies);
            
            console.log(`Livre trouvé: ${book.title}, copies disponibles: ${availableCopies}`);
            
            if (availableCopies === 0) {
                loanCopiesInput.disabled = true;
                availableCopiesDisplay.style.color = 'red';
            } else {
                loanCopiesInput.disabled = false;
                availableCopiesDisplay.style.color = 'green';
            }
        } else if (isbn.length >= 10) {
            bookTitleElement.textContent = getTranslatedText('book_not_found');
            bookTitleElement.style.color = 'red';
        } else {
            bookTitleElement.textContent = '-';
            availableCopiesDisplay.textContent = '-';
            loanCopiesInput.max = '';
            loanCopiesInput.value = 1;
            loanCopiesInput.disabled = false;
            availableCopiesDisplay.style.color = '';
        }
    });

    // Gestion des prêts avec support pour multiples copies
    loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isbn = document.getElementById('loan-isbn').value.trim();
        const requestedCopies = parseInt(document.getElementById('loan-copies').value) || 1;
        const book = allBooks.find(b => b.isbn === isbn);
        
        if (!book) {
            const alertText = currentLanguage === 'ar' ? 'الكتاب غير موجود!' :
                            currentLanguage === 'fr' ? 'Livre introuvable!' : 'Book not found!';
            alert(alertText);
            return;
        }
        
        const availableCopies = (book.totalCopies || 0) - (book.loanedCopies || 0);
        if (requestedCopies > availableCopies) {
            alert(`عدد النسخ المطلوبة (${requestedCopies}) أكبر من المتاح (${availableCopies})!`);
            return;
        }
        
        const loanData = {
            isbn: isbn,
            title: book.title,
            subject: book.subject || 'Non classé',
            language: book.language || 'Non spécifié',
            studentName: document.getElementById('student-name').value,
            studentClass: document.getElementById('student-class').value,
            borrowerType: document.getElementById('borrower-type').value,
            loanDate: document.getElementById('loan-date').value,
            returnDate: document.getElementById('return-date').value,
            copiesCount: requestedCopies
        };
        
        try {
            await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loanData)
            });
            loanForm.reset();
            document.getElementById('loan-book-title').textContent = '-';
            document.getElementById('available-copies-display').textContent = '-';
            document.getElementById('loan-copies').value = 1;
            document.getElementById('loan-copies').disabled = false;
            document.getElementById('available-copies-display').style.color = '';
            alert(`تم إعارة ${requestedCopies} نسخة من الكتاب بنجاح!`);
            await loadAllData();
        } catch (error) {
            alert('خطأ في إعارة الكتاب');
        }
    });

    // Voir les prêts étudiants
    document.getElementById('view-student-loans-btn').addEventListener('click', () => {
        currentLoanType = 'students';
        displayLoans('students');
        openModal(loansModal);
    });

    // Voir les prêts enseignants
    document.getElementById('view-teacher-loans-btn').addEventListener('click', () => {
        currentLoanType = 'teachers';
        displayLoans('teachers');
        openModal(loansModal);
    });

    // Export Excel
    document.getElementById('export-excel-btn').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/export/excel');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `library_data_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            alert('تم تحميل ملف Excel بنجاح!');
        } catch (error) {
            alert('خطأ في تحميل ملف Excel');
        }
    });

    // Manual book addition
    document.getElementById('manual-book-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const bookData = {
            isbn: document.getElementById('manual-isbn').value,
            title: document.getElementById('manual-title').value,
            totalCopies: parseInt(document.getElementById('manual-copies').value),
            subject: document.getElementById('manual-subject').value || 'Non classé',
            level: document.getElementById('manual-level').value || 'undefined',
            language: document.getElementById('manual-language').value || 'Non spécifié',
            cornerName: document.getElementById('manual-corner-name').value || 'Non classé',
            cornerNumber: document.getElementById('manual-corner-number').value || '0',
            loanedCopies: 0
        };
        
        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            
            if (response.ok) {
                document.getElementById('manual-book-form').reset();
                alert('تم إضافة الكتاب بنجاح!');
                await loadAllData();
            } else {
                const error = await response.json();
                alert('خطأ في إضافة الكتاب: ' + (error.message || 'خطأ غير معروف'));
            }
        } catch (error) {
            alert('خطأ في إضافة الكتاب: ' + error.message);
        }
    });

    // Excel file upload
    document.getElementById('upload-excel-btn').addEventListener('click', async () => {
        const fileInput = document.getElementById('excel-file');
        const statusDiv = document.getElementById('upload-status');
        
        if (!fileInput.files[0]) {
            alert('يرجى اختيار ملف Excel أولاً');
            return;
        }
        
        const formData = new FormData();
        formData.append('excelFile', fileInput.files[0]);
        
        try {
            statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري رفع الملف...';
            
            const response = await fetch('/api/books/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                statusDiv.innerHTML = `<i class="fas fa-check-circle" style="color: green;"></i> تم رفع الملف بنجاح! تمت إضافة ${result.addedCount} كتاب`;
                fileInput.value = '';
                await loadAllData();
            } else {
                statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: red;"></i> خطأ: ${result.message}`;
            }
        } catch (error) {
            statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: red;"></i> خطأ في رفع الملف: ${error.message}`;
        }
    });

    // Afficher les prêts - Version corrigée avec FIX CRITIQUE pour 'غير موجود'
    async function displayLoans(loanType) {
        const loansModalContent = document.getElementById('loans-modal-content');
        const loansModalTitle = document.getElementById('loans-modal-title');
        
        try {
            let loans = [];
            if (loanType === 'students') {
                loans = await fetch('/api/loans/students').then(r => r.json());
                loansModalTitle.textContent = translations[currentLanguage].student_borrowers_list;
            } else {
                loans = await fetch('/api/loans/teachers').then(r => r.json());
                loansModalTitle.textContent = translations[currentLanguage].teacher_borrowers_list;
            }
            
            if (loans.length === 0) {
                const noResultsText = currentLanguage === 'ar' ? 'لا توجد نتائج مطابقة.' : 
                                    currentLanguage === 'fr' ? 'Aucun résultat correspondant.' : 'No matching results.';
                loansModalContent.innerHTML = `<p style="text-align: center; padding: 1rem;">${noResultsText}</p>`;
                return;
            }
            
            // Labels traduits selon le type et la langue
            const nameLabel = loanType === 'teachers' ? 
                getTranslatedText('teacher_name') : getTranslatedText('student_name');
            const classLabel = loanType === 'teachers' ? 
                getTranslatedText('subject') : getTranslatedText('class_section');
            
            // Direction et alignement selon la langue
            const isRtl = currentLanguage === 'ar';
            const direction = isRtl ? 'rtl' : 'ltr';
            const textAlign = isRtl ? 'right' : 'left';
            
            let tableHTML = `<table id="loans-table" style="width: 100%; text-align: ${textAlign}; direction: ${direction}; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: ${textAlign}; padding: 12px; background: var(--primary-color); color: white;">${nameLabel}</th>
                        <th style="text-align: ${textAlign}; padding: 12px; background: var(--primary-color); color: white;">${classLabel}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('isbn')}</th>
                        <th style="text-align: ${textAlign}; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('book_title')}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('copies_count')}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('loan_date_col')}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('return_date_col')}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('overdue_days')}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('actions')}</th>
                    </tr>
                </thead>
                <tbody>`;
            
            // CORRECTION CRITIQUE: Pour chaque prêt, récupérer les informations du livre avec système de priorités
            for (const loan of loans) {
                // PRIORITÉ 1: Utiliser le titre depuis le loan si disponible
                let bookTitle = loan.title || loan.bookTitle || null;
                
                // PRIORITÉ 2: Chercher dans allBooks localement
                if (!bookTitle) {
                    const book = allBooks.find(b => b.isbn === loan.isbn);
                    if (book && book.title) {
                        bookTitle = book.title;
                    }
                }
                
                // PRIORITÉ 3: Si toujours pas de titre ET qu'on a un ISBN, chercher via API
                if (!bookTitle && loan.isbn) {
                    try {
                        console.log(`Recherche du livre ISBN: ${loan.isbn} via API...`);
                        
                        // Recherche directe par ISBN d'abord (plus précise)
                        const directResponse = await fetch(`/api/books/${encodeURIComponent(loan.isbn)}`);
                        if (directResponse.ok) {
                            const directBook = await directResponse.json();
                            if (directBook && directBook.title) {
                                bookTitle = directBook.title;
                                // Ajouter à allBooks pour les prochaines utilisations
                                if (!allBooks.find(b => b.isbn === directBook.isbn)) {
                                    allBooks.push(directBook);
                                }
                            }
                        }
                        
                        // Si pas trouvé, essayer la recherche générale
                        if (!bookTitle) {
                            const searchResponse = await fetch(`/api/books?search=${encodeURIComponent(loan.isbn)}&limit=5`);
                            if (searchResponse.ok) {
                                const data = await searchResponse.json();
                                if (data.books && data.books.length > 0) {
                                    const foundBook = data.books.find(b => b.isbn === loan.isbn);
                                    if (foundBook && foundBook.title) {
                                        bookTitle = foundBook.title;
                                        if (!allBooks.find(b => b.isbn === foundBook.isbn)) {
                                            allBooks.push(foundBook);
                                        }
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Erreur lors de la recherche du livre:', error);
                    }
                }
                
                // PRIORITÉ 4: Fallback final
                if (!bookTitle) {
                    bookTitle = getTranslatedText('book_not_found');
                    console.warn(`Aucun titre trouvé pour ISBN: ${loan.isbn}`, loan);
                }
                
                const isbn = loan.isbn || '-';
                const copiesCount = loan.copiesCount || 1;
                
                // Calculer les jours de retard
                const currentDate = new Date();
                const returnDate = new Date(loan.returnDate);
                const daysOverdue = Math.floor((currentDate - returnDate) / (1000 * 60 * 60 * 24));
                
                let overdueClass = '';
                let overdueText = '';
                
                if (daysOverdue > 0) {
                    if (daysOverdue >= 7) {
                        overdueClass = 'critical';
                    } else if (daysOverdue >= 3) {
                        overdueClass = 'moderate';
                    } else {
                        overdueClass = 'recent';
                    }
                    
                    if (currentLanguage === 'ar') {
                        overdueText = `متأخر ${daysOverdue} يوم`;
                    } else if (currentLanguage === 'fr') {
                        overdueText = `${daysOverdue} jour${daysOverdue > 1 ? 's' : ''} de retard`;
                    } else {
                        overdueText = `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`;
                    }
                } else if (daysOverdue === 0) {
                    overdueClass = 'today';
                    if (currentLanguage === 'ar') {
                        overdueText = 'مطلوب اليوم';
                    } else if (currentLanguage === 'fr') {
                        overdueText = 'Dû aujourd\'hui';
                    } else {
                        overdueText = 'Due today';
                    }
                } else {
                    const daysLeft = Math.abs(daysOverdue);
                    overdueClass = 'future';
                    if (currentLanguage === 'ar') {
                        overdueText = `${daysLeft} يوم متبقي`;
                    } else if (currentLanguage === 'fr') {
                        overdueText = `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`;
                    } else {
                        overdueText = `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining`;
                    }
                }
                
                tableHTML += `<tr>
                    <td>${loan.studentName}</td>
                    <td>${loan.studentClass || '-'}</td>
                    <td style="text-align: center; font-family: monospace;">${isbn}</td>
                    <td>${bookTitle}</td>
                    <td style="text-align: center;"><span class="copies-badge">${copiesCount}</span></td>
                    <td style="text-align: center;">${formatDateByLanguage(loan.loanDate)}</td>
                    <td style="text-align: center;">${formatDateByLanguage(loan.returnDate)}</td>
                    <td style="text-align: center;"><span class="overdue-status ${overdueClass}">${overdueText}</span></td>
                    <td style="text-align: center;">
                        <button class="btn-action btn-return" data-isbn="${loan.isbn}" data-student="${loan.studentName}">
                            <i class="fas fa-undo"></i> <span data-key="return_book">${getTranslatedText('return_book')}</span>
                        </button>
                        <button class="btn-action btn-extend" data-isbn="${loan.isbn}" data-student="${loan.studentName}" data-current-date="${loan.returnDate}">
                            <i class="fas fa-calendar-plus"></i> ${currentLanguage === 'ar' ? 'تمديد' : currentLanguage === 'fr' ? 'Prolonger' : 'Extend'}
                        </button>
                    </td>
                </tr>`;
            }
            
            tableHTML += '</tbody></table>';
            loansModalContent.innerHTML = tableHTML;
            
            // Gestion des retours
            document.querySelectorAll('.btn-return').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const isbn = e.currentTarget.dataset.isbn;
                    const studentName = e.currentTarget.dataset.student;
                    await returnLoan(isbn, studentName);
                    displayLoans(currentLoanType);
                });
            });
            
            // Gestion de l'extension des dates de retour
            document.querySelectorAll('.btn-extend').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const isbn = e.currentTarget.dataset.isbn;
                    const studentName = e.currentTarget.dataset.student;
                    const currentDate = e.currentTarget.dataset.currentDate;
                    
                    // Trouver le livre et le prêt correspondants
                    const loan = loans.find(l => l.isbn === isbn && l.studentName === studentName);
                    const book = allBooks.find(b => b.isbn === isbn);
                    
                    if (loan && book) {
                        showExtendDateModal(loan, book);
                    }
                });
            });
        } catch (error) {
            loansModalContent.innerHTML = '<p style="text-align: center; padding: 1rem; color: red;">خطأ في تحميل البيانات.</p>';
        }
    }

    // Retourner un livre
    async function returnLoan(isbn, studentName) {
        try {
            await fetch('/api/loans', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isbn, studentName })
            });
            await loadAllData();
            alert(getTranslatedText('book_returned_success'));
        } catch (error) {
            alert(getTranslatedText('return_error'));
        }
    }

    // Gestion des modales
    function openModal(modalElement) {
        modalOverlay.style.display = 'flex';
        modalElement.style.display = 'flex';
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        loansModal.style.display = 'none';
    }

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => 
        btn.addEventListener('click', closeModal)
    );

    // NOUVELLES FONCTIONS POUR L'ÉDITION ET LA SUPPRESSION

    // Bouton de rafraîchissement des livres
    document.getElementById('refresh-books-btn').addEventListener('click', async () => {
        await loadAllData();
        alert('تم تحديث البيانات بنجاح!');
    });

    // Ajouter les gestionnaires d'événements pour le tableau
    function addTableEventListeners() {
        // Édition en double-cliquant sur une cellule
        document.querySelectorAll('.editable-cell').forEach(cell => {
            cell.addEventListener('dblclick', function() {
                editCell(this);
            });
        });

        // Boutons de modification
        document.querySelectorAll('.edit-book-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const isbn = this.dataset.isbn;
                editBookInModal(isbn);
            });
        });

        // Boutons de suppression
        document.querySelectorAll('.delete-book-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const isbn = this.dataset.isbn;
                deleteBook(isbn);
            });
        });

        // Boutons d'historique
        document.querySelectorAll('.history-book-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const isbn = this.dataset.isbn;
                showBookHistory(isbn);
            });
        });
    }

    // Fonction pour éditer une cellule
    function editCell(cell) {
        if (cell.classList.contains('editing')) return;
        
        const originalValue = cell.textContent.trim();
        const field = cell.dataset.field;
        const isbn = cell.parentElement.dataset.isbn;
        
        cell.classList.add('editing');
        cell.innerHTML = `<input type="text" value="${originalValue}" data-original="${originalValue}">`;
        
        const input = cell.querySelector('input');
        input.focus();
        input.select();
        
        // Sauvegarder en appuyant sur Entrée
        input.addEventListener('keydown', async function(e) {
            if (e.key === 'Enter') {
                await saveCell(cell, field, isbn, this.value);
            } else if (e.key === 'Escape') {
                cancelEdit(cell, originalValue);
            }
        });
        
        // Sauvegarder en perdant le focus
        input.addEventListener('blur', async function() {
            await saveCell(cell, field, isbn, this.value);
        });
    }

    // Sauvegarder les modifications d'une cellule
    async function saveCell(cell, field, isbn, newValue) {
        const originalValue = cell.querySelector('input').dataset.original;
        
        if (newValue === originalValue) {
            cancelEdit(cell, originalValue);
            return;
        }
        
        try {
            const updateData = {};
            updateData[field] = field === 'totalCopies' ? parseInt(newValue) || 1 : newValue;
            
            const response = await fetch(`/api/books/${isbn}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            if (response.ok) {
                cell.classList.remove('editing');
                cell.textContent = newValue;
                await loadAllData(); // Recharger pour mettre à jour les statistiques
                
                // Animation de succès
                cell.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    cell.style.backgroundColor = '';
                }, 1000);
            } else {
                throw new Error('Erreur de sauvegarde');
            }
        } catch (error) {
            alert('خطأ في حفظ التعديلات: ' + error.message);
            cancelEdit(cell, originalValue);
        }
    }

    // Annuler l'édition
    function cancelEdit(cell, originalValue) {
        cell.classList.remove('editing');
        cell.textContent = originalValue;
    }

    // Supprimer un livre
    async function deleteBook(isbn) {
        const book = allBooks.find(b => b.isbn === isbn);
        if (!book) return;
        
        const confirmMessage = `هل أنت متأكد من حذف الكتاب؟\n\nISBN: ${isbn}\nالعنوان: ${book.title}\n\nلا يمكن التراجع عن هذا الإجراء!`;
        
        if (!confirm(confirmMessage)) return;
        
        // Vérifier s'il y a des prêts actifs
        if (book.loanedCopies > 0) {
            alert(`${getTranslatedText('cannot_delete_loaned')}\n\n${book.loanedCopies} ${getTranslatedText('copies_currently_loaned')}.\n${getTranslatedText('must_return_all_copies')}.`);
            return;
        }
        
        try {
            const response = await fetch(`/api/books/${isbn}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('تم حذف الكتاب بنجاح!');
                await loadAllData();
            } else {
                throw new Error('فشل في حذف الكتاب');
            }
        } catch (error) {
            alert('خطأ في حذف الكتاب: ' + error.message);
        }
    }

    // Afficher l'historique d'un livre
    async function showBookHistory(isbn) {
        try {
            const response = await fetch(`/api/history/book/${isbn}`);
            const history = await response.json();
            
            const book = allBooks.find(b => b.isbn === isbn);
            const bookTitle = book ? book.title : 'كتاب غير معروف';
            
            let historyHTML = `<h3>تاريخ الكتاب: ${bookTitle}</h3>`;
            historyHTML += `<p><strong>ISBN:</strong> ${isbn}</p>`;
            
            if (history.length === 0) {
                historyHTML += '<p>لا يوجد تاريخ إعارة لهذا الكتاب.</p>';
            } else {
                historyHTML += '<div style="max-height: 400px; overflow-y: auto;"><table style="width: 100%; border-collapse: collapse;">';
                historyHTML += `<thead><tr style="background: #f0f0f0;"><th style="padding: 8px; border: 1px solid #ddd;">${getTranslatedText('borrower_name')}</th><th style="padding: 8px; border: 1px solid #ddd;">${getTranslatedText('class_section')}</th><th style="padding: 8px; border: 1px solid #ddd;">${getTranslatedText('loan_type')}</th><th style="padding: 8px; border: 1px solid #ddd;">${getTranslatedText('loan_date_col')}</th><th style="padding: 8px; border: 1px solid #ddd;">${getTranslatedText('return_date_col')}</th></tr></thead><tbody>`;
                
                history.forEach(h => {
                    historyHTML += `<tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${h.studentName}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${h.studentClass || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${h.borrowerType === 'teacher' ? 'مدرس' : 'طالب'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatDateByLanguage(h.loanDate)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatDateByLanguage(h.actualReturnDate)}</td>
                    </tr>`;
                });
                
                historyHTML += '</tbody></table></div>';
            }
            
            document.getElementById('loans-modal-content').innerHTML = historyHTML;
            openModal(loansModal);
        } catch (error) {
            alert('خطأ في تحميل تاريخ الكتاب: ' + error.message);
        }
    }
    
    // ===== NOUVELLES FONCTIONNALITÉS =====
    
    // Gestion du scanner de code-barres
    function initializeBarcodeScanner() {
        const scanBtn = document.getElementById('scan-barcode-btn');
        const barcodeModal = document.getElementById('barcode-modal-overlay');
        const closeBarcodeModal = document.getElementById('close-barcode-modal');
        const startCameraBtn = document.getElementById('start-camera-btn');
        const stopCameraBtn = document.getElementById('stop-camera-btn');
        const video = document.getElementById('barcode-video');
        const canvas = document.getElementById('barcode-canvas');
        const barcodeResult = document.getElementById('barcode-result');
        const barcodeValue = document.getElementById('barcode-value');
        const useBarcodeBtn = document.getElementById('use-barcode-btn');
        
        let animationId;
        let scannedCode = null;
        
        scanBtn.addEventListener('click', () => {
            barcodeModal.style.display = 'flex';
            barcodeResult.style.display = 'none';
            scannedCode = null;
        });
        
        closeBarcodeModal.addEventListener('click', () => {
            stopScanning();
            barcodeModal.style.display = 'none';
        });
        
        startCameraBtn.addEventListener('click', async () => {
            try {
                barcodeStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    } 
                });
                video.srcObject = barcodeStream;
                video.play();
                startCameraBtn.style.display = 'none';
                stopCameraBtn.style.display = 'inline-block';
                
                // Commencer le scan
                scanForBarcode();
            } catch (error) {
                console.error('Erreur d\'accès à la caméra:', error);
                alert('لا يمكن الوصول إلى الكاميرا. تأكد من إعطاء الإذن للموقع.');
            }
        });
        
        stopCameraBtn.addEventListener('click', () => {
            stopScanning();
        });
        
        function scanForBarcode() {
            if (!barcodeStream) return;
            
            const ctx = canvas.getContext('2d');
            let scanAttempts = 0;
            
            function scan() {
                if (!barcodeStream) return;
                
                // Wait for video to be ready
                if (video.videoWidth === 0 || video.videoHeight === 0) {
                    if (scanAttempts < 50) { // Retry for 5 seconds
                        scanAttempts++;
                        animationId = requestAnimationFrame(scan);
                        return;
                    }
                }
                
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Try jsQR first
                if (typeof jsQR !== 'undefined') {
                    try {
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: "dontInvert",
                        });
                        if (code && code.data) {
                            scannedCode = code.data;
                            console.log('jsQR - Code détecté:', scannedCode);
                            barcodeValue.textContent = scannedCode;
                            barcodeResult.style.display = 'block';
                            stopScanning();
                            return;
                        }
                    } catch (e) {
                        console.warn('jsQR error:', e);
                    }
                }
                
                // Alternative: Try with different jsQR options
                if (typeof jsQR !== 'undefined') {
                    try {
                        const codeInverted = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: "attemptBoth",
                        });
                        if (codeInverted && codeInverted.data) {
                            scannedCode = codeInverted.data;
                            console.log('jsQR inverted - Code détecté:', scannedCode);
                            barcodeValue.textContent = scannedCode;
                            barcodeResult.style.display = 'block';
                            stopScanning();
                            return;
                        }
                    } catch (e) {
                        console.warn('jsQR inverted error:', e);
                    }
                }
                
                // Continue scanning
                animationId = requestAnimationFrame(scan);
            }
            
            // Start scanning after a small delay
            setTimeout(scan, 100);
        }
        
        function stopScanning() {
            if (barcodeStream) {
                barcodeStream.getTracks().forEach(track => track.stop());
                barcodeStream = null;
            }
            
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            startCameraBtn.style.display = 'inline-block';
            stopCameraBtn.style.display = 'none';
        }
        
        useBarcodeBtn.addEventListener('click', () => {
            if (scannedCode) {
                document.getElementById('loan-isbn').value = scannedCode;
                // Déclencher l'événement input pour mettre à jour les infos du livre
                document.getElementById('loan-isbn').dispatchEvent(new Event('input'));
                barcodeModal.style.display = 'none';
                stopScanning();
            }
        });
        
        // Gestion de l'input manuel
        const manualInputBtn = document.getElementById('manual-input-btn');
        const manualBarcodeInput = document.getElementById('manual-barcode-input');
        const manualBarcodeField = document.getElementById('manual-barcode-field');
        const useManualBarcodeBtn = document.getElementById('use-manual-barcode-btn');
        
        manualInputBtn.addEventListener('click', () => {
            manualBarcodeInput.style.display = manualBarcodeInput.style.display === 'none' ? 'block' : 'none';
            if (manualBarcodeInput.style.display === 'block') {
                manualBarcodeField.focus();
            }
        });
        
        useManualBarcodeBtn.addEventListener('click', () => {
            const manualCode = manualBarcodeField.value.trim();
            if (manualCode) {
                scannedCode = manualCode;
                barcodeValue.textContent = scannedCode;
                barcodeResult.style.display = 'block';
                manualBarcodeInput.style.display = 'none';
                manualBarcodeField.value = '';
            }
        });
        
        manualBarcodeField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                useManualBarcodeBtn.click();
            }
        });
        
        // Fermer modal en cliquant à l'extérieur
        barcodeModal.addEventListener('click', (e) => {
            if (e.target === barcodeModal) {
                stopScanning();
                barcodeModal.style.display = 'none';
            }
        });
    }
    
    // Gestion optimisée des modifications avec système de sauvegarde batch
    function initializeBatchEditing() {
        const saveAllBtn = document.getElementById('save-all-changes-btn');
        
        // Nouvelle fonction d'édition qui accumule les changements
        function editCellOptimized(cell) {
            if (cell.classList.contains('editing')) return;
            
            const originalValue = cell.dataset.original || cell.textContent.trim();
            const field = cell.dataset.field;
            const isbn = cell.parentElement.dataset.isbn;
            
            cell.classList.add('editing');
            cell.innerHTML = `<input type="text" value="${originalValue}" data-original="${originalValue}">`;
            
            const input = cell.querySelector('input');
            input.focus();
            input.select();
            
            // Sauvegarder en appuyant sur Entrée
            input.addEventListener('keydown', async function(e) {
                if (e.key === 'Enter') {
                    await saveCellOptimized(cell, field, isbn, this.value);
                } else if (e.key === 'Escape') {
                    cancelEditOptimized(cell, originalValue);
                }
            });
            
            // Sauvegarder en perdant le focus
            input.addEventListener('blur', async function() {
                await saveCellOptimized(cell, field, isbn, this.value);
            });
        }
        
        // Sauvegarder les modifications de manière optimisée
        async function saveCellOptimized(cell, field, isbn, newValue) {
            const originalValue = cell.querySelector('input').dataset.original;
            
            if (newValue === originalValue) {
                cancelEditOptimized(cell, originalValue);
                return;
            }
            
            // Ajouter aux changements en attente
            const existingChangeIndex = pendingChanges.findIndex(change => 
                change.isbn === isbn && change.updateData[field] !== undefined
            );
            
            if (existingChangeIndex !== -1) {
                // Mettre à jour le changement existant
                pendingChanges[existingChangeIndex].updateData[field] = 
                    field === 'totalCopies' ? parseInt(newValue) || 1 : newValue;
            } else {
                // Ajouter nouveau changement
                const updateData = {};
                updateData[field] = field === 'totalCopies' ? parseInt(newValue) || 1 : newValue;
                pendingChanges.push({ isbn, updateData });
            }
            
            // Marquer la cellule comme modifiée
            cell.classList.remove('editing');
            cell.classList.add('modified');
            cell.textContent = newValue;
            cell.dataset.original = newValue;
            
            // Afficher le bouton de sauvegarde
            saveAllBtn.style.display = 'inline-block';
        }
        
        function cancelEditOptimized(cell, originalValue) {
            cell.classList.remove('editing');
            cell.textContent = originalValue;
        }
        
        // Sauvegarder tous les changements en une seule requête batch
        saveAllBtn.addEventListener('click', async () => {
            if (pendingChanges.length === 0) return;
            
            try {
                saveAllBtn.disabled = true;
                saveAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
                
                const response = await fetch(`/api/books/batch-update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ updates: pendingChanges })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // Succès - supprimer les marqueurs de modification
                    document.querySelectorAll('.modified').forEach(cell => {
                        cell.classList.remove('modified');
                        cell.style.backgroundColor = '#d4edda';
                        setTimeout(() => {
                            cell.style.backgroundColor = '';
                        }, 1000);
                    });
                    
                    pendingChanges = [];
                    saveAllBtn.style.display = 'none';
                    
                    // Recharger les statistiques
                    await updateStatsFromAPI();
                    
                    alert(`تم حفظ ${result.successful} تعديل بنجاح!` + 
                          (result.failed > 0 ? ` فشل في ${result.failed} تعديل.` : ''));
                } else {
                    throw new Error(result.message || 'Erreur de sauvegarde');
                }
            } catch (error) {
                alert('خطأ في حفظ التعديلات: ' + error.message);
            } finally {
                saveAllBtn.disabled = false;
                saveAllBtn.innerHTML = '<i class="fas fa-save"></i> حفظ جميع التغييرات';
            }
        });
        
        // Remplacer la fonction editCell existante
        window.editCell = editCellOptimized;
    }
    
    // Scanner de code-barres pour la recherche
    function initializeSearchScanner() {
        const searchScanBtn = document.getElementById('scan-search-barcode-btn');
        
        searchScanBtn.addEventListener('click', () => {
            // Réutiliser le même modal de scan, mais rediriger le résultat vers la recherche
            const barcodeModal = document.getElementById('barcode-modal-overlay');
            barcodeModal.style.display = 'flex';
            
            // Modifier temporairement le comportement du bouton d'utilisation
            const useBarcodeBtn = document.getElementById('use-barcode-btn');
            const originalHandler = useBarcodeBtn.onclick;
            
            useBarcodeBtn.onclick = () => {
                const scannedCode = document.getElementById('barcode-value').textContent;
                if (scannedCode) {
                    document.getElementById('search-input').value = scannedCode;
                    // Déclencher la recherche
                    document.getElementById('search-input').dispatchEvent(new Event('input'));
                    barcodeModal.style.display = 'none';
                    // Restaurer le gestionnaire original
                    useBarcodeBtn.onclick = originalHandler;
                }
            };
        });
    }
    
    // Gestion de l'extension des dates de retour
    function showExtendDateModal(loan, book) {
        const extendModal = document.getElementById('extend-date-modal-overlay');
        const borrowerNameEl = document.getElementById('extend-borrower-name');
        const bookTitleEl = document.getElementById('extend-book-title');
        const currentDateEl = document.getElementById('extend-current-date');
        const newDateEl = document.getElementById('extend-new-date');
        
        // Remplir les informations
        borrowerNameEl.textContent = loan.studentName;
        bookTitleEl.textContent = book.title || loan.title || 'Titre non disponible';
        currentDateEl.textContent = formatDateByLanguage(loan.returnDate);
        
        // Définir la date minimum comme demain
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        newDateEl.min = tomorrow.toISOString().split('T')[0];
        
        // Définir la date par défaut comme une semaine plus tard
        const oneWeekLater = new Date(loan.returnDate);
        oneWeekLater.setDate(oneWeekLater.getDate() + 7);
        newDateEl.value = oneWeekLater.toISOString().split('T')[0];
        
        // Stocker les données dans l'élément pour usage ultérieur
        extendModal.dataset.isbn = loan.isbn;
        extendModal.dataset.student = loan.studentName;
        
        extendModal.style.display = 'flex';
    }
    
    async function extendReturnDate(isbn, studentName, newReturnDate) {
        try {
            const response = await fetch('/api/loans/extend', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isbn: isbn,
                    studentName: studentName,
                    newReturnDate: newReturnDate
                })
            });
            
            if (response.ok) {
                alert('تم تمديد فترة الإعارة بنجاح!');
                await loadAllData(); // Reload data
                displayLoans(currentLoanType); // Refresh the current view
            } else {
                throw new Error('Failed to extend loan');
            }
        } catch (error) {
            console.error('Error extending loan:', error);
            alert('خطأ في تمديد فترة الإعارة');
        }
    }
    
    // Initialiser les gestionnaires d'événements pour la modal d'extension
    document.getElementById('close-extend-modal').addEventListener('click', () => {
        document.getElementById('extend-date-modal-overlay').style.display = 'none';
    });
    
    document.getElementById('extend-date-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const extendModal = document.getElementById('extend-date-modal-overlay');
        const isbn = extendModal.dataset.isbn;
        const studentName = extendModal.dataset.student;
        const newDate = document.getElementById('extend-new-date').value;
        
        if (isbn && studentName && newDate) {
            await extendReturnDate(isbn, studentName, newDate);
            extendModal.style.display = 'none';
        }
    });
    
    // Fermer modal en cliquant à l'extérieur
    document.getElementById('extend-date-modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            e.currentTarget.style.display = 'none';
        }
    });

    // Initialiser les nouvelles fonctionnalités
    initializeBarcodeScanner();
    initializeBatchEditing();
    initializeSearchScanner();
    
});