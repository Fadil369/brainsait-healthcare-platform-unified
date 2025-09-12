// Navigation Handler for Functional Buttons
class NavigationHandler {
    constructor() {
        this.setupGlobalNavigation();
        this.setupButtonHandlers();
    }

    setupGlobalNavigation() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializePageButtons();
            this.setupServiceActivation();
            this.setupWorkflowButtons();
        });
    }

    initializePageButtons() {
        // Dashboard buttons
        this.setupButton('launch-dashboard', () => this.navigateToPage('dashboard.html'));
        this.setupButton('try-transcription', () => this.navigateToPage('transcription.html'));
        
        // Service activation buttons
        this.setupButton('activate-transcription', () => this.activateService('transcription'));
        this.setupButton('activate-imaging', () => this.activateService('imaging'));
        this.setupButton('activate-nlp', () => this.activateService('nlp'));
        this.setupButton('activate-claims', () => this.activateService('claims'));
        
        // Workflow buttons
        this.setupButton('start-admission', () => this.startWorkflow('admission'));
        this.setupButton('start-emergency', () => this.startWorkflow('emergency'));
        this.setupButton('start-outpatient', () => this.startWorkflow('outpatient'));
        this.setupButton('start-discharge', () => this.startWorkflow('discharge'));
        
        // Admin buttons
        this.setupButton('system-health', () => this.showSystemHealth());
        this.setupButton('user-management', () => this.showUserManagement());
        this.setupButton('compliance-check', () => this.showComplianceMetrics());
    }

    setupButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleButtonClick(handler, button);
            });
        }
    }

    async handleButtonClick(handler, button) {
        const originalText = button.textContent;
        const originalClass = button.className;
        
        try {
            // Show loading state
            button.textContent = 'Loading...';
            button.disabled = true;
            button.className += ' loading';
            
            // Execute handler
            await handler();
            
            // Log action
            await awsIntegration.logActivity('button_click', {
                buttonId: button.id,
                page: window.location.pathname
            });
            
        } catch (error) {
            console.error('Button handler error:', error);
            this.showError(`Action failed: ${error.message}`);
        } finally {
            // Restore button state
            button.textContent = originalText;
            button.disabled = false;
            button.className = originalClass;
        }
    }

    setupServiceActivation() {
        // Service cards click handlers
        document.addEventListener('click', (e) => {
            const serviceCard = e.target.closest('.service-card');
            if (serviceCard) {
                const serviceId = this.getServiceId(serviceCard);
                if (serviceId) {
                    this.activateService(serviceId);
                }
            }
        });
    }

    setupWorkflowButtons() {
        // Workflow action buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.workflow-btn')) {
                const workflowType = e.target.dataset.workflow || 
                    this.extractWorkflowType(e.target.textContent);
                this.startWorkflow(workflowType);
            }
        });
    }

    async navigateToPage(page) {
        // Check authentication for protected pages
        const protectedPages = ['dashboard.html', 'admin.html', 'workflows.html', 'analytics.html'];
        
        if (protectedPages.includes(page) && !this.isAuthenticated()) {
            this.navigateToLogin();
            return;
        }
        
        // Navigate to page
        window.location.href = page;
    }

    async activateService(serviceId) {
        try {
            // Map service to actual page
            const servicePages = {
                'transcription': 'transcription.html',
                'imaging': 'ai-tools.html#imaging',
                'nlp': 'ai-tools.html#nlp',
                'claims': 'analytics.html#claims',
                'dashboard': 'dashboard.html',
                'workflows': 'workflows.html'
            };
            
            const targetPage = servicePages[serviceId];
            if (!targetPage) {
                throw new Error(`Service ${serviceId} not found`);
            }
            
            // Log service activation
            await awsIntegration.logActivity('service_activation', {
                serviceId,
                timestamp: new Date().toISOString()
            });
            
            // Publish metric
            await awsIntegration.publishMetric('ServiceActivation', 1);
            
            // Navigate to service page
            await this.navigateToPage(targetPage);
            
        } catch (error) {
            console.error('Service activation error:', error);
            this.showError(`Failed to activate ${serviceId}: ${error.message}`);
        }
    }

    async startWorkflow(workflowType) {
        try {
            // Check authentication
            if (!this.isAuthenticated()) {
                this.navigateToLogin();
                return;
            }
            
            // Generate patient ID for workflow
            const patientId = `P-${Date.now()}`;
            
            // Start workflow using workflow manager
            const result = await workflowManager.orchestratePatientJourney(patientId, workflowType);
            
            // Show success notification
            this.showSuccess(`${workflowType} workflow started for patient ${patientId}`);
            
            // Navigate to workflows page to monitor
            await this.navigateToPage('workflows.html');
            
        } catch (error) {
            console.error('Workflow start error:', error);
            this.showError(`Failed to start ${workflowType} workflow: ${error.message}`);
        }
    }

    async showSystemHealth() {
        try {
            const healthData = await realDataManager.getRealSystemHealth();
            
            // Create health display modal
            this.showModal('System Health', `
                <div class="health-grid">
                    <div class="health-item">
                        <span>AWS Services:</span>
                        <span class="status ${healthData.awsServices === 'Operational' ? 'healthy' : 'degraded'}">
                            ${healthData.awsServices}
                        </span>
                    </div>
                    <div class="health-item">
                        <span>Database:</span>
                        <span class="status healthy">${healthData.database}</span>
                    </div>
                    <div class="health-item">
                        <span>Storage:</span>
                        <span class="status healthy">${healthData.storage}</span>
                    </div>
                    <div class="health-item">
                        <span>API Latency:</span>
                        <span>${healthData.apiLatency}ms</span>
                    </div>
                    <div class="health-item">
                        <span>Error Rate:</span>
                        <span>${healthData.errorRate}%</span>
                    </div>
                    <div class="health-item">
                        <span>Uptime:</span>
                        <span>${healthData.uptime}%</span>
                    </div>
                </div>
            `);
            
        } catch (error) {
            this.showError('Unable to fetch system health data');
        }
    }

    async showUserManagement() {
        // Navigate to admin page with user management focus
        await this.navigateToPage('admin.html#users');
    }

    async showComplianceMetrics() {
        // Navigate to admin page with compliance focus
        await this.navigateToPage('admin.html#compliance');
    }

    // Utility methods
    isAuthenticated() {
        return !!(localStorage.getItem('accessToken') && localStorage.getItem('currentUser'));
    }

    navigateToLogin() {
        window.location.href = 'login.html';
    }

    getServiceId(serviceCard) {
        // Extract service ID from card attributes or content
        return serviceCard.dataset.service || 
               serviceCard.id?.replace('-card', '') ||
               this.extractServiceFromText(serviceCard.textContent);
    }

    extractServiceFromText(text) {
        const serviceMap = {
            'transcription': 'transcription',
            'imaging': 'imaging',
            'nlp': 'nlp',
            'claims': 'claims',
            'medical': 'imaging'
        };
        
        const lowerText = text.toLowerCase();
        for (const [key, value] of Object.entries(serviceMap)) {
            if (lowerText.includes(key)) {
                return value;
            }
        }
        return null;
    }

    extractWorkflowType(text) {
        const workflowMap = {
            'admission': 'admission',
            'emergency': 'emergency',
            'outpatient': 'outpatient',
            'discharge': 'discharge'
        };
        
        const lowerText = text.toLowerCase();
        for (const [key, value] of Object.entries(workflowMap)) {
            if (lowerText.includes(key)) {
                return value;
            }
        }
        return 'outpatient'; // default
    }

    showModal(title, content) {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: #fff; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; color: #333;">
                    <h3 style="margin: 0 0 20px 0;">${title}</h3>
                    ${content}
                    <button onclick="this.closest('div').parentElement.remove()" style="margin-top: 20px; background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showSuccess(message) {
        if (window.identityManager) {
            identityManager.showUINotification(message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        if (window.identityManager) {
            identityManager.showUINotification(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Initialize Navigation Handler
const navigationHandler = new NavigationHandler();
window.navigationHandler = navigationHandler;
