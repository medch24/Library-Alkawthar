const API_BASE_URL = '';
let allBooks = [];
let allLoans = [];
let currentLoanType = 'students';
let currentLanguage = 'ar';
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let currentSort = { column: 'title', order: 'asc' }; // État de tri par défaut
let barcodeStream = null; // Pour la caméra

// --- TRADUCTIONS COMPLÈTES ---
const translations = {
    ar: {
        welcome_title: 'مرحباً بكم في مكتبة مدارس الكوثر العالمية',
        welcome_subtitle: 'الرجاء إدخال بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم.',
        username_placeholder: 'اسم المستخدم',
        password_placeholder: 'كلمة المرور',
        login_button: 'تسجيل الدخول',
        dashboard_title: 'لوحة تحكم مكتبة الكوثر',
        school_name: 'مدارس الكوثر العالمية',
        logout: 'تسجيل الخروج',
        loading_data: 'تحميل البيانات...',
        overdue_books_title: 'كتب متأخرة في الإرجاع',
        dismiss: 'إخفاء التنبيه',
        library_stats: 'إحصائيات المكتبة',
        total_books: 'إجمالي الكتب',
        loaned_books: 'الكتب المعارة',
        available_books: 'الكتب المتاحة',
        copies_loaned: 'عدد النسخ المعارة',
        view_student_borrowers: 'عرض الطلاب المستعيرين',
        view_teacher_borrowers: 'عرض المدرسين المستعيرين',
        export_excel_data: 'تحميل بيانات Excel',
        loan_management: 'إدارة الإعارة',
        loan_isbn_label: 'ISBN الكتاب',
        scan_barcode_title: 'مسح الباركود',
        book_title_label: 'عنوان الكتاب',
        borrower_type_label: 'نوع المستعير',
        student_option: 'طالب',
        teacher_option: 'مدرس/ة',
        borrower_name_label: 'اسم المستعير',
        class_subject_label: 'الفصل/المادة',
        loan_copies_label: 'عدد النسخ المستعارة',
        available_copies_info: 'عدد النسخ المتاحة:',
        loan_date_label: 'تاريخ الإعارة',
        return_date_label: 'تاريخ التسليم',
        loan_book_button: 'إعارة الكتاب',
        add_book_manually: 'إضافة كتاب يدوياً',
        manual_isbn_label: 'ISBN',
        manual_title_label: 'عنوان الكتاب',
        manual_copies_label: 'عدد النسخ',
        manual_subject_label: 'المادة',
        manual_level_label: 'المستوى',
        manual_language_label: 'اللغة',
        manual_corner_name_label: 'اسم الركن',
        manual_corner_number_label: 'رقم الركن',
        add_book_button: 'إضافة الكتاب',
        upload_excel: 'رفع ملف Excel للكتب',
        choose_excel_file_label: 'اختر ملف Excel',
        upload_file_button: 'رفع الملف',
        inventory_search: 'البحث في المخزون وإدارة الكتب',
        search_placeholder: 'ابحث بالعنوان أو ISBN أو المادة...',
        refresh: 'تحديث',
        save_all_changes: 'حفظ جميع التغييرات',
        previous_page: 'السابق',
        next_page: 'التالي',
        page_info: 'صفحة {currentPage} من {totalPages}',
        copyright: '© 2025 مدارس الكوثر العالمية - جميع الحقوق محفوظة.',
        books_loaned_list: 'قائمة الكتب المعارة',
        student_borrowers_list: 'قائمة الطلاب المستعيرين',
        teacher_borrowers_list: 'قائمة المدرسين المستعيرين',
        search_in_loans: 'ابحث بالاسم، العنوان، أو ISBN...',
        extend_return_date: 'تمديد فترة الارجاع',
        current_return_date: 'تاريخ الإرجاع الحالي',
        new_return_date: 'تاريخ الإرجاع الجديد',
        extend_loan: 'تمديد الإعارة',
        scan_barcode_modal_title: 'مسح الباركود',
        start_scan_button: 'بدء المسح',
        stop_scan_button: 'إيقاف المسح',
        code_detected_text: 'تم اكتشاف الرمز:',
        use_this_code_button: 'استخدام هذا الرمز',
        camera_help_text: 'وجه الكاميرا نحو الباركود للمسح التلقائي',
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
        edit: 'تعديل',
        delete: 'حذف',
        return_book: 'إرجاع',
        extend: 'تمديد',
        book_not_found: 'كتاب غير موجود',
        no_results: 'لا توجد نتائج.',
        select_a_valid_book: 'الرجاء تحديد كتاب صالح أولاً.',
        confirm_delete_title: 'تأكيد الحذف',
        confirm_delete_text: 'هل أنت متأكد من حذف الكتاب "{title}"؟ لا يمكن التراجع عن هذا الإجراء.',
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        loan_limit_reached: 'لقد بلغ المستعير الحد الأقصى لعدد الكتب المستعارة.',
        not_enough_copies: 'لا توجد نسخ كافية متاحة. المتاح: {available}',
        select_book_title: 'تحديد كتاب',
        multiple_books_found: 'تم العثور على عدة كتب بنفس رقم ISBN. الرجاء تحديد الكتاب الصحيح للإعارة:',
        loan_date_col: 'تاريخ الإعارة',
        return_date_col: 'تاريخ الإرجاع',
        overdue_days: 'أيام التأخير',
    },
    fr: {
        welcome_title: 'Bienvenue à la bibliothèque des Écoles Internationales Al-Kawthar',
        welcome_subtitle: 'Veuillez saisir vos identifiants pour accéder au tableau de bord.',
        username_placeholder: 'Nom d\'utilisateur',
        password_placeholder: 'Mot de passe',
        login_button: 'Se connecter',
        dashboard_title: 'Tableau de bord de la bibliothèque Al-Kawthar',
        school_name: 'Écoles Internationales Al-Kawthar',
        logout: 'Se déconnecter',
        loading_data: 'Chargement des données...',
        overdue_books_title: 'Livres en retard',
        dismiss: 'Masquer l\'alerte',
        library_stats: 'Statistiques de la bibliothèque',
        total_books: 'Total des livres',
        loaned_books: 'Livres prêtés',
        available_books: 'Livres disponibles',
        copies_loaned: 'Copies prêtées',
        view_student_borrowers: 'Voir les étudiants emprunteurs',
        view_teacher_borrowers: 'Voir les enseignants emprunteurs',
        export_excel_data: 'Exporter les données Excel',
        loan_management: 'Gestion des prêts',
        loan_isbn_label: 'ISBN du livre',
        scan_barcode_title: 'Scanner le code-barres',
        book_title_label: 'Titre du livre',
        borrower_type_label: 'Type d\'emprunteur',
        student_option: 'Étudiant',
        teacher_option: 'Enseignant',
        borrower_name_label: 'Nom de l\'emprunteur',
        class_subject_label: 'Classe/Matière',
        loan_copies_label: 'Nombre de copies prêtées',
        available_copies_info: 'Copies disponibles :',
        loan_date_label: 'Date du prêt',
        return_date_label: 'Date de retour',
        loan_book_button: 'Prêter le livre',
        add_book_manually: 'Ajouter un livre manuellement',
        manual_isbn_label: 'ISBN',
        manual_title_label: 'Titre du livre',
        manual_copies_label: 'Nombre de copies',
        manual_subject_label: 'Matière',
        manual_level_label: 'Niveau',
        manual_language_label: 'Langue',
        manual_corner_name_label: 'Nom du coin',
        manual_corner_number_label: 'Numéro du coin',
        add_book_button: 'Ajouter le livre',
        upload_excel: 'Importer un fichier Excel',
        choose_excel_file_label: 'Choisir un fichier Excel',
        upload_file_button: 'Importer le fichier',
        inventory_search: 'Recherche et gestion de l\'inventaire',
        search_placeholder: 'Rechercher par titre, ISBN, matière...',
        refresh: 'Actualiser',
        save_all_changes: 'Sauvegarder les changements',
        previous_page: 'Précédent',
        next_page: 'Suivant',
        page_info: 'Page {currentPage} sur {totalPages}',
        copyright: '© 2025 Écoles Internationales Al-Kawthar - Tous droits réservés.',
        books_loaned_list: 'Liste des livres prêtés',
        student_borrowers_list: 'Liste des étudiants emprunteurs',
        teacher_borrowers_list: 'Liste des enseignants emprunteurs',
        search_in_loans: 'Rechercher par nom, titre ou ISBN...',
        extend_return_date: 'Prolonger la date de retour',
        current_return_date: 'Date de retour actuelle',
        new_return_date: 'Nouvelle date de retour',
        extend_loan: 'Prolonger le prêt',
        scan_barcode_modal_title: 'Scanner le code-barres',
        start_scan_button: 'Démarrer le scan',
        stop_scan_button: 'Arrêter le scan',
        code_detected_text: 'Code détecté :',
        use_this_code_button: 'Utiliser ce code',
        camera_help_text: 'Dirigez la caméra vers le code-barres pour un scan automatique',
        isbn: 'ISBN',
        title: 'Titre',
        total_copies: 'Copies Totales',
        loaned_copies: 'Copies Prêtées',
        available_copies: 'Copies Disponibles',
        subject: 'Matière',
        level: 'Niveau',
        language: 'Langue',
        corner_name: 'Nom du Coin',
        corner_number: 'N° du Coin',
        actions: 'Actions',
        edit: 'Modifier',
        delete: 'Supprimer',
        return_book: 'Retourner',
        extend: 'Prolonger',
        book_not_found: 'Livre introuvable',
        no_results: 'Aucun résultat.',
        select_a_valid_book: 'Veuillez d\'abord sélectionner un livre valide.',
        confirm_delete_title: 'Confirmer la suppression',
        confirm_delete_text: 'Êtes-vous sûr de vouloir supprimer le livre "{title}" ? Cette action est irréversible.',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        loan_limit_reached: 'L\'emprunteur a atteint la limite de prêts.',
        not_enough_copies: 'Pas assez de copies disponibles. Disponibles : {available}',
        select_book_title: 'Sélectionner un livre',
        multiple_books_found: 'Plusieurs livres trouvés avec cet ISBN. Veuillez sélectionner le bon livre à prêter :',
        loan_date_col: 'Date de prêt',
        return_date_col: 'Date de retour',
        overdue_days: 'Jours de retard',
    },
    en: {
        welcome_title: 'Welcome to Al-Kawthar International Schools Library',
        welcome_subtitle: 'Please enter your credentials to access the dashboard.',
        username_placeholder: 'Username',
        password_placeholder: 'Password',
        login_button: 'Login',
        dashboard_title: 'Al-Kawthar Library Dashboard',
        school_name: 'Al-Kawthar International Schools',
        logout: 'Logout',
        loading_data: 'Loading data...',
        overdue_books_title: 'Overdue Books',
        dismiss: 'Dismiss Alert',
        library_stats: 'Library Statistics',
        total_books: 'Total Books',
        loaned_books: 'Loaned Books',
        available_books: 'Available Books',
        copies_loaned: 'Copies Loaned',
        view_student_borrowers: 'View Student Borrowers',
        view_teacher_borrowers: 'View Teacher Borrowers',
        export_excel_data: 'Export Excel Data',
        loan_management: 'Loan Management',
        loan_isbn_label: 'Book ISBN',
        scan_barcode_title: 'Scan Barcode',
        book_title_label: 'Book Title',
        borrower_type_label: 'Borrower Type',
        student_option: 'Student',
        teacher_option: 'Teacher',
        borrower_name_label: 'Borrower Name',
        class_subject_label: 'Class/Subject',
        loan_copies_label: 'Number of Copies Loaned',
        available_copies_info: 'Available copies:',
        loan_date_label: 'Loan Date',
        return_date_label: 'Return Date',
        loan_book_button: 'Loan Book',
        add_book_manually: 'Add Book Manually',
        manual_isbn_label: 'ISBN',
        manual_title_label: 'Book Title',
        manual_copies_label: 'Number of Copies',
        manual_subject_label: 'Subject',
        manual_level_label: 'Level',
        manual_language_label: 'Language',
        manual_corner_name_label: 'Corner Name',
        manual_corner_number_label: 'Corner Number',
        add_book_button: 'Add Book',
        upload_excel: 'Upload Excel File',
        choose_excel_file_label: 'Choose Excel File',
        upload_file_button: 'Upload File',
        inventory_search: 'Inventory Search & Management',
        search_placeholder: 'Search by title, ISBN, or subject...',
        refresh: 'Refresh',
        save_all_changes: 'Save All Changes',
        previous_page: 'Previous',
        next_page: 'Next',
        page_info: 'Page {currentPage} of {totalPages}',
        copyright: '© 2025 Al-Kawthar International Schools - All rights reserved.',
        books_loaned_list: 'Loaned Books List',
        student_borrowers_list: 'Student Borrowers List',
        teacher_borrowers_list: 'Teacher Borrowers List',
        search_in_loans: 'Search by name, title, or ISBN...',
        extend_return_date: 'Extend Return Date',
        current_return_date: 'Current Return Date',
        new_return_date: 'New Return Date',
        extend_loan: 'Extend Loan',
        scan_barcode_modal_title: 'Scan Barcode',
        start_scan_button: 'Start Scan',
        stop_scan_button: 'Stop Scan',
        code_detected_text: 'Code Detected:',
        use_this_code_button: 'Use This Code',
        camera_help_text: 'Point the camera at the barcode for automatic scanning',
        isbn: 'ISBN',
        title: 'Title',
        total_copies: 'Total Copies',
        loaned_copies: 'Loaned Copies',
        available_copies: 'Available Copies',
        subject: 'Subject',
        level: 'Level',
        language: 'Language',
        corner_name: 'Corner Name',
        corner_number: 'Corner No.',
        actions: 'Actions',
        edit: 'Edit',
        delete: 'Delete',
        return_book: 'Return',
        extend: 'Extend',
        book_not_found: 'Book not found',
        no_results: 'No results found.',
        select_a_valid_book: 'Please select a valid book first.',
        confirm_delete_title: 'Confirm Deletion',
        confirm_delete_text: 'Are you sure you want to delete the book "{title}"? This action cannot be undone.',
        cancel: 'Cancel',
        confirm: 'Confirm',
        loan_limit_reached: 'The borrower has reached the maximum loan limit.',
        not_enough_copies: 'Not enough copies available. Available: {available}',
        select_book_title: 'Select a Book',
        multiple_books_found: 'Multiple books found with this ISBN. Please select the correct book to loan:',
        loan_date_col: 'Loan Date',
        return_date_col: 'Return Date',
        overdue_days: 'Overdue Days',
    }
};

