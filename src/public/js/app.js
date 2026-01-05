/**
 * Mobile Sidebar Controller
 */
const MobileSidebar = {
    open() {
        document.querySelector('.sidebar')?.classList.add('open');
        document.querySelector('.sidebar-overlay')?.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    close() {
        document.querySelector('.sidebar')?.classList.remove('open');
        document.querySelector('.sidebar-overlay')?.classList.remove('active');
        document.body.style.overflow = '';
    },
    toggle() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar?.classList.contains('open')) {
            this.close();
        } else {
            this.open();
        }
    }
};

// Close sidebar on resize to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
        MobileSidebar.close();
    }
});

/**
 * API Client for IFITB MULTIDOMAIN
 */
const API = {
    baseUrl: '/api',

    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(`${this.baseUrl}${url}`, {
            ...defaultOptions,
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    },

    // Auth
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    // Admin - Domains
    async createDomain(rootDomain, cloudflareApiToken = null, cloudflareZoneId = null) {
        const payload = { rootDomain };
        if (cloudflareApiToken) payload.cloudflareApiToken = cloudflareApiToken;
        if (cloudflareZoneId) payload.cloudflareZoneId = cloudflareZoneId;

        return this.request('/admin/domains', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async updateDomainStatus(id, status) {
        return this.request(`/admin/domains/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    async deleteDomain(id) {
        return this.request(`/admin/domains/${id}`, {
            method: 'DELETE'
        });
    },

    // Admin - Users
    async createUser(email, password, role = 'USER') {
        return this.request('/admin/users', {
            method: 'POST',
            body: JSON.stringify({ email, password, role })
        });
    },

    async deleteUser(id) {
        return this.request(`/admin/users/${id}`, {
            method: 'DELETE'
        });
    },

    // Admin - Assignments
    async assignDomain(userId, domainId) {
        return this.request('/admin/assignments', {
            method: 'POST',
            body: JSON.stringify({ userId, domainId })
        });
    },

    async unassignDomain(userId, domainId) {
        return this.request('/admin/assignments', {
            method: 'DELETE',
            body: JSON.stringify({ userId, domainId })
        });
    },

    // Admin - Subdomains
    async adminDeleteSubdomain(id) {
        return this.request(`/admin/subdomains/${id}`, {
            method: 'DELETE'
        });
    },

    // User - Domains
    async getUserDomains() {
        return this.request('/user/domains');
    },

    // User - Subdomains
    async getUserSubdomains(domainId = null) {
        const url = domainId ? `/user/subdomains?domainId=${domainId}` : '/user/subdomains';
        return this.request(url);
    },

    async checkAvailability(name, domainId) {
        return this.request('/user/subdomains/check', {
            method: 'POST',
            body: JSON.stringify({ name, domainId })
        });
    },

    async createSubdomain(data) {
        return this.request('/user/subdomains', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateSubdomain(id, data) {
        return this.request(`/user/subdomains/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteSubdomain(id) {
        return this.request(`/user/subdomains/${id}`, {
            method: 'DELETE'
        });
    }
};

/**
 * UI Helpers
 */
const UI = {
    showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container') || this.createNotificationContainer();

        const notification = document.createElement('div');
        notification.className = `notification ${type} transform translate-x-full`;
        notification.innerHTML = `
      <div class="flex items-center gap-3 p-4 rounded-xl shadow-lg ${type === 'success' ? 'bg-emerald-500' :
                type === 'error' ? 'bg-red-500' :
                    'bg-blue-500'
            } text-white">
        <span class="flex-1">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

        container.appendChild(notification);

        setTimeout(() => notification.classList.remove('translate-x-full'), 10);
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    },

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
        return container;
    },

    showModal(id) {
        document.getElementById(id).classList.add('active');
    },

    hideModal(id) {
        document.getElementById(id).classList.remove('active');
    },

    showLoading(button) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="spinner mr-2"></span>Processing...';
    },

    hideLoading(button) {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || 'Submit';
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// Close modal on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('active');
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
