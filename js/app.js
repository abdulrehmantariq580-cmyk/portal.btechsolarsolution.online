// --- AUTHORIZATION VERIFICATION ---
const userRole = localStorage.getItem('userRole');
const currentPath = window.location.pathname;

if (!userRole && !currentPath.includes('index.html') && currentPath !== '/' && !currentPath.includes('login')) {
    window.location.href = '../index.html';
}

// --- MOBILE SIDEBAR TOGGLE ---
function setupMobileSidebar() {
    const topHeader = document.querySelector('.top-header');
    const sidebar = document.querySelector('.sidebar');
    if (!topHeader || !sidebar) return;

    // 1. Create hamburger button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'sidebarToggle';
    toggleBtn.className = 'sidebar-toggle-btn';
    toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';

    // Insert as the first child of topHeader
    topHeader.insertBefore(toggleBtn, topHeader.firstChild);

    // 2. Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebarOverlay';
    document.body.appendChild(overlay);

    // 3. Toggle sidebar on menu click
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    // 4. Close sidebar on overlay click
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // 5. Close sidebar when clicking any navigation link
    const navItems = sidebar.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Setup mobile sidebar toggle
    setupMobileSidebar();

    // --- SETUP PERMISSIONS AND ROLES UI ---
    if (userRole === 'EMPLOYEE') {
        const inventoryLink = document.querySelector('a[href="inventory.html"]');
        if (inventoryLink) inventoryLink.style.display = 'none';

        const profileInfos = document.querySelectorAll('.user-profile div p');
        if (profileInfos.length > 1) {
            profileInfos[0].innerText = localStorage.getItem('userEmail') || 'Employee User';
            profileInfos[1].innerText = 'Employee View';
        }

        const addStockBtn = document.querySelector('.fa-box-open')?.parentNode;
        if (addStockBtn) addStockBtn.style.display = 'none';

    } else if (userRole === 'ADMIN') {
        const profileInfos = document.querySelectorAll('.user-profile div p');
        if (profileInfos.length > 1) {
            profileInfos[0].innerText = localStorage.getItem('userEmail') || 'Admin User';
            profileInfos[1].innerText = 'Super Admin';
        }
    }

    const logoutBtn = [...document.querySelectorAll('.nav-item')].find(el => el.innerText.trim() === 'Logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }

    // --- LOAD DATA ---
    const leadsTableBody = document.getElementById('leadsTableBody');
    if (leadsTableBody) loadLeads();

    const inventoryGrid = document.getElementById('inventoryGrid');
    if (inventoryGrid) loadInventory();

    const proposalsList = document.getElementById('proposalsList');
    if (proposalsList) loadProposals();
});

