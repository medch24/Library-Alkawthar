const API_BASE_URL = 'https://3002-i6n7m0hxton37bk711m1i-dfc00ec5.sandbox.novita.ai';
let allBooks = [];
let allLoans = [];
let currentLoanType = 'students';
let currentLanguage = 'ar';
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let pendingChanges = [];
let barcodeStream = null;
let currentSort = { column: null, order: 'asc' }; // NOUVEAU: Pour le tri

// Fonction pour formater les dates selon la langue courante
function formatDateByLanguage(date, language = currentLanguage) {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    
    switch (language) {
        case 'ar':
            return d.toLocaleDateString('fr-CA', options); // Format AAAA-MM-JJ
        case 'fr':
            return d.toLocaleDateString('fr-FR', options); // Format JJ/MM/AAAA
        case 'en':
            return d.toLocaleDateString('en-CA', options); // Format AAAA-MM-JJ
        default:
            return d.toLocaleDateString('fr-CA', options);
    }
}

// Fonction pour obtenir le texte traduit
function getTranslatedText(key) {
    return translations[currentLanguage]?.[key] || key;
}

// Dictionnaire des traductions (complété)
const translations = {
    ar: {
        welcome_title: 'مرحباً بكم في مكتبة مدارس الكوثر العالمية',
        welcome_subtitle: 'الرجاء إدخال بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم.',
        username_placeholder: 'اسم المستخدم',
        password_placeholder: 'كلمة المرور',
        login_button: 'تسجيل الدخول',
        dashboard_title: 'لوحة تحكم مكتبة الكوثر',
        school_name: 'مدارس الكوثر العالمية',
        school_name_footer: 'مدارس الكوثر العالمية',
        rights_reserved: 'جميع الحقوق محفوظة.',
        logout: 'تسجيل الخروج',
        library_stats: 'إحصائيات المكتبة',
        total_books: 'إجمالي الكتب',
        loaned_books: 'الكتب المعارة',
        available_books: 'الكتب المتاحة',
        copies_loaned: 'عدد النسخ المعارة',
        inventory_search: 'البحث في المخزون وإدارة الكتب',
        search_placeholder: 'ابحث بالعنوان أو ISBN أو المادة...',
        refresh: 'تحديث',
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
        export_excel_data: 'تحميل بيانات Excel',
        book_isbn_label: 'ISBN الكتاب',
        book_title_label: 'عنوان الكتاب',
        borrower_type_label: 'نوع المستعير',
        borrower_name_label: 'اسم المستعير',
        class_subject_label: 'الفصل/المادة',
        loan_copies_label: 'عدد النسخ المستعارة',
        available_copies_label: 'عدد النسخ المتاحة:',
        loan_date_label: 'تاريخ الإعارة',
        return_date_label: 'تاريخ التسليم',
        loan_book_button: 'إعارة الكتاب',
        total_copies_label: 'عدد النسخ',
        optional_placeholder: 'اختياري',
        add_book_button: 'إضافة الكتاب',
        choose_excel_file: 'اختر ملف Excel',
        upload_file_button: 'رفع الملف',
        prev_page: 'السابق',
        next_page: 'التالي',
        scan_barcode_title: 'مسح الباركود',
        start_scan_button: 'بدء المسح',
        stop_scan_button: 'إيقاف المسح',
        barcode_detected: 'تم اكتشاف الرمز:',
        use_this_code: 'استخدام هذا الرمز',
        scan_help_text: 'وجه الكاميرا نحو الباركود للمسح التلقائي',
        select_book_title: 'تحديد الكتاب',
        select_book_subtitle: 'تم العثور على عدة كتب بنفس الـ ISBN. الرجاء تحديد الكتاب الصحيح للإعارة.'
    },
    fr: {
        welcome_title: 'Bienvenue à la bibliothèque des écoles Al-Kawthar',
        welcome_subtitle: 'Veuillez entrer vos identifiants pour accéder au tableau de bord.',
        username_placeholder: 'Nom d\'utilisateur',
        password_placeholder: 'Mot de passe',
        login_button: 'Se connecter',
        dashboard_title: 'Tableau de bord de la bibliothèque Al-Kawthar',
        school_name: 'Écoles Internationales Al-Kawthar',
        school_name_footer: 'Écoles Internationales Al-Kawthar',
        rights_reserved: 'Tous droits réservés.',
        logout: 'Se déconnecter',
        library_stats: 'Statistiques de la bibliothèque',
        total_books: 'Total des livres',
        loaned_books: 'Livres prêtés',
        available_books: 'Livres disponibles',
        copies_loaned: 'Nombre de copies prêtées',
        inventory_search: 'Recherche et gestion de l\'inventaire',
        search_placeholder: 'Rechercher par titre, ISBN ou matière...',
        refresh: 'Actualiser',
        save_all_changes: 'Sauvegarder les changements',
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
        export_excel_data: 'Télécharger données Excel',
        book_isbn_label: 'ISBN du livre',
        book_title_label: 'Titre du livre',
        borrower_type_label: 'Type d\'emprunteur',
        borrower_name_label: 'Nom de l\'emprunteur',
        class_subject_label: 'Classe/Matière',
        loan_copies_label: 'Nombre de copies prêtées',
        available_copies_label: 'Copies disponibles :',
        loan_date_label: 'Date du prêt',
        return_date_label: 'Date de retour',
        loan_book_button: 'Prêter le livre',
        total_copies_label: 'Nombre de copies',
        optional_placeholder: 'Optionnel',
        add_book_button: 'Ajouter le livre',
        choose_excel_file: 'Choisir un fichier Excel',
        upload_file_button: 'Télécharger le fichier',
        prev_page: 'Précédent',
        next_page: 'Suivant',
        scan_barcode_title: 'Scanner le code-barres',
        start_scan_button: 'Démarrer le scan',
        stop_scan_button: 'Arrêter le scan',
        barcode_detected: 'Code détecté :',
        use_this_code: 'Utiliser ce code',
        scan_help_text: 'Dirigez la caméra vers le code-barres pour un scan automatique',
        select_book_title: 'Sélectionner un livre',
        select_book_subtitle: 'Plusieurs livres trouvés avec le même ISBN. Veuillez sélectionner le bon livre à prêter.'
    },
    en: {
        welcome_title: 'Welcome to Al-Kawthar Schools Library',
        welcome_subtitle: 'Please enter your credentials to access the dashboard.',
        username_placeholder: 'Username',
        password_placeholder: 'Password',
        login_button: 'Login',
        dashboard_title: 'Al-Kawthar Library Dashboard',
        school_name: 'Al-Kawthar International Schools',
        school_name_footer: 'Al-Kawthar International Schools',
        rights_reserved: 'All rights reserved.',
        logout: 'Logout',
        library_stats: 'Library Statistics',
        total_books: 'Total Books',
        loaned_books: 'Loaned Books',
        available_books: 'Available Books',
        copies_loaned: 'Copies Loaned',
        inventory_search: 'Inventory Search & Management',
        search_placeholder: 'Search by title, ISBN or subject...',
        refresh: 'Refresh',
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
        export_excel_data: 'Download Excel Data',
        book_isbn_label: 'Book ISBN',
        book_title_label: 'Book Title',
        borrower_type_label: 'Borrower Type',
        borrower_name_label: 'Borrower Name',
        class_subject_label: 'Class/Subject',
        loan_copies_label: 'Number of copies loaned',
        available_copies_label: 'Available copies:',
        loan_date_label: 'Loan Date',
        return_date_label: 'Return Date',
        loan_book_button: 'Loan Book',
        total_copies_label: 'Number of Copies',
        optional_placeholder: 'Optional',
        add_book_button: 'Add Book',
        choose_excel_file: 'Choose Excel File',
        upload_file_button: 'Upload File',
        prev_page: 'Previous',
        next_page: 'Next',
        scan_barcode_title: 'Scan Barcode',
        start_scan_button: 'Start Scan',
        stop_scan_button: 'Stop Scan',
        barcode_detected: 'Detected code:',
        use_this_code: 'Use this code',
        scan_help_text: 'Point the camera at the barcode for automatic scanning',
        select_book_title: 'Select Book',
        select_book_subtitle: 'Multiple books found with the same ISBN. Please select the correct book to loan.'
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
        
        // Re-render la table pour appliquer les traductions des headers
        if(allBooks.length > 0) {
            renderTable(allBooks);
        }
    }
    
    // Fonction pour mettre à jour les traductions
    function updateTranslations() {
        // Mettre à jour les éléments avec data-key
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            element.textContent = getTranslatedText(key);
        });
        
        // Mettre à jour les placeholders
        document.querySelectorAll('[data-key-placeholder]').forEach(element => {
            const key = element.getAttribute('data-key-placeholder');
            element.placeholder = getTranslatedText(key);
        });

        // Mettre à jour le texte de la pagination
        if (totalPages > 1) {
            const pageInfo = document.getElementById('page-info');
             if(currentLanguage === 'ar') {
                pageInfo.textContent = `الصفحة ${currentPage} من ${totalPages}`;
            } else if (currentLanguage === 'fr') {
                 pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
            } else {
                 pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            }
        }
    }
    
    // Gestionnaires d'événements pour les boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            changeLanguage(btn.dataset.lang);
        });
    });
    
    // Charger la langue préférée
    const savedLang = localStorage.getItem('preferred_language') || 'ar';
    setTimeout(() => changeLanguage(savedLang), 100);
    
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
        
        if (stepIndex === loadingSteps.length - 1) {
            setTimeout(() => hideLoadingBar(), 1000);
        }
    }
    
    function updateLoadingText(text) {
        const loadingTextSpan = document.getElementById('loading-text-span');
        if (loadingTextSpan) {
            loadingTextSpan.textContent = getTranslatedText(text);
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
            const loginError = document.getElementById('login-error');
            loginError.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
            if(currentLanguage === 'fr') loginError.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
            if(currentLanguage === 'en') loginError.textContent = 'Incorrect username or password.';
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

    if (localStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }

    async function loadAllData(page = 1, search = '') {
        if (isLoading) return;
        isLoading = true;
        
        try {
            showLoadingBar(['loading_books', 'loading_loans', 'loading_stats', 'data_loaded']);
            
            updateProgress(0, 'loading_books');
            const booksUrl = `${API_BASE_URL}/api/books?page=${page}&limit=50&search=${encodeURIComponent(search)}`;
            const booksResponse = await fetch(booksUrl);
            if (!booksResponse.ok) throw new Error(`HTTP Error: ${booksResponse.status}`);
            
            const booksData = await booksResponse.json();
            
            allBooks = booksData.books || [];
            currentPage = booksData.pagination?.current || 1;
            totalPages = booksData.pagination?.pages || 1;
            updatePaginationControls();
            
            updateProgress(1, 'loading_loans');
            if (!search) {
                const loansResponse = await fetch(API_BASE_URL + '/api/loans');
                if (loansResponse.ok) allLoans = await loansResponse.json();
            }
            
            updateProgress(2, 'loading_stats');
            await updateStatsFromAPI();
            
            renderTable(allBooks);
            updateProgress(3, 'data_loaded');
            
            if (!search) checkOverdueBooks();
            
            setTimeout(() => updateTranslations(), 200);
            
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            hideLoadingBar();
            alert('خطأ في تحميل البيانات. الرجاء المحاولة مرة أخرى.');
        } finally {
            isLoading = false;
        }
    }

    async function updateStatsFromAPI() {
        try {
            const response = await fetch(API_BASE_URL + '/api/statistics');
            if (response.ok) {
                const stats = await response.json();
                document.getElementById('total-books-stat').textContent = stats.totalCopies || 0;
                document.getElementById('loaned-books-stat').textContent = stats.loanedCopies || 0;
                document.getElementById('available-books-stat').textContent = stats.availableCopies || 0;
                document.getElementById('copies-loaned-stat').textContent = stats.loanedCopies || 0;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }
    
    function updatePaginationControls() {
        const paginationControls = document.getElementById('pagination-controls');
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');
        
        if (totalPages > 1) {
            paginationControls.style.display = 'flex';
            if(currentLanguage === 'ar') {
                pageInfo.textContent = `الصفحة ${currentPage} من ${totalPages}`;
            } else if (currentLanguage === 'fr') {
                 pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
            } else {
                 pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            }
            prevBtn.disabled = currentPage <= 1;
            nextBtn.disabled = currentPage >= totalPages;
        } else {
            paginationControls.style.display = 'none';
        }
    }

    function checkOverdueBooks() {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        const overdueLoans = allLoans.filter(loan => new Date(loan.returnDate) < currentDate);
        
        const overdueNotifications = document.getElementById('overdue-notifications');
        const overdueList = document.getElementById('overdue-list');
        
        if (overdueLoans.length > 0) {
            overdueList.innerHTML = overdueLoans.map(loan => {
                const book = allBooks.find(b => b.isbn === loan.isbn);
                const bookTitle = book ? book.title : getTranslatedText('book_not_found');
                const daysOverdue = Math.floor((currentDate - new Date(loan.returnDate)) / (1000 * 60 * 60 * 24));
                return `<div class="overdue-item">
                            <span>${loan.studentName} - ${bookTitle} (${daysOverdue} ${getTranslatedText('overdue_days')})</span>
                        </div>`;
            }).join('');
            overdueNotifications.style.display = 'block';
        } else {
            overdueNotifications.style.display = 'none';
        }
    }
    
    document.getElementById('dismiss-alert')?.addEventListener('click', () => {
        document.getElementById('overdue-notifications').style.display = 'none';
    });
    
    // NOUVEAU: Logique de tri
    function sortData(column) {
        const order = (currentSort.column === column && currentSort.order === 'asc') ? 'desc' : 'asc';
        currentSort = { column, order };

        allBooks.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            // Pour la colonne "availableCopies" qui n'existe pas dans l'objet
            if (column === 'availableCopies') {
                valA = (a.totalCopies || 0) - (a.loanedCopies || 0);
                valB = (b.totalCopies || 0) - (b.loanedCopies || 0);
            }

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = (valB || '').toLowerCase();
            } else {
                valA = valA || 0;
                valB = valB || 0;
            }

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });

        renderTable(allBooks);
    }
    
    function renderTable(bookList) {
        const tableBody = document.getElementById('books-table-body');
        if (!tableBody) return;
        
        tableBody.innerHTML = bookList.map(book => {
            const totalCopies = book.totalCopies || 0;
            const loanedCopies = book.loanedCopies || 0;
            const availableCopies = totalCopies - loanedCopies;
            
            return `<tr data-id="${book._id}">
                <td>${book.isbn || ''}</td>
                <td>${book.title || ''}</td>
                <td>${totalCopies}</td>
                <td>${loanedCopies}</td>
                <td class="${availableCopies > 0 ? 'status-available' : 'status-unavailable'}">${availableCopies}</td>
                <td>${book.subject || ''}</td>
                <td>${book.level || ''}</td>
                <td>${book.language || ''}</td>
                <td>${book.cornerName || ''}</td>
                <td>${book.cornerNumber || ''}</td>
                <td class="action-buttons">
                    <button class="btn-small btn-danger delete-book-btn" data-id="${book._id}" title="${getTranslatedText('delete_book')}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-small btn-info history-book-btn" data-isbn="${book.isbn}" title="${getTranslatedText('view_history')}">
                        <i class="fas fa-history"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');

        // Mettre à jour les headers pour le tri
        document.querySelectorAll('#books-table th[data-sort-by]').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (th.dataset.sortBy === currentSort.column) {
                th.classList.add(currentSort.order === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });

        addTableEventListeners();
    }

    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadAllData(currentPage, searchInput.value);
        }, 300);
    });
    
    document.getElementById('prev-page-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadAllData(currentPage, searchInput.value);
        }
    });
    
    document.getElementById('next-page-btn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadAllData(currentPage, searchInput.value);
        }
    });

    // MODIFIÉ: Gestion de la saisie ISBN avec sélection de livre
    document.getElementById('loan-isbn').addEventListener('input', async (e) => {
        const isbn = e.target.value.trim();
        const bookTitleElement = document.getElementById('loan-book-title');
        const availableCopiesDisplay = document.getElementById('available-copies-display');
        
        bookTitleElement.textContent = '-';
        availableCopiesDisplay.textContent = '-';
        
        if (isbn.length < 5) return;

        const response = await fetch(`${API_BASE_URL}/api/books?search=${encodeURIComponent(isbn)}`);
        const data = await response.json();
        const foundBooks = data.books.filter(b => b.isbn === isbn);

        if (foundBooks.length === 1) {
            populateLoanFormWithBook(foundBooks[0]);
        } else if (foundBooks.length > 1) {
            showBookSelectionModal(foundBooks);
        } else {
            bookTitleElement.textContent = getTranslatedText('book_not_found');
            bookTitleElement.style.color = 'red';
        }
    });

    function populateLoanFormWithBook(book) {
        const bookTitleElement = document.getElementById('loan-book-title');
        const availableCopiesDisplay = document.getElementById('available-copies-display');
        const loanCopiesInput = document.getElementById('loan-copies');

        document.getElementById('loan-isbn').setAttribute('data-selected-book-id', book._id); // Stocker l'ID unique
        bookTitleElement.textContent = book.title;
        bookTitleElement.style.color = 'var(--primary-color)';
        
        const availableCopies = (book.totalCopies || 0) - (book.loanedCopies || 0);
        availableCopiesDisplay.textContent = availableCopies;
        loanCopiesInput.max = availableCopies;
        loanCopiesInput.value = Math.min(1, availableCopies);
        loanCopiesInput.disabled = availableCopies === 0;
    }

    function showBookSelectionModal(books) {
        const modal = document.getElementById('book-selection-modal-overlay');
        const list = document.getElementById('book-selection-list');
        list.innerHTML = books.map(book => 
            `<div class="book-selection-item" data-book-json='${JSON.stringify(book)}'>
                <strong>${book.title}</strong><br>
                <small>(${book.subject || 'N/A'}) - ${getTranslatedText('available_copies')}: ${(book.totalCopies || 0) - (book.loanedCopies || 0)}</small>
            </div>`
        ).join('');
        
        document.querySelectorAll('.book-selection-item').forEach(item => {
            item.addEventListener('click', () => {
                const bookData = JSON.parse(item.dataset.bookJson);
                document.getElementById('loan-isbn').value = bookData.isbn; // Garder l'ISBN dans le champ
                populateLoanFormWithBook(bookData);
                modal.style.display = 'none';
            });
        });
        
        modal.style.display = 'flex';
    }
    
    document.getElementById('close-book-selection-modal').addEventListener('click', () => {
        document.getElementById('book-selection-modal-overlay').style.display = 'none';
    });

    loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const loanData = {
            isbn: document.getElementById('loan-isbn').value.trim(),
            studentName: document.getElementById('student-name').value,
            studentClass: document.getElementById('student-class').value,
            borrowerType: document.getElementById('borrower-type').value,
            loanDate: document.getElementById('loan-date').value,
            returnDate: document.getElementById('return-date').value,
            copiesCount: parseInt(document.getElementById('loan-copies').value) || 1
        };
        
        try {
            const response = await fetch(API_BASE_URL + '/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loanData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            
            loanForm.reset();
            document.getElementById('loan-book-title').textContent = '-';
            availableCopiesDisplay.textContent = '-';
            alert(getTranslatedText('loan_success'));
            await loadAllData();
        } catch (error) {
            alert(`${getTranslatedText('loan_error')}: ${error.message}`);
        }
    });

    document.getElementById('view-student-loans-btn').addEventListener('click', () => displayLoans('students'));
    document.getElementById('view-teacher-loans-btn').addEventListener('click', () => displayLoans('teachers'));

    document.getElementById('export-excel-btn').addEventListener('click', () => window.location.href = `${API_BASE_URL}/api/export/excel`);

    document.getElementById('manual-book-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookData = {
            isbn: document.getElementById('manual-isbn').value,
            title: document.getElementById('manual-title').value,
            totalCopies: parseInt(document.getElementById('manual-copies').value),
            subject: document.getElementById('manual-subject').value,
            level: document.getElementById('manual-level').value,
            language: document.getElementById('manual-language').value,
            cornerName: document.getElementById('manual-corner-name').value,
            cornerNumber: document.getElementById('manual-corner-number').value,
        };
        
        try {
            await fetch(API_BASE_URL + '/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            e.target.reset();
            alert(getTranslatedText('add_book_success'));
            await loadAllData();
        } catch (error) {
            alert(getTranslatedText('add_book_error'));
        }
    });

    document.getElementById('upload-excel-btn').addEventListener('click', async () => {
        const fileInput = document.getElementById('excel-file');
        if (!fileInput.files[0]) return alert(getTranslatedText('select_file_first'));
        
        const formData = new FormData();
        formData.append('excelFile', fileInput.files[0]);
        
        try {
            await fetch(API_BASE_URL + '/api/books/upload', { method: 'POST', body: formData });
            alert(getTranslatedText('upload_success'));
            await loadAllData();
        } catch (error) {
            alert(getTranslatedText('upload_error'));
        }
    });

    async function displayLoans(loanType) {
        currentLoanType = loanType;
        const modalContent = document.getElementById('loans-modal-content');
        const modalTitle = document.getElementById('loans-modal-title');
        
        const response = await fetch(`${API_BASE_URL}/api/loans/${loanType}`);
        const loans = await response.json();
        
        modalTitle.textContent = getTranslatedText(loanType === 'students' ? 'student_borrowers_list' : 'teacher_borrowers_list');
        
        if (loans.length === 0) {
            modalContent.innerHTML = `<p>${getTranslatedText('no_loans_found')}</p>`;
            openModal(loansModal);
            return;
        }

        const booksByIsbn = allBooks.reduce((acc, book) => {
            acc[book.isbn] = book.title;
            return acc;
        }, {});
        
        modalContent.innerHTML = `
            <table id="loans-table">
                <thead>
                    <tr>
                        <th>${getTranslatedText('borrower_name')}</th>
                        <th>${getTranslatedText('class_section')}</th>
                        <th>${getTranslatedText('book_title')}</th>
                        <th>${getTranslatedText('loan_date_col')}</th>
                        <th>${getTranslatedText('return_date_col')}</th>
                        <th>${getTranslatedText('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${loans.map(loan => `
                        <tr>
                            <td>${loan.studentName}</td>
                            <td>${loan.studentClass || '-'}</td>
                            <td>${booksByIsbn[loan.isbn] || loan.isbn}</td>
                            <td>${formatDateByLanguage(loan.loanDate)}</td>
                            <td>${formatDateByLanguage(loan.returnDate)}</td>
                            <td>
                                <button class="btn-action btn-return" data-isbn="${loan.isbn}" data-student="${loan.studentName}">
                                    ${getTranslatedText('return_book')}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        openModal(loansModal);

        document.querySelectorAll('.btn-return').forEach(button => {
            button.addEventListener('click', async (e) => {
                const { isbn, student } = e.currentTarget.dataset;
                await returnLoan(isbn, student);
                displayLoans(currentLoanType);
            });
        });
    }

    async function returnLoan(isbn, studentName) {
        try {
            await fetch(API_BASE_URL + '/api/loans', {
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

    function openModal(modalElement) {
        modalOverlay.style.display = 'flex';
        modalElement.style.display = 'flex';
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    }

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));

    document.getElementById('refresh-books-btn').addEventListener('click', () => loadAllData());

    function addTableEventListeners() {
        document.querySelectorAll('.delete-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteBook(e.currentTarget.dataset.id));
        });

        document.querySelectorAll('.history-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => showBookHistory(e.currentTarget.dataset.isbn));
        });

        // NOUVEAU: Ajout des listeners pour le tri
        document.querySelectorAll('#books-table th[data-sort-by]').forEach(th => {
            th.addEventListener('click', () => sortData(th.dataset.sortBy));
        });
    }

    async function deleteBook(id) {
        const book = allBooks.find(b => b._id === id);
        if (book && book.loanedCopies > 0) {
            return alert(getTranslatedText('cannot_delete_loaned'));
        }
        if (confirm(getTranslatedText('confirm_delete'))) {
            try {
                await fetch(`${API_BASE_URL}/api/books/${id}`, { method: 'DELETE' });
                await loadAllData();
            } catch (error) {
                alert(getTranslatedText('delete_error'));
            }
        }
    }

    async function showBookHistory(isbn) {
        const response = await fetch(`${API_BASE_URL}/api/history/book/${isbn}`);
        const history = await response.json();
        const bookTitle = allBooks.find(b => b.isbn === isbn)?.title || isbn;
        
        let historyHTML = `<h3>${getTranslatedText('history_for')}: ${bookTitle}</h3>`;
        if (history.length === 0) {
            historyHTML += `<p>${getTranslatedText('no_history_found')}</p>`;
        } else {
            historyHTML += `
                <table>
                    <thead>
                        <tr>
                            <th>${getTranslatedText('borrower_name')}</th>
                            <th>${getTranslatedText('loan_date_col')}</th>
                            <th>${getTranslatedText('return_date_col')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${history.map(h => `
                            <tr>
                                <td>${h.studentName}</td>
                                <td>${formatDateByLanguage(h.loanDate)}</td>
                                <td>${formatDateByLanguage(h.actualReturnDate)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        document.getElementById('loans-modal-content').innerHTML = historyHTML;
        openModal(loansModal);
    }
    
    initializeBarcodeScanner();
});

function initializeBarcodeScanner() {
    const scanBtn = document.getElementById('scan-barcode-btn');
    const searchScanBtn = document.getElementById('scan-search-barcode-btn');
    const barcodeModal = document.getElementById('barcode-modal-overlay');
    const video = document.getElementById('barcode-video');
    let currentTargetInputId = null;

    const openScanner = (targetId) => {
        currentTargetInputId = targetId;
        barcodeModal.style.display = 'flex';
        startScanning();
    };
    
    scanBtn.addEventListener('click', () => openScanner('loan-isbn'));
    searchScanBtn.addEventListener('click', () => openScanner('search-input'));

    document.getElementById('close-barcode-modal').addEventListener('click', () => {
        stopScanning();
        barcodeModal.style.display = 'none';
    });

    async function startScanning() {
        try {
            barcodeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = barcodeStream;
            video.play();
            requestAnimationFrame(tick);
        } catch (err) {
            console.error(err);
            alert("Erreur d'accès à la caméra.");
        }
    }

    function stopScanning() {
        if (barcodeStream) {
            barcodeStream.getTracks().forEach(track => track.stop());
        }
    }

    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const canvas = document.getElementById('barcode-canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                const targetInput = document.getElementById(currentTargetInputId);
                targetInput.value = code.data;
                targetInput.dispatchEvent(new Event('input', { bubbles: true })); // Déclencher l'événement pour la mise à jour
                stopScanning();
                barcodeModal.style.display = 'none';
                return;
            }
        }
        requestAnimationFrame(tick);
    }
}
