// Configuration de l'API
const API_BASE_URL = '';

// Variables globales
let allBooks = [];
let allLoans = [];
let currentLoanType = 'students';
let currentLanguage = 'ar';
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let currentSort = { column: 'title', order: 'asc' };
let barcodeStream = null;
let pendingChanges = [];

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
        not_enough_copies: 'لا توجد نسخ كافية متاحة. المتاح: {available}',
        loan_date_col: 'تاريخ الإعارة',
        return_date_col: 'تاريخ الإرجاع',
        overdue_days: 'أيام التأخير',
        copies_count: 'عدد النسخ',
        student_name: 'اسم الطالب',
        teacher_name: 'اسم المدرس',
        class_section: 'الصف/الشعبة',
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
        not_enough_copies: 'Pas assez de copies disponibles. Disponibles : {available}',
        loan_date_col: 'Date de prêt',
        return_date_col: 'Date de retour',
        overdue_days: 'Jours de retard',
        copies_count: 'Nombre de copies',
        student_name: 'Nom de l\'étudiant',
        teacher_name: 'Nom de l\'enseignant',
        class_section: 'Classe/Section',
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
        not_enough_copies: 'Not enough copies available. Available: {available}',
        loan_date_col: 'Loan Date',
        return_date_col: 'Return Date',
        overdue_days: 'Overdue Days',
        copies_count: 'Number of Copies',
        student_name: 'Student Name',
        teacher_name: 'Teacher Name',
        class_section: 'Class/Section',
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
        const translatedText = getTranslatedText(el.dataset.key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = translatedText;
        } else if (el.tagName === 'OPTION') {
            el.textContent = translatedText;
        } else {
            el.textContent = translatedText;
        }
    });
    document.querySelectorAll('[data-key-placeholder]').forEach(el => {
        el.placeholder = getTranslatedText(el.dataset.keyPlaceholder);
    });
    document.querySelectorAll('[data-key-title]').forEach(el => {
        el.title = getTranslatedText(el.dataset.keyTitle);
    });
    if (typeof updatePaginationControls === 'function') {
        updatePaginationControls();
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
    if (document.getElementById('dashboard-page').style.display !== 'none') {
        renderTable(allBooks);
    }
}

function showLoadingBar(text = '') {
    const loadingBar = document.getElementById('loading-bar');
    const loadingDetails = document.getElementById('loading-details');
    loadingBar.style.display = 'block';
    if (text) {
        loadingDetails.innerHTML = `<small>${text}</small>`;
    }
}

function updateLoadingProgress(percentage, text = '') {
    const progressFill = document.getElementById('progress-fill');
    const loadingPercentage = document.getElementById('loading-percentage');
    const loadingDetails = document.getElementById('loading-details');
    
    progressFill.style.width = percentage + '%';
    loadingPercentage.textContent = Math.round(percentage) + '%';
    
    if (text) {
        loadingDetails.innerHTML = `<small>${text}</small>`;
    }
}

function hideLoadingBar() {
    setTimeout(() => {
        document.getElementById('loading-bar').style.display = 'none';
        document.getElementById('progress-fill').style.width = '0%';
    }, 500);
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(currentLanguage === 'en' ? 'en-CA' : 'fr-CA');
}

function formatDateByLanguage(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    if (currentLanguage === 'ar') {
        return date.toLocaleDateString('ar-SA', options);
    } else if (currentLanguage === 'fr') {
        return date.toLocaleDateString('fr-FR', options);
    } else {
        return date.toLocaleDateString('en-US', options);
    }
}

function updatePaginationControls() {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const controls = document.getElementById('pagination-controls');

    if (totalPages > 0) {
        controls.style.display = 'flex';
        pageInfo.textContent = getTranslatedText('page_info', { 
            currentPage: currentPage, 
            totalPages: totalPages 
        });
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
    } else {
        controls.style.display = 'none';
    }
}

// --- LOGIQUE PRINCIPALE ---

