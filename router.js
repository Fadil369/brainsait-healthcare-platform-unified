// Healthcare Platform Router with AWS Integration
class HealthcareRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = '';
        this.authRequired = new Set(['dashboard', 'workflows', 'admin', 'analytics', 'ai-tools', 'transcription']);
        this.roleAccess = {
            'superadmin': ['dashboard', 'workflows', 'admin', 'analytics', 'ai-tools', 'transcription', 'super-admin'],
            'admin': ['dashboard', 'workflows', 'admin', 'analytics', 'ai-tools', 'transcription'],
            'doctor': ['dashboard', 'workflows', 'analytics', 'ai-tools', 'transcription'],
            'nurse': ['dashboard', 'workflows', 'ai-tools', 'transcription'],
            'patient': ['dashboard', 'ai-tools'],
            'technician': ['ai-tools', 'transcription', 'analytics']
        };
        
        this.initializeRoutes();
        this.setupEventListeners();
    }

    initializeRoutes() {
        this.routes.set('', 'index.html');
        this.routes.set('home', 'index.html');
        this.routes.set('login', 'login.html');
        this.routes.set('dashboard', 'dashboard.html');
        this.routes.set('workflows', 'workflows.html');
        this.routes.set('ai-tools', 'ai-tools.html');
        this.routes.set('transcription', 'transcription.html');
        this.routes.set('analytics', 'analytics.html');
        this.routes.set('admin', 'admin.html');
    }

    setupEventListeners() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && this.isInternalLink(link.href)) {
                e.preventDefault();
                this.navigate(this.extractRoute(link.href));
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.loadRoute(e.state.route, false);
            }
        });

        // Handle authentication state changes
        document.addEventListener('authStateChanged', (e) => {
            this.handleAuthChange(e.detail);
        });
    }

    isInternalLink(href) {
        return href.includes('.html') || href.startsWith('#') || href.startsWith('/');
    }

    extractRoute(href) {
        if (href.includes('.html')) {
            return href.split('/').pop().replace('.html', '');
        }
        if (href.includes('#')) {
            return href.split('#').pop();
        }
        return href.replace('/', '');
    }

    async navigate(route, addToHistory = true) {
        // Check authentication
        if (this.authRequired.has(route) && !this.isAuthenticated()) {
            this.navigate('login');
            return;
        }

        // Check role permissions
        if (!this.hasAccess(route)) {
            this.showAccessDenied();
            return;
        }

        await this.loadRoute(route, addToHistory);
    }

    async loadRoute(route, addToHistory = true) {
        const targetFile = this.routes.get(route) || 'index.html';
        
        try {
            // Log navigation for analytics
            await this.logNavigation(route);
            
            // Update URL without page reload
            if (addToHistory) {
                const url = route === '' || route === 'home' ? '/' : `/${route}`;
                history.pushState({ route }, '', url);
            }

            // Load page content
            window.location.href = targetFile;
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.showError('Navigation failed');
        }
    }

    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('currentUser');
        return !!(token && user);
    }

    hasAccess(route) {
        if (!this.authRequired.has(route)) return true;
        
        const userRole = this.getUserRole();
        const allowedRoutes = this.roleAccess[userRole] || [];
        return allowedRoutes.includes(route);
    }

    getUserRole() {
        return localStorage.getItem('userRole') || 'patient';
    }

    async logNavigation(route) {
        if (window.identityManager) {
            await identityManager.logUserAction('navigation', { 
                route, 
                timestamp: new Date().toISOString() 
            });
        }
    }

    handleAuthChange(authData) {
        if (authData.authenticated) {
            localStorage.setItem('userRole', authData.role);
            // Redirect to appropriate dashboard
            const defaultRoutes = {
                'superadmin': 'admin',
                'admin': 'admin',
                'doctor': 'dashboard',
                'nurse': 'dashboard',
                'patient': 'dashboard',
                'technician': 'ai-tools'
            };
            this.navigate(defaultRoutes[authData.role] || 'dashboard');
        } else {
            // Clear auth data and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userRole');
            this.navigate('login');
        }
    }

    showAccessDenied() {
        if (window.identityManager) {
            identityManager.showUINotification('Access denied for your role', 'error');
        }
        this.navigate('dashboard');
    }

    showError(message) {
        if (window.identityManager) {
            identityManager.showUINotification(message, 'error');
        }
    }
}

// Initialize router
const router = new HealthcareRouter();
window.router = router;