// --- FONCTIONS UTILITAIRES ---

function getTranslatedText(key, replacements = {}) {
    let text = translations[currentLanguage]?.[key] || key;
    for (const placeholder in replacements) {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return text;
}

function updateTranslations() {
    document.querySelectorAll('[data-key]').forEach(el => {
        el.textContent = getTranslatedText(el.dataset.key);
    });
    document.querySelectorAll('[data-key-placeholder]').forEach(el => {
        el.placeholder = getTranslatedText(el.dataset.keyPlaceholder);
    });
    document.querySelectorAll('[data-key-title]').forEach(el => {
        el.title = getTranslatedText(el.dataset.keyTitle);
    });
    updatePaginationControls();
    if (document.getElementById('dashboard-page').style.display !== 'none') {
        renderTable(allBooks);
    }
}

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferred_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    updateTranslations();
}

function showLoadingBar() {
    document.getElementById('loading-bar').style.display = 'block';
}

function hideLoadingBar() {
    document.getElementById('loading-bar').style.display = 'none';
}

function formatDate(dateString) {
    if (!dateString) return '';
    // Utilise un format cohérent pour éviter les problèmes de fuseau horaire
    return new Date(dateString).toLocaleDateString(currentLanguage === 'en' ? 'en-CA' : 'fr-CA');
}


