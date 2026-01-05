// Variables globales
let currentPage = 1;
let currentFilters = {};
let currentCategory = 'all';

// Vérifier l'authentification au chargement
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
});

// Vérifier l'authentification
async function checkAuth() {
    try {
        const response = await fetch('/auth/user', {
            credentials: 'include'
        });

        if (response.ok) {
            const user = await response.json();
            showMainApp(user);
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Erreur:', error);
        showLogin();
    }
}

// Afficher l'écran de connexion
function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

// Afficher l'application principale
function showMainApp(user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('username').textContent = user.username;
    
    // Charger les données
    loadCategories();
    loadStats();
    loadLogs();
}

// Connexion Discord
function loginWithDiscord() {
    window.location.href = '/auth/discord';
}

// Déconnexion
function logout() {
    window.location.href = '/auth/logout';
}

// Charger les catégories
async function loadCategories() {
    try {
        const response = await fetch('/api/logs/categories', {
            credentials: 'include'
        });

        if (response.ok) {
            const categories = await response.json();
            const categoryList = document.getElementById('category-list');
            const filterCategory = document.getElementById('filter-category');
            
            // Calculer le total
            let total = 0;
            categories.forEach(cat => {
                total += cat.count;
            });

            // Construire le HTML avec "Tous" en premier
            let html = `
                <div class="category-item active" data-category="all" onclick="selectCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Tous</span>
                    <span class="count">${total}</span>
                </div>
            `;

            // Ajouter toutes les catégories qui existent vraiment dans la base
            categories.forEach(cat => {
                const icon = getCategoryIcon(cat.category);
                const catName = cat.category.toLowerCase();
                
                html += `
                    <div class="category-item" data-category="${catName}" onclick="selectCategory('${catName}')">
                        <i class="${icon}"></i>
                        <span>${cat.category}</span>
                        <span class="count">${cat.count}</span>
                    </div>
                `;

                // Ajouter au filtre
                const option = document.createElement('option');
                option.value = cat.category;
                option.textContent = cat.category;
                filterCategory.appendChild(option);
            });

            categoryList.innerHTML = html;
        }
    } catch (error) {
        console.error('Erreur chargement catégories:', error);
    }
}

// Obtenir l'icône pour une catégorie
function getCategoryIcon(category) {
    const icons = {
        'connexion': 'fas fa-sign-in-alt',
        'deconnexion': 'fas fa-sign-out-alt',
        'déconnexion': 'fas fa-sign-out-alt',
        'admin': 'fas fa-user-shield',
        'staff': 'fas fa-user-tie',
        'system': 'fas fa-cog',
        'système': 'fas fa-cog',
        'chat': 'fas fa-comments',
        'economie': 'fas fa-dollar-sign',
        'économie': 'fas fa-dollar-sign',
        'inventaire': 'fas fa-box',
        'vehicules': 'fas fa-car',
        'véhicules': 'fas fa-car',
        'illegal': 'fas fa-exclamation-triangle',
        'illégal': 'fas fa-exclamation-triangle',
        'morts': 'fas fa-skull',
        'mort': 'fas fa-skull',
        'death': 'fas fa-skull',
        'moderation': 'fas fa-gavel',
        'modération': 'fas fa-gavel',
        'reports': 'fas fa-flag',
        'report': 'fas fa-flag',
        'boutique': 'fas fa-shopping-cart',
        'shop': 'fas fa-shopping-cart',
        'entreprises': 'fas fa-building',
        'entreprise': 'fas fa-building',
        'job': 'fas fa-briefcase',
        'jobs': 'fas fa-briefcase',
        'money': 'fas fa-money-bill',
        'bank': 'fas fa-university',
        'weapon': 'fas fa-gun',
        'arme': 'fas fa-gun',
        'police': 'fas fa-shield-alt',
        'ems': 'fas fa-ambulance',
        'mecano': 'fas fa-wrench',
        'mécano': 'fas fa-wrench'
    };

    return icons[category.toLowerCase()] || 'fas fa-circle';
}

// Sélectionner une catégorie
function selectCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    // Mettre à jour l'UI
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');

    // Charger les logs
    loadLogs();
}