document.addEventListener('DOMContentLoaded', () => {
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

    async function showDashboard() {
        console.log('🚀 showDashboard() appelée');
        loginPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        const savedLang = localStorage.getItem('preferred_language') || 'ar';
        changeLanguage(savedLang);
        initializeDates();
        initializeBarcodeScanner();
        
        // Charger les données immédiatement avec gestion d'erreur améliorée
        try {
            console.log('🔍 Vérification de la connexion à l\'API...');
            const apiCheck = await fetch('/api', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            console.log('📡 Réponse API:', apiCheck.status, apiCheck.statusText);
            
            if (apiCheck.ok) {
                const apiInfo = await apiCheck.json();
                console.log('✅ API connectée:', apiInfo);
                // Charger les données immédiatement
                await loadAllData();
            } else {
                const errorText = await apiCheck.text();
                console.error('❌ Erreur API:', apiCheck.status, errorText);
                throw new Error(`API returned ${apiCheck.status}: ${apiCheck.statusText}`);
            }
        } catch (error) {
            console.error('❌ Erreur de connexion à l\'API:', error);
            console.error('📋 Détails:', {
                message: error.message,
                stack: error.stack,
                url: window.location.href
            });
            
            // Afficher l'erreur à l'utilisateur
            hideLoadingBar();
            alert(`⚠️ Erreur de connexion à la base de données:\n${error.message}\n\nVérifiez que la variable MONGODB_URI est configurée sur Vercel.`);
            
            // Réinitialiser l'état de chargement
            isLoading = false;
        }
    }

    // Initialiser les dates par défaut dans les formulaires
    function initializeDates() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Date de prêt par défaut (aujourd'hui)
        const loanDateInput = document.getElementById('loan-date');
        if (loanDateInput) {
            loanDateInput.value = todayStr;
        }
        
        // Date de retour par défaut (dans 2 semaines)
        const returnDateInput = document.getElementById('return-date');
        if (returnDateInput) {
            const twoWeeksLater = new Date(today);
            twoWeeksLater.setDate(today.getDate() + 14);
            returnDateInput.value = twoWeeksLater.toISOString().split('T')[0];
            returnDateInput.min = todayStr;
        }
    }

    // Vérifier si déjà connecté et afficher le dashboard
    console.log('🔍 Vérification de l\'état de connexion...');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    console.log('📊 État de connexion:', isLoggedIn);
    
    if (isLoggedIn) {
        console.log('✅ Utilisateur déjà connecté - Affichage du dashboard');
        showDashboard().catch(err => {
            console.error('❌ Erreur lors de l\'affichage du dashboard:', err);
        });
    } else {
        console.log('⚠️ Utilisateur non connecté - Affichage de la page de connexion');
        loginPage.style.display = 'flex';
    }

    // Gestion des langues - FIX: Assurer que les boutons fonctionnent
    function initializeLanguageButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.dataset.lang || btn.getAttribute('data-lang');
                if (lang) {
                    console.log('🌍 Changement de langue vers:', lang);
                    changeLanguage(lang);
                }
            });
        });
    }
    
    // Appeler immédiatement
    initializeLanguageButtons();

    // --- CHARGEMENT DES DONNÉES DEPUIS MONGODB ---
    async function loadAllData() {
        if (isLoading) return;
        isLoading = true;
        showLoadingBar('اتصال بقاعدة البيانات MongoDB...');
        updateLoadingProgress(10, 'جاري الاتصال...');
        
        try {
            console.log('🔄 Chargement COMPLET des données depuis MongoDB...');
            
            // Étape 1: Charger TOUS les livres (sans limite)
            updateLoadingProgress(20, 'تحميل جميع الكتب...');
            const searchValue = searchInput ? searchInput.value || '' : '';
            const booksUrl = `/api/books?page=1&limit=10000&search=${encodeURIComponent(searchValue)}`;
            
            console.log('📡 Requête:', booksUrl);
            const booksResponse = await fetch(booksUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            console.log('📥 Réponse reçue:', booksResponse.status, booksResponse.statusText);
            
            if (!booksResponse.ok) {
                const errorText = await booksResponse.text();
                console.error('❌ Erreur HTTP:', errorText);
                throw new Error(`HTTP ${booksResponse.status}: ${booksResponse.statusText}\n${errorText}`);
            }
            
            updateLoadingProgress(40, 'معالجة بيانات الكتب...');
            const booksData = await booksResponse.json();
            console.log('✅ Données reçues:', {
                booksCount: booksData.books?.length || 0,
                page: booksData.page,
                totalPages: booksData.totalPages,
                totalBooks: booksData.totalBooks
            });
            
            allBooks = booksData.books || [];
            totalPages = Math.ceil(allBooks.length / 50);
            
            console.log(`📚 ${allBooks.length} livres chargés depuis MongoDB`);
            updateLoadingProgress(60, `تم تحميل ${allBooks.length} كتاب`);
            
            // Étape 2: Charger les statistiques
            updateLoadingProgress(70, 'تحميل الإحصائيات...');
            await updateStatsFromAPI();
            
            // Étape 3: Afficher les données
            updateLoadingProgress(80, 'عرض البيانات...');
            updatePaginationControls();
            renderTable(allBooks.slice((currentPage - 1) * 50, currentPage * 50));
            
            // Étape 4: Charger les prêts actifs
            if (!searchValue) {
                try {
                    updateLoadingProgress(90, 'تحميل الإعارات النشطة...');
                    const loansResponse = await fetch('/api/loans');
                    if (loansResponse.ok) {
                        allLoans = await loansResponse.json();
                        console.log(`📋 ${allLoans.length} prêts chargés depuis MongoDB`);
                    }
                    checkOverdueBooks();
                } catch (loanError) {
                    console.error('Erreur chargement prêts:', loanError);
                }
            }
            
            updateLoadingProgress(100, 'اكتمل التحميل! ✓');
            setTimeout(() => updateTranslations(), 200);
        } catch (error) {
            console.error('❌ Erreur de chargement:', error);
            updateLoadingProgress(0, '❌ خطأ في التحميل');
            
            const errorMsg = currentLanguage === 'ar' ? 'خطأ في الاتصال بقاعدة البيانات MongoDB' : 
                             currentLanguage === 'fr' ? 'Erreur de connexion à MongoDB' : 
                             'MongoDB connection error';
            
            alert(`${errorMsg}\n\nDétails: ${error.message}`);
            renderTable([]);
        } finally {
            isLoading = false;
            hideLoadingBar();
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

    function checkOverdueBooks() {
        const today = new Date();
        const overdueLoans = allLoans.filter(loan => {
            const returnDate = new Date(loan.returnDate);
            return returnDate < today;
        });

        if (overdueLoans.length > 0) {
            const overdueList = document.getElementById('overdue-list');
            overdueList.innerHTML = overdueLoans.map(loan => {
                const daysOverdue = Math.floor((today - new Date(loan.returnDate)) / (1000 * 60 * 60 * 24));
                return `<p>📕 ${loan.title} - ${loan.studentName} (${daysOverdue} ${getTranslatedText('overdue_days')})</p>`;
            }).join('');
            document.getElementById('overdue-notifications').style.display = 'block';
        }
    }

    document.getElementById('dismiss-alert').addEventListener('click', () => {
        document.getElementById('overdue-notifications').style.display = 'none';
    });

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
    }

    async function deleteBook(bookId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, { method: 'DELETE' });
            if (response.ok) {
                await loadAllData();
                alert('تم حذف الكتاب بنجاح!');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            alert(`Network error: ${error.message}`);
        }
    }

    // --- GESTION DES PRÊTS ---
    const bookTitleElement = document.getElementById('loan-book-title');
    const availableCopiesDisplay = document.getElementById('available-copies-display');
    const loanCopiesInput = document.getElementById('loan-copies');

    document.getElementById('loan-isbn').addEventListener('change', async (e) => {
        const isbn = e.target.value.trim();
        if (!isbn) {
            bookTitleElement.textContent = '-';
            availableCopiesDisplay.textContent = '-';
            return;
        }
        
        let book = allBooks.find(b => b.isbn === isbn);
        
        if (!book && isbn.length >= 10) {
            try {
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
            loanForm.dataset.bookId = book._id;
            
            if (availableCopies === 0) {
                loanCopiesInput.disabled = true;
                availableCopiesDisplay.style.color = 'red';
            } else {
                loanCopiesInput.disabled = false;
                availableCopiesDisplay.style.color = 'green';
            }
        } else {
            bookTitleElement.textContent = getTranslatedText('book_not_found');
            bookTitleElement.style.color = 'red';
            loanForm.dataset.bookId = '';
        }
    });

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
            const response = await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loanData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            loanForm.reset();
            bookTitleElement.textContent = '-';
            availableCopiesDisplay.textContent = '-';
            loanForm.dataset.bookId = '';
            await loadAllData();
            alert('تم إعارة الكتاب بنجاح!');
        } catch (error) {
            alert('خطأ في إعارة الكتاب: ' + error.message);
        }
    });

    // Voir les prêts étudiants/enseignants
    document.getElementById('view-student-loans-btn').addEventListener('click', () => {
        currentLoanType = 'students';
        displayLoans('students');
    });

    document.getElementById('view-teacher-loans-btn').addEventListener('click', () => {
        currentLoanType = 'teachers';
        displayLoans('teachers');
    });

    async function displayLoans(type) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('loans-modal-title');
        const wrapper = document.getElementById('loans-modal-content-wrapper');
        const endpoint = type === 'students' ? '/api/loans/students' : '/api/loans/teachers';
        
        modalTitle.textContent = getTranslatedText(type === 'students' ? 'student_borrowers_list' : 'teacher_borrowers_list');
        wrapper.innerHTML = `<p>${getTranslatedText('loading_data')}</p>`;
        modalOverlay.style.display = 'flex';
        
        try {
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
            const loans = await response.json();
            
            if (!loans || loans.length === 0) {
                wrapper.innerHTML = `<p style="text-align: center; padding: 1rem; color: #666;">
                    <i class="fas fa-info-circle"></i> ${getTranslatedText('no_results')}
                </p>`;
                return;
            }
            
            const nameLabel = type === 'teachers' ? getTranslatedText('teacher_name') : getTranslatedText('student_name');
            const classLabel = type === 'teachers' ? getTranslatedText('subject') : getTranslatedText('class_section');
            const isRtl = currentLanguage === 'ar';
            const textAlign = isRtl ? 'right' : 'left';
            
            let tableHTML = `<table id="loans-table" style="width: 100%; text-align: ${textAlign}; direction: ${isRtl ? 'rtl' : 'ltr'}; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: ${textAlign}; padding: 12px; background: var(--primary-color); color: white;">${nameLabel}</th>
                        <th style="text-align: ${textAlign}; padding: 12px; background: var(--primary-color); color: white;">${classLabel}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('isbn')}</th>
                        <th style="text-align: ${textAlign}; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('book_title_label')}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('copies_count')}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('loan_date_col')}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('return_date_col')}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('overdue_days')}</th>
                        <th style="text-align: center; padding: 12px; background: var(--primary-color); color: white;">${getTranslatedText('actions')}</th>
                    </tr>
                </thead>
                <tbody>`;
            
            for (const loan of loans) {
                const bookTitle = loan.title || getTranslatedText('book_not_found');
                const isbn = loan.isbn || '-';
                const copiesCount = loan.copiesCount || 1;
                
                const currentDate = new Date();
                const returnDate = new Date(loan.returnDate);
                const daysOverdue = Math.floor((currentDate - returnDate) / (1000 * 60 * 60 * 24));
                
                let overdueClass = daysOverdue > 0 ? (daysOverdue >= 7 ? 'critical' : daysOverdue >= 3 ? 'moderate' : 'recent') : daysOverdue === 0 ? 'today' : 'future';
                let overdueText = daysOverdue > 0 ? `${daysOverdue} ${getTranslatedText('overdue_days')}` : daysOverdue === 0 ? getTranslatedText('due_today') : `${Math.abs(daysOverdue)} days remaining`;
                
                tableHTML += `<tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${loan.studentName}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${loan.studentClass || '-'}</td>
                    <td style="text-align: center; padding: 12px; border-bottom: 1px solid #e0e0e0; font-family: monospace;">${isbn}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${bookTitle}</td>
                    <td style="text-align: center; padding: 12px; border-bottom: 1px solid #e0e0e0;"><span class="copies-badge">${copiesCount}</span></td>
                    <td style="text-align: center; padding: 12px; border-bottom: 1px solid #e0e0e0;">${formatDateByLanguage(loan.loanDate)}</td>
                    <td style="text-align: center; padding: 12px; border-bottom: 1px solid #e0e0e0;">${formatDateByLanguage(loan.returnDate)}</td>
                    <td style="text-align: center; padding: 12px; border-bottom: 1px solid #e0e0e0;"><span class="overdue-status ${overdueClass}">${overdueText}</span></td>
                    <td style="text-align: center; padding: 12px; border-bottom: 1px solid #e0e0e0;">
                        <button class="btn-action btn-return" data-isbn="${loan.isbn}" data-student="${loan.studentName}">
                            <i class="fas fa-undo"></i> ${getTranslatedText('return_book')}
                        </button>
                        <button class="btn-action btn-extend" data-isbn="${loan.isbn}" data-student="${loan.studentName}" data-current-date="${loan.returnDate}">
                            <i class="fas fa-calendar-plus"></i> ${getTranslatedText('extend')}
                        </button>
                    </td>
                </tr>`;
            }
            
            tableHTML += '</tbody></table>';
            wrapper.innerHTML = tableHTML;
            
            document.querySelectorAll('.btn-return').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const isbn = e.currentTarget.dataset.isbn;
                    const studentName = e.currentTarget.dataset.student;
                    await returnLoan(isbn, studentName);
                    displayLoans(type);
                });
            });
            
            document.querySelectorAll('.btn-extend').forEach(button => {
                button.addEventListener('click', (e) => {
                    const isbn = e.currentTarget.dataset.isbn;
                    const studentName = e.currentTarget.dataset.student;
                    const currentDate = e.currentTarget.dataset.currentDate;
                    const loan = loans.find(l => l.isbn === isbn && l.studentName === studentName);
                    if (loan) {
                        showExtendDateModal(loan, { title: loan.title });
                    }
                });
            });
        } catch (error) {
            console.error('Erreur dans displayLoans:', error);
            wrapper.innerHTML = `<p style="text-align: center; padding: 1rem; color: red;">
                <i class="fas fa-exclamation-triangle"></i> ${error.message}
            </p>`;
        }
    }

    async function returnLoan(isbn, studentName) {
        try {
            const response = await fetch('/api/loans', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isbn, studentName })
            });
            if (!response.ok) throw new Error('Erreur lors du retour');
            await loadAllData();
            alert('تم إرجاع الكتاب بنجاح!');
        } catch (error) {
            alert('خطأ في إرجاع الكتاب: ' + error.message);
        }
    }

    document.querySelector('#modal-overlay .close-modal-btn').addEventListener('click', () => {
        document.getElementById('modal-overlay').style.display = 'none';
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

    // --- FORMULAIRE D'AJOUT MANUEL ---
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
            alert('تم إضافة الكتاب بنجاح!');
        } catch (error) {
            alert(`خطأ في الإضافة: ${error.message}`);
        }
    });

    // Upload Excel
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

    // Recherche
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadAllData();
        }, 300);
    });

    document.getElementById('prev-page-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadAllData();
        }
    });
    
    document.getElementById('next-page-btn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadAllData();
        }
    });

    document.getElementById('refresh-books-btn').addEventListener('click', async () => {
        await loadAllData();
        alert('تم تحديث البيانات بنجاح!');
    });

    // --- SCANNER DE CODE-BARRES ---
    function initializeBarcodeScanner() {
        const barcodeModal = document.getElementById('barcode-modal-overlay');
        const video = document.getElementById('barcode-video');
        const startBtn = document.getElementById('start-camera-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        const useBtn = document.getElementById('use-barcode-btn');
        let currentTargetInput = null;

        const openScanner = (targetInputId) => {
            currentTargetInput = document.getElementById(targetInputId);
            barcodeModal.style.display = 'flex';
            document.getElementById('barcode-result').style.display = 'none';
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
                alert("Erreur de caméra: " + err.message);
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
                requestAnimationFrame(scanFrame);
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
                stopScanning();
            } else {
                requestAnimationFrame(scanFrame);
            }
        }

        useBtn.addEventListener('click', () => {
            const code = document.getElementById('barcode-value').textContent;
            if (currentTargetInput && code) {
                currentTargetInput.value = code;
                currentTargetInput.dispatchEvent(new Event('change'));
            }
            barcodeModal.style.display = 'none';
            stopScanning();
        });

        document.getElementById('close-barcode-modal').addEventListener('click', () => {
            barcodeModal.style.display = 'none';
            stopScanning();
        });
    }

    // --- EXTENSION DE DATE DE RETOUR ---
    function showExtendDateModal(loan, book) {
        const extendModal = document.getElementById('extend-date-modal-overlay');
        const borrowerNameEl = document.getElementById('extend-borrower-name');
        const bookTitleEl = document.getElementById('extend-book-title');
        const currentDateEl = document.getElementById('extend-current-date');
        const newDateEl = document.getElementById('extend-new-date');
        
        borrowerNameEl.textContent = loan.studentName;
        bookTitleEl.textContent = book.title || loan.title || 'Titre non disponible';
        currentDateEl.textContent = formatDateByLanguage(loan.returnDate);
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        newDateEl.min = tomorrow.toISOString().split('T')[0];
        
        const oneWeekLater = new Date(loan.returnDate);
        oneWeekLater.setDate(oneWeekLater.getDate() + 7);
        newDateEl.value = oneWeekLater.toISOString().split('T')[0];
        
        extendModal.dataset.isbn = loan.isbn;
        extendModal.dataset.student = loan.studentName;
        
        extendModal.style.display = 'flex';
    }

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
            try {
                const response = await fetch('/api/loans/extend', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isbn, studentName, newReturnDate: newDate })
                });
                
                if (response.ok) {
                    alert('تم تمديد فترة الإعارة بنجاح!');
                    await loadAllData();
                    displayLoans(currentLoanType);
                    extendModal.style.display = 'none';
                } else {
                    throw new Error('Failed to extend loan');
                }
            } catch (error) {
                console.error('Error extending loan:', error);
                alert('خطأ في تمديد فترة الإعارة');
            }
        }
    });

    document.getElementById('extend-date-modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            e.currentTarget.style.display = 'none';
        }
    });
});