// --- LOGIQUE PRINCIPALE ---

document.addEventListener('DOMContentLoaded', () => {
    // --- Initialisation des éléments du DOM ---
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    const loginForm = document.getElementById('login-form');
    const loanForm = document.getElementById('loan-form');
    const manualBookForm = document.getElementById('manual-book-form');
    const searchInput = document.getElementById('search-input');

    // --- GESTION DE LA CONNEXION ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('username').value === 'Alkawthar@30' && document.getElementById('password').value === 'Alkawthar@30') {
            localStorage.setItem('isLoggedIn', 'true');
            showDashboard();
        } else {
            document.getElementById('login-error').textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        window.location.reload();
    });

    function showDashboard() {
        loginPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        const savedLang = localStorage.getItem('preferred_language') || 'ar';
        changeLanguage(savedLang);
        initializeBarcodeScanner();
        loadAllData();
    }

    if (localStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }

    // --- CHARGEMENT DES DONNÉES ---
    async function loadAllData() {
        if (isLoading) return;
        isLoading = true;
        showLoadingBar();
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
            console.error('Erreur de chargement des données:', error);
            alert('Failed to load data: ' + error.message);
        } finally {
            isLoading = false;
            hideLoadingBar();
        }
    }

    async function loadBooks(page = 1, search = '') {
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
            console.error("Erreur lors du chargement des livres:", error);
            document.getElementById('books-table-body').innerHTML = `<tr><td colspan="11">${error.message}</td></tr>`;
        }
    }

    async function loadAllLoansOnce() {
        if (allLoans.length > 0 && !isLoading) return;
        try {
            const response = await fetch(API_BASE_URL + '/api/loans/students'); // Exemple, pourrait être une route unifiée
            if (!response.ok) throw new Error('Failed to fetch loans');
            allLoans = await response.json();
        } catch (error) {
            console.error("Erreur lors du chargement des prêts:", error);
            allLoans = [];
        }
    }

    async function updateStatsFromAPI() {
        try {
            const response = await fetch(API_BASE_URL + '/api/statistics');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const stats = await response.json();
            document.getElementById('total-books-stat').textContent = stats.totalCopies || 0;
            document.getElementById('loaned-books-stat').textContent = stats.loanedCopies || 0;
            document.getElementById('available-books-stat').textContent = stats.availableCopies || 0;
            document.getElementById('copies-loaned-stat').textContent = stats.loanedCopies || 0;
        } catch (error) {
            console.error("Erreur lors de la mise à jour des statistiques:", error);
        }
    }

    // --- GESTION DU TABLEAU (AFFICHAGE, TRI, ACTIONS) ---
    function sortBooks(column) {
        const order = (currentSort.column === column && currentSort.order === 'asc') ? 'desc' : 'asc';
        currentSort = { column, order };
        allBooks.sort((a, b) => {
            const valA = a[column] || '';
            const valB = b[column] || '';
            if (typeof valA === 'number' && typeof valB === 'number') {
                return order === 'asc' ? valA - valB : valB - valA;
            }
            return order === 'asc' ? String(valA).localeCompare(String(valB), undefined, { numeric: true }) : String(valB).localeCompare(String(valA), undefined, { numeric: true });
        });
        renderTable(allBooks);
    }

    function renderTable(bookList) {
        const tableBody = document.getElementById('books-table-body');
        const tableHead = document.querySelector('#books-table thead');
        tableHead.innerHTML = `
            <tr>
                <th class="col-isbn" data-sort="isbn">${getTranslatedText('isbn')} <span class="sort-indicator">▲</span></th>
                <th class="col-title" data-sort="title">${getTranslatedText('title')} <span class="sort-indicator">▲</span></th>
                <th class="col-total" data-sort="totalCopies">${getTranslatedText('total_copies')} <span class="sort-indicator">▲</span></th>
                <th class="col-loaned" data-sort="loanedCopies">${getTranslatedText('loaned_copies')} <span class="sort-indicator">▲</span></th>
                <th class="col-available">${getTranslatedText('available_copies')}</th>
                <th class="col-subject" data-sort="subject">${getTranslatedText('subject')} <span class="sort-indicator">▲</span></th>
                <th class="col-level" data-sort="level">${getTranslatedText('level')} <span class="sort-indicator">▲</span></th>
                <th class="col-lang" data-sort="language">${getTranslatedText('language')} <span class="sort-indicator">▲</span></th>
                <th class="col-corner-name" data-sort="cornerName">${getTranslatedText('corner_name')} <span class="sort-indicator">▲</span></th>
                <th class="col-corner-num" data-sort="cornerNumber">${getTranslatedText('corner_number')} <span class="sort-indicator">▲</span></th>
                <th class="col-actions">${getTranslatedText('actions')}</th>
            </tr>`;
        tableHead.querySelectorAll('th[data-sort]').forEach(th => {
            if (th.dataset.sort === currentSort.column) th.classList.add('sorted', currentSort.order);
            th.addEventListener('click', () => sortBooks(th.dataset.sort));
        });
        tableBody.innerHTML = (bookList || []).map(book => {
            const availableCopies = (book.totalCopies || 0) - (book.loanedCopies || 0);
            return `
                <tr data-id="${book._id}" data-isbn="${book.isbn}">
                    <td class="col-isbn">${book.isbn || ''}</td>
                    <td class="col-title">${book.title || ''}</td>
                    <td class="col-total">${book.totalCopies || 0}</td>
                    <td class="col-loaned">${book.loanedCopies || 0}</td>
                    <td class="availability-cell ${availableCopies > 0 ? 'status-available' : 'status-unavailable'}">${availableCopies}</td>
                    <td class="col-subject">${book.subject || ''}</td>
                    <td class="col-level">${book.level || ''}</td>
                    <td class="col-lang">${book.language || ''}</td>
                    <td class="col-corner-name">${book.cornerName || ''}</td>
                    <td class="col-corner-num">${book.cornerNumber || ''}</td>
                    <td class="col-actions action-buttons">
                         <button class="btn-small btn-primary edit-book-btn" title="${getTranslatedText('edit')}"><i class="fas fa-edit"></i></button>
                         <button class="btn-small btn-danger delete-book-btn" title="${getTranslatedText('delete')}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        }).join('');
        addTableActionListeners();
    }

    function addTableActionListeners() {
        document.querySelectorAll('.delete-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const bookId = row.dataset.id;
                const bookTitle = row.querySelector('.col-title').textContent;
                if (confirm(getTranslatedText('confirm_delete_text', { title: bookTitle }))) {
                    deleteBook(bookId);
                }
            });
        });
        // Listener pour l'édition à ajouter ici si nécessaire
    }

    async function deleteBook(bookId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, { method: 'DELETE' });
            if (response.ok) {
                await loadAllData();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            alert(`Network error: ${error.message}`);
        }
    }
    
    // --- GESTION DES PRÊTS ET ISBN MULTIPLES ---
    document.getElementById('loan-isbn').addEventListener('change', async (e) => {
        const isbn = e.target.value.trim();
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

    function populateLoanForm(book) {
        const loanTitleEl = document.getElementById('loan-book-title');
        const availableCopiesEl = document.getElementById('available-copies-display');
        const loanCopiesInput = document.getElementById('loan-copies');

        if (!book) {
            loanTitleEl.textContent = getTranslatedText('book_not_found');
            availableCopiesEl.textContent = '-';
            loanForm.dataset.bookId = '';
            return;
        }
        loanTitleEl.textContent = book.title;
        const available = (book.totalCopies || 0) - (book.loanedCopies || 0);
        availableCopiesEl.textContent = available;
        loanCopiesInput.max = available;
        loanCopiesInput.disabled = available <= 0;
        loanForm.dataset.bookId = book._id;
    }

    function showBookSelectionModal(books) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <button class="close-modal-btn">&times;</button>
            <h2>${getTranslatedText('select_book_title')}</h2>
            <div class="modal-content">
                <p>${getTranslatedText('multiple_books_found')}</p>
                <ul id="book-selection-list" style="list-style: none; padding: 0;"></ul>
            </div>`;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        const list = modal.querySelector('#book-selection-list');
        books.forEach(book => {
            const li = document.createElement('li');
            li.textContent = `${book.title} (${getTranslatedText('available_copies')}: ${book.totalCopies - book.loanedCopies})`;
            li.style.cursor = 'pointer';
            li.style.padding = '10px';
            li.style.borderBottom = '1px solid #eee';
            li.dataset.bookId = book._id;
            li.addEventListener('click', () => {
                const selectedBook = books.find(b => b._id === li.dataset.bookId);
                populateLoanForm(selectedBook);
                document.body.removeChild(overlay);
            });
            list.appendChild(li);
        });
        const close = () => document.body.removeChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        modal.querySelector('.close-modal-btn').addEventListener('click', close);
    }
    
    loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookId = loanForm.dataset.bookId;
        if (!bookId) {
            alert(getTranslatedText('select_a_valid_book'));
            return;
        }
        const loanData = {
            bookId,
            studentName: document.getElementById('student-name').value,
            studentClass: document.getElementById('student-class').value,
            borrowerType: document.getElementById('borrower-type').value,
            loanDate: document.getElementById('loan-date').value || new Date().toISOString().split('T')[0],
            returnDate: document.getElementById('return-date').value,
            copiesCount: parseInt(document.getElementById('loan-copies').value) || 1
        };
        try {
            await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loanData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            loanForm.reset();
            populateLoanForm(null);
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
    
    // --- AUTRES FORMULAIRES ---
    manualBookForm.addEventListener('submit', async (e) => {
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
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            manualBookForm.reset();
            await loadAllData();
        } catch (error) {
            alert(`Erreur d'ajout: ${error.message}`);
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
    }

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadBooks(1, e.target.value);
        }, 300);
    });
    document.getElementById('prev-page-btn').addEventListener('click', () => { if (currentPage > 1) loadBooks(currentPage - 1, searchInput.value); });
    document.getElementById('next-page-btn').addEventListener('click', () => { if (currentPage < totalPages) loadBooks(currentPage + 1, searchInput.value); });
    
    // --- MODALES ET AUTRES FONCTIONNALITÉS ---
    async function displayLoans(type) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('loans-modal-title');
        const wrapper = document.getElementById('loans-modal-content-wrapper');
        const endpoint = type === 'students' ? '/api/loans/students' : '/api/loans/teachers';
        modalTitle.textContent = getTranslatedText(type === 'students' ? 'student_borrowers_list' : 'teacher_borrowers_list');
        wrapper.innerHTML = `<p>${getTranslatedText('loading_data')}</p>`;
        modalOverlay.style.display = 'flex';
        try {
            let loans = [];
            console.log(`Chargement des prêts pour: ${loanType}`);
            
            if (loanType === 'students') {
                const response = await fetch('/api/loans/students');
                console.log('Réponse API étudiants:', response.status, response.statusText);
                if (!response.ok) {
                    throw new Error(`Erreur API: ${response.status}`);
                }
                loans = await response.json();
                console.log('Prêts étudiants reçus:', loans);
                loansModalTitle.textContent = translations[currentLanguage].student_borrowers_list;
            } else {
                const response = await fetch('/api/loans/teachers');
                console.log('Réponse API enseignants:', response.status, response.statusText);
                if (!response.ok) {
                    throw new Error(`Erreur API: ${response.status}`);
                }
                loans = await response.json();
                console.log('Prêts enseignants reçus:', loans);
                loansModalTitle.textContent = translations[currentLanguage].teacher_borrowers_list;
            }
            
            if (!loans || loans.length === 0) {
                console.log('Aucun prêt trouvé pour', loanType);
                const noResultsText = currentLanguage === 'ar' ? 'لا توجد نتائج مطابقة.' : 
                                    currentLanguage === 'fr' ? 'Aucun résultat correspondant.' : 'No matching results.';
                loansModalContent.innerHTML = `<p style="text-align: center; padding: 1rem; color: #666;">
                    <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                    ${noResultsText}
                    <br><small style="margin-top: 0.5rem; display: block;">Vérifiez que des prêts sont enregistrés dans le système.</small>
                </p>`;
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
            console.error('Erreur dans displayLoans:', error);
            const errorMessage = currentLanguage === 'ar' ? 'خطأ في تحميل البيانات' : 
                               currentLanguage === 'fr' ? 'Erreur de chargement des données' : 'Error loading data';
            loansModalContent.innerHTML = `<p style="text-align: center; padding: 1rem; color: red;">
                <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
                ${errorMessage}
                <br><small style="margin-top: 0.5rem; display: block; color: #666;">Détails: ${error.message}</small>
            </p>`;
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
            wrapper.innerHTML = `<p>${error.message}</p>`;
        }
    }
    document.getElementById('view-student-loans-btn').addEventListener('click', () => displayLoans('students'));
    document.getElementById('view-teacher-loans-btn').addEventListener('click', () => displayLoans('teachers'));
    document.querySelector('#modal-overlay .close-modal-btn').addEventListener('click', () => {
        document.getElementById('modal-overlay').style.display = 'none';
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
        document.getElementById('dismiss-alert').addEventListener('click', () => {
            overdueNotifications.style.display = 'none';
        });
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
        const barcodeModal = document.getElementById('barcode-modal-overlay');
        const video = document.getElementById('barcode-video');
        const startBtn = document.getElementById('start-camera-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        let currentTargetInput = null;

        const openScanner = (targetInputId) => {
            currentTargetInput = document.getElementById(targetInputId);
            barcodeModal.style.display = 'flex';
        };

        document.getElementById('scan-barcode-btn').addEventListener('click', () => openScanner('loan-isbn'));
        document.getElementById('scan-search-barcode-btn').addEventListener('click', () => openScanner('search-input'));
        
        startBtn.addEventListener('click', async () => {
            try {
                barcodeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = barcodeStream;
                video.play();
                startBtn.style.display = 'none';
                stopBtn.style.display = 'block';
                scanFrame();
            } catch (err) {
                alert("Erreur de caméra: " + err);
            }
        });

        const stopScanning = () => {
            if (barcodeStream) {
                barcodeStream.getTracks().forEach(track => track.stop());
                barcodeStream = null;
            }
            video.srcObject = null;
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
        };

        stopBtn.addEventListener('click', stopScanning);

        function scanFrame() {
            if (!barcodeStream || video.readyState !== video.HAVE_ENOUGH_DATA) {
                return;
            }
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                document.getElementById('barcode-value').textContent = code.data;
                document.getElementById('barcode-result').style.display = 'block';
            } else {
                requestAnimationFrame(scanFrame);
            }
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
            barcodeModal.style.display = 'none';
            stopScanning();
        });

        document.getElementById('close-barcode-modal').addEventListener('click', () => {
            barcodeModal.style.display = 'none';
            stopScanning();
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

    document.getElementById('refresh-books-btn').addEventListener('click', loadAllData);
});