// Charger les statistiques
async function loadStats() {
    try {
        const response = await fetch('/api/logs/stats', {
            credentials: 'include'
        });

        if (response.ok) {
            const stats = await response.json();
            document.getElementById('total-logs').textContent = stats.total.toLocaleString();
            document.getElementById('today-logs').textContent = stats.today.toLocaleString();
        }
    } catch (error) {
        console.error('Erreur chargement stats:', error);
    }
}

// Charger les logs
async function loadLogs() {
    try {
        // Construire les paramètres
        const params = new URLSearchParams({
            page: currentPage,
            limit: 50,
            ...currentFilters
        });

        if (currentCategory !== 'all') {
            params.set('category', currentCategory);
        }

        const response = await fetch(`/api/logs?${params}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            displayLogs(data.logs);
            displayPagination(data.pagination);
        }
    } catch (error) {
        console.error('Erreur chargement logs:', error);
        showError('Erreur lors du chargement des logs');
    }
}

// Afficher les logs
function displayLogs(logs) {
    const tbody = document.getElementById('logs-tbody');
    
    if (logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    <i class="fas fa-inbox"></i> Aucun log trouvé
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    logs.forEach(log => {
        const date = new Date(log.created_at);
        const formattedDate = date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR');
        
        html += `
            <tr>
                <td><span class="unique-id">${log.id}</span></td>
                <td><span class="badge ${log.category.toLowerCase()}">${log.category}</span></td>
                <td>${log.type}</td>
                <td>${escapeHtml(log.message)}</td>
                <td>
                    ${log.player_name ? `
                        <div>
                            <strong>${escapeHtml(log.player_name)}</strong><br>
                            <small style="color: var(--text-secondary);">${log.player_id || 'N/A'}</small>
                        </div>
                    ` : '<span style="color: var(--text-secondary);">N/A</span>'}
                </td>
                <td>
                    ${log.unique_id ? `<span class="unique-id">${log.unique_id}</span>` : '<span style="color: var(--text-secondary);">N/A</span>'}
                </td>
                <td>${formattedDate}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Afficher la pagination
function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    
    let html = `
        <button onclick="changePage(${pagination.page - 1})" ${pagination.page === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Précédent
        </button>
        <span class="page-info">
            Page ${pagination.page} sur ${pagination.pages} (${pagination.total} logs)
        </span>
        <button onclick="changePage(${pagination.page + 1})" ${pagination.page === pagination.pages ? 'disabled' : ''}>
            Suivant <i class="fas fa-chevron-right"></i>
        </button>
    `;

    container.innerHTML = html;
}

// Changer de page
function changePage(page) {
    currentPage = page;
    loadLogs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Appliquer les filtres
function applyFilters() {
    currentFilters = {};
    currentPage = 1;

    const title = document.getElementById('filter-title').value.trim();
    const message = document.getElementById('filter-message').value.trim();
    const uniqueId = document.getElementById('filter-unique-id').value.trim();
    const name = document.getElementById('filter-name').value.trim();
    const category = document.getElementById('filter-category').value;
    const dateStart = document.getElementById('filter-date-start').value;
    const dateEnd = document.getElementById('filter-date-end').value;

    if (title) currentFilters.title = title;
    if (message) currentFilters.message = message;
    if (uniqueId) currentFilters.unique_id = uniqueId;
    if (name) currentFilters.player_name = name;
    if (category !== 'all') currentFilters.category = category;
    if (dateStart) currentFilters.date_start = dateStart;
    if (dateEnd) currentFilters.date_end = dateEnd;

    loadLogs();
}

// Réinitialiser les filtres
function resetFilters() {
    document.getElementById('filter-title').value = '';
    document.getElementById('filter-message').value = '';
    document.getElementById('filter-unique-id').value = '';
    document.getElementById('filter-name').value = '';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-date-start').value = '';
    document.getElementById('filter-date-end').value = '';
    
    currentFilters = {};
    currentPage = 1;
    loadLogs();
}

// Échapper le HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Afficher une erreur
function showError(message) {
    const tbody = document.getElementById('logs-tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="loading" style="color: var(--danger);">
                <i class="fas fa-exclamation-circle"></i> ${message}
            </td>
        </tr>
    `;
}

// Recharger les logs toutes les 30 secondes
setInterval(() => {
    if (document.getElementById('main-app').style.display !== 'none') {
        loadStats();
        loadLogs();
    }
}, 30000);
