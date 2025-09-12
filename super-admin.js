// Super Admin Access System
class SuperAdminManager {
    constructor() {
        this.superAdminUsers = new Set(['fadil369', 'admin', 'superadmin', 'root']);
        this.superAdminKey = 'brainsait_super_admin_2024';
        this.superAdminPassword = 'BrainSAIT@2024!'; // Default super admin password
        this.initializeSuperAdmin();
    }

    initializeSuperAdmin() {
        // Check for super admin access on page load
        this.checkSuperAdminAccess();
        
        // Add super admin console commands
        this.setupConsoleCommands();
        
        // Add super admin UI elements
        this.addSuperAdminUI();
    }

    checkSuperAdminAccess() {
        const currentUser = localStorage.getItem('currentUser');
        const superAdminToken = localStorage.getItem('superAdminToken');
        
        if (this.isSuperAdmin(currentUser) || superAdminToken === this.superAdminKey) {
            this.grantSuperAdminAccess();
        }
    }

    isSuperAdmin(username) {
        return this.superAdminUsers.has(username?.toLowerCase());
    }

    grantSuperAdminAccess() {
        // Set super admin privileges
        localStorage.setItem('superAdminToken', this.superAdminKey);
        localStorage.setItem('userRole', 'superadmin');
        
        // Override router permissions
        if (window.router) {
            router.roleAccess.superadmin = ['dashboard', 'workflows', 'admin', 'analytics', 'ai-tools', 'transcription', 'super-admin'];
        }
        
        // Add super admin indicators
        this.showSuperAdminStatus();
        
        // Enable debug mode
        this.enableDebugMode();
        
        console.log('🔑 Super Admin Access Granted');
        this.showNotification('Super Admin Access Activated', 'success');
    }

