// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeDashboard();
    initializeOptimization();
    initializeCompetitors();
    initializeSettings();
    initializeLogs();
    startRealTimeUpdates();
});

// Navigation handling
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            
            // Update navigation
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update pages
            pages.forEach(page => {
                if (page.id === `${targetPage}-page`) {
                    page.classList.remove('hidden');
                    page.classList.add('active');
                } else {
                    page.classList.add('hidden');
                    page.classList.remove('active');
                }
            });

            // Update URL hash
            window.location.hash = targetPage;
        });
    });

    // Handle initial page load
    const hash = window.location.hash.slice(1) || 'dashboard';
    document.querySelector(`[data-page="${hash}"]`).click();
}

// Real-time updates
function startRealTimeUpdates() {
    // Connect to WebSocket server
    const ws = new WebSocket(`ws://${window.location.host}`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealtimeUpdate(data);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed. Attempting to reconnect...');
        setTimeout(startRealTimeUpdates, 5000);
    };
}

function handleRealtimeUpdate(data) {
    switch (data.type) {
        case 'optimization':
            updateOptimizationStatus(data);
            break;
        case 'analysis':
            updateCompetitorAnalysis(data);
            break;
        case 'log':
            updateActivityLog(data);
            break;
        case 'stats':
            updateDashboardStats(data);
            break;
    }
}

// Utility functions
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 1
    }).format(number);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Export utility functions for use in other modules
window.app = {
    formatDate,
    formatNumber,
    showNotification
};