// --- API Functions ---
async function loadLeads() {
    let leads = await api.get('/leads');
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (leads.length === 0) {
        // Fallback dummy data for client presentations
        leads = [
            { clientName: 'Ahmed Khan', address: 'Gulberg III, Lahore', phone: '0300-1234567', email: 'ahmed.khan@gmail.com', systemSize: '10kW', status: 'SURVEY_SCHEDULED' },
            { clientName: 'Maria Siddiqui', address: 'DHA Phase 6, Karachi', phone: '0321-7654321', email: 'maria.s@yahoo.com', systemSize: '15kW', status: 'DEAL_CLOSED' },
            { clientName: 'Bilal Raza', address: 'Bahria Town, Islamabad', phone: '0333-9876543', email: 'bilal.raza@outlook.com', systemSize: '5kW', status: 'NEW_LEAD' },
            { clientName: 'Kamran Steel Industries', address: 'Industrial Area, Lahore', phone: '0345-5551212', email: 'info@kamransteel.com', systemSize: '50kW', status: 'SURVEY_SCHEDULED' }
        ];
    }

    leads.forEach(lead => {
        let statusBadgeClass = 'status-new';
        if (lead.status === 'DEAL_CLOSED') statusBadgeClass = 'status-closed';
        if (lead.status === 'SURVEY_SCHEDULED') statusBadgeClass = 'status-contacted';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${lead.clientName}</strong><br><small style="color:var(--text-muted)">${lead.address || 'No Address'}</small></td>
            <td>${lead.phone}<br><small style="color:var(--text-muted)">${lead.email}</small></td>
            <td>${lead.systemSize || 'N/A'}</td>
            <td><span class="status-badge ${statusBadgeClass}">${lead.status || 'NEW_LEAD'}</span></td>
            <td><button class="btn" style="background: var(--surface)"><i class="fa-solid fa-eye"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadInventory() {
    let items = await api.get('/inventory');
    const container = document.getElementById('inventoryGrid');
    if (!container) return;

    container.innerHTML = '';

    if (items.length === 0) {
        // Fallback dummy data for client presentations
        items = [
            { category: 'Solar Panel', brand: 'Longi', modelName: 'Hi-MO 6 (580W)', quantity: 140, alertThreshold: 30 },
            { category: 'Inverter', brand: 'Huawei', modelName: 'SUN2000-10KTL', quantity: 12, alertThreshold: 5 },
            { category: 'Battery', brand: 'Inverex', modelName: 'PowerWall 5kWh', quantity: 3, alertThreshold: 5 },
            { category: 'Mounting Structure', brand: 'Local Galvanized', modelName: 'L2 Structure', quantity: 50, alertThreshold: 10 },
            { category: 'Solar Cable', brand: 'Pakistan Cables', modelName: '4mm DC red (Rolls)', quantity: 4, alertThreshold: 5 }
        ];
    }

    items.forEach(item => {
        const isLow = item.quantity <= item.alertThreshold;
        const colorStyle = isLow ? 'color: #ef4444;' : '';
        const borderStyle = isLow ? 'border-color: #ef4444;' : '';

        const card = document.createElement('div');
        card.className = 'stat-card glass-panel';
        if (isLow) card.style = borderStyle;

        card.innerHTML = `
            <div class="stat-title">${item.category}: ${item.brand} ${item.modelName}</div>
            <div class="stat-value" style="${colorStyle}">
                ${isLow ? '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.2rem; margin-right:5px;"></i>' : ''} 
                ${item.quantity} 
                <span style="font-size: 1rem; font-weight: 400; color: var(--text-muted)">Units</span>
            </div>
        `;
        container.appendChild(card);
    });
}

async function loadProposals() {
    let proposals = await api.get('/proposals');
    const container = document.getElementById('proposalsList');
    if (!container) return;

    container.innerHTML = '';

    if (proposals.length === 0) {
        // Fallback dummy data for client presentations
        proposals = [
            { id: 101, lead: { clientName: 'Maria Siddiqui' }, totalEstimatedCost: '2,450,000', status: 'APPROVED' },
            { id: 102, lead: { clientName: 'Ahmed Khan' }, totalEstimatedCost: '1,750,000', status: 'SENT' },
            { id: 103, lead: { clientName: 'Kamran Steel Industries' }, totalEstimatedCost: '7,800,000', status: 'DRAFT' }
        ];
    }

    proposals.forEach(p => {
        const card = document.createElement('div');
        card.className = 'glass-panel proposal-card';
        card.innerHTML = `
            <div>
                <h3 style="margin-bottom: 0.25rem;">Prop-${p.id}: ${p.lead ? p.lead.clientName : 'Unknown Client'}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Estimated Cost: PKR ${p.totalEstimatedCost || 0}</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn" style="background: rgba(16, 185, 129, 0.2); color: #34d399;"><i class="fa-solid fa-check"></i> ${p.status || 'SENT'}</button>
                <button class="btn" style="background: rgba(59, 130, 246, 0.2);"><i class="fa-solid fa-download"></i> PDF</button>
            </div>
        `;
        container.appendChild(card);
    });
}