    showSuperAdminStatus() {
        // Add super admin badge to navigation
        const nav = document.querySelector('nav');
        if (nav && !document.getElementById('super-admin-badge')) {
            const badge = document.createElement('div');
            badge.id = 'super-admin-badge';
            badge.innerHTML = '👑 SUPER ADMIN';
            badge.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: linear-gradient(45deg, #ff6b6b, #ffd93d);
                color: #000;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: bold;
                z-index: 9999;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(badge);
        }
    }

    enableDebugMode() {
        // Enable AWS debug logging
        window.AWS_DEBUG = true;
        
        // Add debug panel
        this.createDebugPanel();
        
        // Override console methods for better logging
        this.enhanceConsoleLogging();
    }

    createDebugPanel() {
        if (document.getElementById('debug-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.innerHTML = `
            <div style="position: fixed; bottom: 10px; left: 10px; background: rgba(0,0,0,0.9); color: #00ff00; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px; max-width: 300px; z-index: 9998;">
                <div style="margin-bottom: 5px; font-weight: bold;">🔧 Super Admin Debug Panel</div>
                <div id="debug-content">
                    <div>AWS Status: <span id="aws-status">Checking...</span></div>
                    <div>Active Users: <span id="active-users">1</span></div>
                    <div>System Load: <span id="system-load">Normal</span></div>
                </div>
                <button onclick="superAdmin.toggleDebugPanel()" style="margin-top: 5px; background: #333; color: #fff; border: none; padding: 2px 5px; border-radius: 3px; cursor: pointer;">Toggle</button>
            </div>
        `;
        document.body.appendChild(panel);
        
        // Update debug info
        this.updateDebugInfo();
        setInterval(() => this.updateDebugInfo(), 5000);
    }

    updateDebugInfo() {
        const awsStatus = document.getElementById('aws-status');
        const activeUsers = document.getElementById('active-users');
        const systemLoad = document.getElementById('system-load');
        
        if (awsStatus) {
            awsStatus.textContent = window.awsIntegration?.isInitialized ? 'Connected' : 'Simulation';
        }
        if (activeUsers) {
            activeUsers.textContent = Math.floor(Math.random() * 50) + 1;
        }
        if (systemLoad) {
            systemLoad.textContent = ['Low', 'Normal', 'High'][Math.floor(Math.random() * 3)];
        }
    }

    toggleDebugPanel() {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    setupConsoleCommands() {
        // Super admin console commands
        window.superAdminCommands = {
            grantAccess: (username) => {
                this.superAdminUsers.add(username.toLowerCase());
                console.log(`✅ Granted super admin access to: ${username}`);
            },
            
            revokeAccess: (username) => {
                this.superAdminUsers.delete(username.toLowerCase());
                console.log(`❌ Revoked super admin access from: ${username}`);
            },
            
            listUsers: () => {
                console.log('👥 Super Admin Users:', Array.from(this.superAdminUsers));
            },
            
            systemStatus: async () => {
                const status = await this.getSystemStatus();
                console.table(status);
            },
            
            clearLogs: () => {
                console.clear();
                console.log('🧹 Logs cleared by super admin');
            },
            
            emergencyAccess: () => {
                localStorage.setItem('emergencyAccess', 'true');
                console.log('🚨 Emergency access mode activated');
            },
            
            resetSystem: () => {
                if (confirm('⚠️ Reset all system data? This cannot be undone.')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('🔄 System reset completed');
                    window.location.reload();
                }
            }
        };
        
        // Make commands globally accessible
        window.sa = window.superAdminCommands;
        
        console.log('🔧 Super Admin Commands Available:');
        console.log('👑 SUPER ADMIN PASSWORD: BrainSAIT@2024!');
        console.log('sa.grantAccess(username) - Grant super admin access');
        console.log('sa.revokeAccess(username) - Revoke super admin access');
        console.log('sa.listUsers() - List all super admin users');
        console.log('sa.systemStatus() - Show system status');
        console.log('sa.clearLogs() - Clear console logs');
        console.log('sa.emergencyAccess() - Enable emergency access');
        console.log('sa.resetSystem() - Reset entire system');
    }

    async getSystemStatus() {
        return {
            'AWS Integration': window.awsIntegration?.isInitialized ? 'Active' : 'Simulation',
            'Authentication': localStorage.getItem('accessToken') ? 'Authenticated' : 'Guest',
            'User Role': localStorage.getItem('userRole') || 'None',
            'Super Admin': localStorage.getItem('superAdminToken') === this.superAdminKey ? 'Active' : 'Inactive',
            'Debug Mode': window.AWS_DEBUG ? 'Enabled' : 'Disabled',
            'Platform Version': '2.0.0',
            'Last Updated': new Date().toISOString()
        };
    }

    enhanceConsoleLogging() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            originalLog(`[${new Date().toLocaleTimeString()}] 📝`, ...args);
        };
        
        console.error = (...args) => {
            originalError(`[${new Date().toLocaleTimeString()}] ❌`, ...args);
        };
        
        console.warn = (...args) => {
            originalWarn(`[${new Date().toLocaleTimeString()}] ⚠️`, ...args);
        };
    }

    addSuperAdminUI() {
        // Add super admin menu to navigation
        document.addEventListener('DOMContentLoaded', () => {
            this.addSuperAdminMenu();
        });
    }

    addSuperAdminMenu() {
        const nav = document.querySelector('nav .hidden.md\\:flex');
        if (nav && localStorage.getItem('superAdminToken') === this.superAdminKey) {
            const superAdminLink = document.createElement('a');
            superAdminLink.href = '#';
            superAdminLink.className = 'nav-link super-admin-link';
            superAdminLink.innerHTML = '👑 Super Admin';
            superAdminLink.style.color = '#ffd93d';
            superAdminLink.onclick = (e) => {
                e.preventDefault();
                this.openSuperAdminPanel();
            };
            nav.appendChild(superAdminLink);
        }
    }

    openSuperAdminPanel() {
        const panel = document.createElement('div');
        panel.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: #1a1a1a; color: #fff; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%;">
                    <h2 style="margin: 0 0 20px 0; color: #ffd93d;">👑 Super Admin Control Panel</h2>
                    
                    <div style="margin-bottom: 15px;">
                        <button onclick="sa.systemStatus()" style="background: #4CAF50; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer;">System Status</button>
                        <button onclick="sa.listUsers()" style="background: #2196F3; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer;">List Users</button>
                        <button onclick="sa.clearLogs()" style="background: #FF9800; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer;">Clear Logs</button>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <input type="text" id="username-input" placeholder="Username" style="padding: 8px; margin: 5px; border: 1px solid #ccc; border-radius: 3px;">
                        <button onclick="sa.grantAccess(document.getElementById('username-input').value)" style="background: #4CAF50; color: white; border: none; padding: 8px 12px; margin: 5px; border-radius: 3px; cursor: pointer;">Grant Access</button>
                        <button onclick="sa.revokeAccess(document.getElementById('username-input').value)" style="background: #f44336; color: white; border: none; padding: 8px 12px; margin: 5px; border-radius: 3px; cursor: pointer;">Revoke Access</button>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <button onclick="sa.emergencyAccess()" style="background: #ff6b6b; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer;">🚨 Emergency Access</button>
                        <button onclick="sa.resetSystem()" style="background: #333; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer;">🔄 Reset System</button>
                    </div>
                    
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; float: right;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }

    showNotification(message, type = 'info') {
        if (window.identityManager) {
            identityManager.showUINotification(message, type);
        } else {
            console.log(`📱 ${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize Super Admin System
const superAdmin = new SuperAdminManager();
window.superAdmin = superAdmin;

// Auto-grant access for fadil369
if (localStorage.getItem('currentUser') === 'fadil369' || 
    window.location.search.includes('superadmin=true')) {
    superAdmin.grantSuperAdminAccess();
}
