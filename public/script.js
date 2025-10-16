document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ET VARIABLES GLOBALES ---
    const API_BASE_URL = ''; // CORRECTION CRITIQUE: Utiliser une URL relative pour Vercel
    let allBooks = [];
    let currentLanguage = 'ar';
    let pendingChanges = []; // NOUVEAU: Pour stocker les modifications en attente

    // --- ÉLÉMENTS DU DOM ---
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    const loginForm = document.getElementById('login-form');
    const modalOverlay = document.getElementById('modal-overlay');

    // --- TRADUCTIONS ---
    const translations = {
        ar: {
            // ... (toutes les clés de traduction en arabe)
            save_all_changes: 'حفظ جميع التغييرات',
            saving_changes: 'جاري الحفظ...',
            changes_saved_success: 'تم حفظ التغييرات بنجاح!',
            confirm_delete: 'هل أنت متأكد من حذف هذا الكتاب؟',
            delete_success: 'تم حذف الكتاب بنجاح.',
            loan_success: 'تمت إعارة الكتاب بنجاح!',
            return_success: 'تم إرجاع الكتاب بنجاح!',
            extend_success: 'تم تمديد فترة الإعارة بنجاح!',
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
            active_loans: 'عدد الإعارات',
            inventory_search: 'البحث في المخزون وإدارة الكتب',
            search_placeholder: 'ابحث بالعنوان أو ISBN أو المادة...',
            refresh: 'تحديث',
            books_loaned_list: 'قائمة الكتب المعارة',
            student_borrowers_list: 'قائمة الطلاب المستعيرين',
            teacher_borrowers_list: 'قائمة المدرسين المستعيرين',
            extend_return_date: 'تمديد فترة الارجاع',
            new_return_date: 'تاريخ الإرجاع الجديد',
            extend_loan: 'تمديد الإعارة',
            current_return_date: 'تاريخ الإرجاع الحالي',
            return_book: 'إرجاع',
            borrower_name: 'اسم المستعير',
            class_section: 'الصف/القسم',
            loan_date_col: 'تاريخ الإعارة',
            return_date_col: 'تاريخ الإرجاع',
            isbn: 'ISBN',
            title: 'العنوان',
            total_copies: 'إجمالي النسخ',
            loaned_copies: 'النسخ المعارة',
            available_copies: 'النسخ المتاحة',
            subject: 'المادة',
            actions: 'الإجراءات',
            book_title: 'عنوان الكتاب',
            book_not_found: 'كتاب غير موجود',
            loan_management: 'إدارة الإعارة',
            add_book_manually: 'إضافة كتاب يدوياً',
            view_student_borrowers: 'عرض الطلاب المستعيرين',
            view_teacher_borrowers: 'عرض المدرسين المستعيرين',
            export_excel_data: 'تحميل بيانات Excel',
            book_isbn_label: 'ISBN الكتاب',
            book_title_label: 'عنوان الكتاب',
            borrower_type_label: 'نوع المستعير',
            student: 'طالب',
            teacher: 'مدرس/ة',
            borrower_name_label: 'اسم المستعير',
            class_subject_label: 'الفصل/المادة',
            loan_date_label: 'تاريخ الإعارة',
            return_date_label: 'تاريخ التسليم',
            loan_book_button: 'إعارة الكتاب',
            total_copies_label: 'عدد النسخ',
            optional_placeholder: 'اختياري',
            add_book_button: 'إضافة الكتاب',
            select_book_title: 'تحديد الكتاب',
            select_book_subtitle: 'تم العثور على عدة كتب بنفس الـ ISBN. الرجاء تحديد الكتاب الصحيح للإعارة.'
        },
        fr: {
            // ... (toutes les clés de traduction en français)
             save_all_changes: 'Sauvegarder les changements',
            saving_changes: 'Sauvegarde...',
            changes_saved_success: 'Changements sauvegardés avec succès !',
            confirm_delete: 'Êtes-vous sûr de vouloir supprimer ce livre ?',
            delete_success: 'Livre supprimé avec succès.',
            loan_success: 'Livre prêté avec succès !',
            return_success: 'Livre retourné avec succès !',
            extend_success: 'Prêt prolongé avec succès !',
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
            active_loans: 'Nombre de prêts',
            inventory_search: 'Recherche et gestion de l\'inventaire',
            search_placeholder: 'Rechercher par titre, ISBN ou matière...',
            refresh: 'Actualiser',
            books_loaned_list: 'Liste des livres prêtés',
            student_borrowers_list: 'Liste des étudiants emprunteurs',
            teacher_borrowers_list: 'Liste des enseignants emprunteurs',
            extend_return_date: 'Prolonger la date de retour',
            new_return_date: 'Nouvelle date de retour',
            extend_loan: 'Prolonger le prêt',
            current_return_date: 'Date de retour actuelle',
            return_book: 'Retourner',
            borrower_name: 'Nom de l\'emprunteur',
            class_section: 'Classe/Section',
            loan_date_col: 'Date de prêt',
            return_date_col: 'Date de retour',
            isbn: 'ISBN',
            title: 'Titre',
            total_copies: 'Copies totales',
            loaned_copies: 'Copies prêtées',
            available_copies: 'Copies disponibles',
            subject: 'Matière',
            actions: 'Actions',
            book_title: 'Titre du livre',
            book_not_found: 'Livre introuvable',
            loan_management: 'Gestion des prêts',
            add_book_manually: 'Ajouter un livre manuellement',
            view_student_borrowers: 'Voir les étudiants emprunteurs',
            view_teacher_borrowers: 'Voir les enseignants emprunteurs',
            export_excel_data: 'Télécharger données Excel',
            book_isbn_label: 'ISBN du livre',
            book_title_label: 'Titre du livre',
            borrower_type_label: 'Type d\'emprunteur',
            student: 'Étudiant',
            teacher: 'Enseignant',
            borrower_name_label: 'Nom de l\'emprunteur',
            class_subject_label: 'Classe/Matière',
            loan_date_label: 'Date du prêt',
            return_date_label: 'Date de retour',
            loan_book_button: 'Prêter le livre',
            total_copies_label: 'Nombre de copies',
            optional_placeholder: 'Optionnel',
            add_book_button: 'Ajouter le livre',
            select_book_title: 'Sélectionner un livre',
            select_book_subtitle: 'Plusieurs livres trouvés avec le même ISBN. Veuillez sélectionner le bon livre à prêter.'
        },
        en: {
            // ... (toutes les clés de traduction en anglais)
            save_all_changes: 'Save All Changes',
            saving_changes: 'Saving...',
            changes_saved_success: 'Changes saved successfully!',
            confirm_delete: 'Are you sure you want to delete this book?',
            delete_success: 'Book deleted successfully.',
            loan_success: 'Book loaned successfully!',
            return_success: 'Book returned successfully!',
            extend_success: 'Loan extended successfully!',
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
            active_loans: 'Active Loans',
            inventory_search: 'Inventory Search & Management',
            search_placeholder: 'Search by title, ISBN or subject...',
            refresh: 'Refresh',
            books_loaned_list: 'Loaned Books List',
            student_borrowers_list: 'Student Borrowers List',
            teacher_borrowers_list: 'Teacher Borrowers List',
            extend_return_date: 'Extend Return Date',
            new_return_date: 'New Return Date',
            extend_loan: 'Extend Loan',
            current_return_date: 'Current Return Date',
            return_book: 'Return',
            borrower_name: 'Borrower Name',
            class_section: 'Class/Section',
            loan_date_col: 'Loan Date',
            return_date_col: 'Return Date',
            isbn: 'ISBN',
            title: 'Title',
            total_copies: 'Total Copies',
            loaned_copies: 'Loaned Copies',
            available_copies: 'Available Copies',
            subject: 'Subject',
            actions: 'Actions',
            book_title: 'Book Title',
            book_not_found: 'Book not found',
            loan_management: 'Loan Management',
            add_book_manually: 'Add Book Manually',
            view_student_borrowers: 'View Student Borrowers',
            view_teacher_borrowers: 'View Teacher Borrowers',
            export_excel_data: 'Download Excel Data',
            book_isbn_label: 'Book ISBN',
            book_title_label: 'Book Title',
            borrower_type_label: 'Borrower Type',
            student: 'Student',
            teacher: 'Teacher',
            borrower_name_label: 'Borrower Name',
            class_subject_label: 'Class/Subject',
            loan_date_label: 'Loan Date',
            return_date_label: 'Return Date',
            loan_book_button: 'Loan Book',
            total_copies_label: 'Number of Copies',
            optional_placeholder: 'Optional',
            add_book_button: 'Add Book',
            select_book_title: 'Select Book',
            select_book_subtitle: 'Multiple books found with the same ISBN. Please select the correct book to loan.'
        }
    };
    
    function getTranslatedText(key) { return translations[currentLanguage][key] || key; }

    function updateTranslations() {
        document.querySelectorAll('[data-key]').forEach(el => el.textContent = getTranslatedText(el.dataset.key));
        document.querySelectorAll('[data-key-placeholder]').forEach(el => el.placeholder = getTranslatedText(el.dataset.keyPlaceholder));
    }

    function changeLanguage(lang) {
        currentLanguage = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('preferred_language', lang);
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
        updateTranslations();
        renderTable(allBooks); // Re-render table for header translations
    }

    // --- INITIALISATION ---
    function init() {
        // Logique de connexion/session
        if (localStorage.getItem('isLoggedIn') === 'true') {
            showDashboard();
        } else {
            loginPage.style.display = 'flex';
        }

        loginForm.addEventListener('submit', handleLogin);
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => changeLanguage(btn.dataset.lang)));
        
        const savedLang = localStorage.getItem('preferred_language') || 'ar';
        changeLanguage(savedLang);

        // Ajout des écouteurs d'événements
        setupEventListeners();
    }
    
    function handleLogin(e) {
        e.preventDefault();
        if (document.getElementById('username').value === 'Alkawthar@30' && document.getElementById('password').value === 'Alkawthar@30') {
            localStorage.setItem('isLoggedIn', 'true');
            showDashboard();
        } else {
            document.getElementById('login-error').textContent = getTranslatedText('login_error');
        }
    }

    function handleLogout() {
        localStorage.removeItem('isLoggedIn');
        window.location.reload();
    }

    function showDashboard() {
        loginPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        loadAllData();
    }
    
    // --- GESTION DES DONNÉES (API) ---
    async function apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            if (response.status === 204) return null; // Pour les requêtes DELETE
            return response.json();
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            alert(`API Error: ${error.message}`);
            throw error;
        }
    }

    async function loadAllData(page = 1) {
        const search = document.getElementById('search-input').value;
        document.getElementById('loading-bar').style.display = 'block';
        try {
            const data = await apiCall(`books?page=${page}&search=${search}`);
            allBooks = data.books;
            renderTable(allBooks);
            renderPagination(data.pagination);
            updateStats();
        } catch (error) {
            // L'erreur est déjà affichée par apiCall
        } finally {
            document.getElementById('loading-bar').style.display = 'none';
        }
    }

    async function updateStats() {
        try {
            const stats = await apiCall('statistics');
            document.getElementById('total-books-stat').textContent = stats.totalCopies;
            document.getElementById('loaned-books-stat').textContent = stats.loanedCopies;
            document.getElementById('available-books-stat').textContent = stats.availableCopies;
            document.getElementById('active-loans-stat').textContent = stats.activeLoans;
        } catch (error) { /* Géré dans apiCall */ }
    }

    // --- RENDU (AFFICHAGE) ---
    function renderTable(books) {
        const tableBody = document.getElementById('books-table-body');
        tableBody.innerHTML = books.map(book => {
            const availableCopies = book.totalCopies - book.loanedCopies;
            return `
                <tr data-id="${book._id}">
                    <td class="editable-cell" data-field="isbn">${book.isbn}</td>
                    <td class="editable-cell" data-field="title">${book.title}</td>
                    <td class="editable-cell" data-field="totalCopies">${book.totalCopies}</td>
                    <td>${book.loanedCopies}</td>
                    <td class="${availableCopies > 0 ? 'status-available' : 'status-unavailable'}">${availableCopies}</td>
                    <td class="editable-cell" data-field="subject">${book.subject}</td>
                    <td class="action-buttons">
                        <button class="btn-small btn-danger delete-book-btn" data-id="${book._id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderPagination(pagination) {
        const container = document.getElementById('pagination-controls');
        if (!pagination || pagination.pages <= 1) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'flex';
        container.innerHTML = `
            <button id="prev-page" ${pagination.current === 1 ? 'disabled' : ''}>${getTranslatedText('prev_page')}</button>
            <span>Page ${pagination.current} of ${pagination.pages}</span>
            <button id="next-page" ${pagination.current === pagination.pages ? 'disabled' : ''}>${getTranslatedText('next_page')}</button>
        `;
        container.querySelector('#prev-page')?.addEventListener('click', () => loadAllData(pagination.current - 1));
        container.querySelector('#next-page')?.addEventListener('click', () => loadAllData(pagination.current + 1));
    }
    
    // --- GESTIONNAIRES D'ÉVÉNEMENTS ---
    function setupEventListeners() {
        // Recherche
        let searchTimeout;
        document.getElementById('search-input').addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => loadAllData(1), 300);
        });

        // Boutons principaux
        document.getElementById('refresh-books-btn').addEventListener('click', () => loadAllData());
        document.getElementById('view-student-loans-btn').addEventListener('click', () => displayLoans('students'));
        document.getElementById('view-teacher-loans-btn').addEventListener('click', () => displayLoans('teachers'));
        document.getElementById('export-excel-btn').addEventListener('click', () => window.location.href = `${API_BASE_URL}/api/export/excel`);

        // Formulaires
        document.getElementById('loan-form').addEventListener('submit', handleLoanSubmit);
        document.getElementById('manual-book-form').addEventListener('submit', handleManualBookSubmit);

        // Modals
        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
        document.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));

        // NOUVEAU: Événements pour l'édition en ligne
        const tableBody = document.getElementById('books-table-body');
        tableBody.addEventListener('dblclick', handleTableDblClick);
        document.getElementById('save-all-changes-btn').addEventListener('click', handleSaveChanges);
        tableBody.addEventListener('click', (e) => {
            if (e.target.closest('.delete-book-btn')) {
                handleDeleteBook(e.target.closest('.delete-book-btn').dataset.id);
            }
        });
        
        // Formulaire de prolongation de prêt
        document.getElementById('extend-date-form').addEventListener('submit', handleExtendSubmit);
    }
    
    // --- LOGIQUE D'ÉDITION EN LIGNE (BATCH) ---
    function handleTableDblClick(e) {
        const cell = e.target.closest('.editable-cell');
        if (!cell || cell.querySelector('input')) return; // Déjà en mode édition

        const originalValue = cell.textContent;
        const field = cell.dataset.field;
        cell.innerHTML = `<input type="text" value="${originalValue}" />`;
        const input = cell.querySelector('input');
        input.focus();

        const saveChange = () => {
            const newValue = input.value;
            cell.innerHTML = newValue; // Mettre à jour l'affichage immédiatement
            
            if (newValue !== originalValue) {
                const bookId = cell.closest('tr').dataset.id;
                pendingChanges.push({ id: bookId, field, value: newValue });
                cell.classList.add('modified');
                document.getElementById('save-all-changes-btn').style.display = 'inline-block';
            }
        };

        input.addEventListener('blur', saveChange);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
    }

    async function handleSaveChanges() {
        if (pendingChanges.length === 0) return;

        const btn = document.getElementById('save-all-changes-btn');
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${getTranslatedText('saving_changes')}`;

        try {
            await apiCall('books/batch-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: pendingChanges })
            });
            
            alert(getTranslatedText('changes_saved_success'));
            pendingChanges = [];
            document.querySelectorAll('.modified').forEach(cell => cell.classList.remove('modified'));
            btn.style.display = 'none';
            await loadAllData();

        } catch (error) {
            // Erreur déjà affichée par apiCall
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-save"></i> ${getTranslatedText('save_all_changes')}`;
        }
    }

    async function handleDeleteBook(id) {
        if (confirm(getTranslatedText('confirm_delete'))) {
            try {
                await apiCall(`books/${id}`, { method: 'DELETE' });
                alert(getTranslatedText('delete_success'));
                loadAllData();
            } catch (error) { /* Géré par apiCall */ }
        }
    }

    // --- LOGIQUE DES PRÊTS ---
    async function handleLoanSubmit(e) {
        e.preventDefault();
        const bookId = document.getElementById('loan-isbn').dataset.selectedBookId;
        if (!bookId) {
            alert('Please select a book first.');
            return;
        }

        const loanData = {
            bookId,
            studentName: document.getElementById('student-name').value,
            studentClass: document.getElementById('student-class').value,
            borrowerType: document.getElementById('borrower-type').value,
            loanDate: document.getElementById('loan-date').value,
            returnDate: document.getElementById('return-date').value,
        };
        try {
            await apiCall('loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loanData)
            });
            alert(getTranslatedText('loan_success'));
            e.target.reset();
            document.getElementById('loan-book-title').textContent = '-';
            loadAllData();
        } catch (error) { /* Géré par apiCall */ }
    }
    
    // --- GESTION DES PRÊTS (Affichage, Retour, Prolongation) ---
    async function displayLoans(type) {
        try {
            const loans = await apiCall(`loans/${type}`);
            const modalTitle = document.getElementById('loans-modal-title');
            const modalContent = document.getElementById('loans-modal-content');

            modalTitle.textContent = getTranslatedText(type === 'students' ? 'student_borrowers_list' : 'teacher_borrowers_list');
            
            if (!loans || loans.length === 0) {
                modalContent.innerHTML = `<p>No loans found.</p>`;
            } else {
                 modalContent.innerHTML = `
                    <table>
                        <thead><tr><th>${getTranslatedText('borrower_name')}</th><th>${getTranslatedText('book_title')}</th><th>${getTranslatedText('return_date_col')}</th><th>${getTranslatedText('actions')}</th></tr></thead>
                        <tbody>
                            ${loans.map(loan => `
                                <tr>
                                    <td>${loan.studentName}</td>
                                    <td>${loan.bookId.title}</td>
                                    <td>${new Date(loan.returnDate).toLocaleDateString()}</td>
                                    <td class="action-buttons">
                                        <button class="btn-small btn-return" data-loan-id="${loan._id}">${getTranslatedText('return_book')}</button>
                                        <button class="btn-small btn-extend" data-loan-id="${loan._id}" data-book-title="${loan.bookId.title}" data-current-date="${loan.returnDate}">${getTranslatedText('extend_loan')}</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>`;
            }
            
            modalContent.querySelectorAll('.btn-return').forEach(btn => btn.addEventListener('click', async (e) => {
                await apiCall('loans/return', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ loanId: e.target.dataset.loanId })
                });
                alert(getTranslatedText('return_success'));
                displayLoans(type); // Refresh
                updateStats();
            }));

            modalContent.querySelectorAll('.btn-extend').forEach(btn => btn.addEventListener('click', (e) => {
                openExtendModal(e.target.dataset.loanId, e.target.dataset.bookTitle, e.target.dataset.currentDate);
            }));

            openModal('loans-modal');
        } catch(error) { /* géré par apiCall */ }
    }
    
    function openExtendModal(loanId, bookTitle, currentDate) {
        closeModal(); // Ferme le modal des prêts d'abord
        const form = document.getElementById('extend-date-form');
        form.dataset.loanId = loanId;
        document.getElementById('extend-book-title').textContent = bookTitle;
        document.getElementById('extend-current-date').textContent = new Date(currentDate).toLocaleDateString();
        document.getElementById('extend-new-date').min = new Date().toISOString().split('T')[0];
        openModal('extend-date-modal');
    }

    async function handleExtendSubmit(e) {
        e.preventDefault();
        const loanId = e.target.dataset.loanId;
        const newReturnDate = document.getElementById('extend-new-date').value;
        try {
            await apiCall('loans/extend', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loanId, newReturnDate })
            });
            alert(getTranslatedText('extend_success'));
            closeModal();
        } catch(error) { /* géré par apiCall */ }
    }

    // --- AUTRES FORMULAIRES ---
    async function handleManualBookSubmit(e) {
        e.preventDefault();
        const bookData = {
            isbn: document.getElementById('manual-isbn').value,
            title: document.getElementById('manual-title').value,
            totalCopies: document.getElementById('manual-copies').value,
            subject: document.getElementById('manual-subject').value,
        };
        try {
            await apiCall('books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            alert(getTranslatedText('add_book_success'));
            e.target.reset();
            loadAllData();
        } catch (error) { /* Géré par apiCall */ }
    }

    // --- MODALS & UTILITAIRES ---
    function openModal(modalId) {
        modalOverlay.style.display = 'flex';
        document.getElementById(modalId).style.display = 'block';
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    }

    // --- DÉMARRAGE ---
    init();
});
