// Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const sidebar = document.getElementById('sidebar');
    const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
    const mainContent = document.getElementById('main-content');
    const notificationsBtn = document.getElementById('notifications-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutMenuBtn = document.getElementById('logout-menu-btn');

    // Initialize all dashboard components
    initializeCycleTracker();
    loadHealthMetrics();
    loadInsights();
    loadResources();
    
    // Set responsive behavior on load
    handleResponsiveLayout();

    // Toggle sidebar on mobile
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnMobileSidebarToggle = mobileSidebarToggle && mobileSidebarToggle.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnMobileSidebarToggle && 
            window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    // Toggle notification dropdown
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
            if (userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    // Toggle user dropdown
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
            if (notificationDropdown.classList.contains('active')) {
                notificationDropdown.classList.remove('active');
            }
        });
    }
    
    // Close dropdowns when clicking elsewhere
    document.addEventListener('click', function(event) {
        if (!notificationsBtn.contains(event.target) && notificationDropdown.classList.contains('active')) {
            notificationDropdown.classList.remove('active');
        }
        if (!userMenuBtn.contains(event.target) && userDropdown.classList.contains('active')) {
            userDropdown.classList.remove('active');
        }
    });
    
    // Handle logout
    function handleLogout() {
        // Add your logout logic here (e.g., Firebase auth signout)
        console.log('Logging out...');
        // Redirect to login page after logout
        // window.location.href = 'login.html';
    }
    
    // Attach logout event handlers
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutMenuBtn) logoutMenuBtn.addEventListener('click', handleLogout);
    
    // Responsive behavior
    function handleResponsiveLayout() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            mainContent.style.marginLeft = '0';
        } else {
            sidebar.style.transform = 'translateX(0)';
            mainContent.style.marginLeft = '250px';
        }
    }
    
    window.addEventListener('resize', handleResponsiveLayout);
    
    // Initialize test data for dashboard
    initializeDashboardTestData();
});

// Cycle Tracker functions
function initializeCycleTracker() {
    const cycleDay = document.getElementById('cycle-day');
    const nextPeriod = document.getElementById('next-period');
    const cycleCalendar = document.getElementById('cycle-calendar');
    
    if (!cycleDay || !nextPeriod || !cycleCalendar) return;
    
    // Check if Firebase auth is available
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(user => {
            if (user) {
                db.collection('users').doc(user.uid).collection('cycleData')
                    .orderBy('date', 'desc')
                    .limit(1)
                    .get()
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            const latestCycleData = querySnapshot.docs[0].data();
                            
                            // Calculate current cycle day
                            const lastPeriod = latestCycleData.lastPeriodStart ? 
                                new Date(latestCycleData.lastPeriodStart.toDate()) : new Date();
                            const today = new Date();
                            const dayDiff = Math.floor((today - lastPeriod) / (24 * 60 * 60 * 1000)) + 1;
                            cycleDay.textContent = dayDiff;
                            
                            // Calculate next period date
                            const avgCycleLength = latestCycleData.avgCycleLength || 28;
                            const nextPeriodDate = new Date(lastPeriod);
                            nextPeriodDate.setDate(lastPeriod.getDate() + avgCycleLength);
                            
                            // Format and display the next period date
                            const options = { year: 'numeric', month: 'long', day: 'numeric' };
                            nextPeriod.textContent = nextPeriodDate.toLocaleDateString(undefined, options);
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching cycle data:', error);
                    });
            }
        });
    }
}

// Functions to load data for widgets
function loadHealthMetrics() {
    const metricsContainer = document.getElementById('metrics-summary');
    if (!metricsContainer) return;
    
    // Add sample data or load from Firebase
    metricsContainer.innerHTML = `
        <div class="metric-item">
            <div class="metric-label">Sleep</div>
            <div class="metric-value">7.5 hrs</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Mood</div>
            <div class="metric-value">Good</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Symptoms</div>
            <div class="metric-value">None</div>
        </div>
    `;
}

function loadInsights() {
    const insightsContainer = document.getElementById('insights-list');
    if (!insightsContainer) return;
    
    // Add sample data or load from Firebase
    insightsContainer.innerHTML = `
        <div class="insight-item">
            <div class="insight-title">Sleep pattern improving</div>
            <div class="insight-description">Your sleep has been more consistent over the past week.</div>
        </div>
        <div class="insight-item">
            <div class="insight-title">Symptom correlation detected</div>
            <div class="insight-description">Headaches often occur 2 days before your period.</div>
        </div>
    `;
}

function loadResources() {
    const resourcesContainer = document.getElementById('resource-list');
    if (!resourcesContainer) return;
    
    // Add sample data or load from Firebase
    resourcesContainer.innerHTML = `
        <div class="resource-item">
            <div class="resource-title">Understanding Your Cycle</div>
            <div class="resource-description">Learn about the different phases of your menstrual cycle.</div>
        </div>
        <div class="resource-item">
            <div class="resource-title">Healthy Sleep Habits</div>
            <div class="resource-description">Tips for improving your sleep quality.</div>
        </div>
    `;
}

// Initialize test data for dashboard demonstration
function initializeDashboardTestData() {
    const cycleDay = document.getElementById('cycle-day');
    const nextPeriod = document.getElementById('next-period');
    const userFirstName = document.getElementById('user-first-name');
    
    // Set test data if Firebase data isn't available
    if (cycleDay && cycleDay.textContent === '--') cycleDay.textContent = "12";
    if (nextPeriod && nextPeriod.textContent === '--') nextPeriod.textContent = "Apr 15, 2025";
    if (userFirstName) userFirstName.textContent = "Sarah";
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}