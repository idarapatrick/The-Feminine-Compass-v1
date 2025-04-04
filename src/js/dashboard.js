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
        // Firebase auth signout implementation
        console.log('Logging out...');
        // Clear user session data
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userSession');
        
        // Clear any application state
        resetApplicationState();
        
        // Redirect to login page after logout
        window.location.href = 'login.html';
    }
    
    // Reset application state to default
    function resetApplicationState() {
        // Reset any local application state
        // This prevents data leakage between sessions
        const dashboardWidgets = document.querySelectorAll('.widget-content');
        dashboardWidgets.forEach(widget => {
            widget.innerHTML = '';
        });
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
                            
                            // Populate cycle calendar with phase information
                            populateCycleCalendar(lastPeriod, avgCycleLength);
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching cycle data:', error);
                    });
            }
        });
    }
}

// Populate the cycle calendar with phase information
function populateCycleCalendar(startDate, cycleLength) {
    const cycleCalendar = document.getElementById('cycle-calendar');
    if (!cycleCalendar) return;
    
    // Clear existing calendar data
    cycleCalendar.innerHTML = '';
    
    // Create calendar headers
    const calendarHeader = document.createElement('div');
    calendarHeader.className = 'calendar-header';
    
    // Days of week abbreviations
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day-header';
        dayEl.textContent = day;
        calendarHeader.appendChild(dayEl);
    });
    
    cycleCalendar.appendChild(calendarHeader);
    
    // Get today and start of current month
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Calculate first day to display (previous month days to fill first week)
    const firstDay = new Date(currentMonth);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());
    
    // Calculate cycle phases
    const menstrualPhase = 5; // Average 5 days for menstruation
    const follicularPhase = 7; // Average 7 days after menstruation
    const ovulatoryPhase = 5; // Around 5 days including ovulation
    // Luteal phase is the remainder of the cycle
    
    // Create calendar grid (6 weeks to ensure we cover the month)
    for (let i = 0; i < 42; i++) {
        const date = new Date(firstDay);
        date.setDate(firstDay.getDate() + i);
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        // Add current month class
        if (date.getMonth() === today.getMonth()) {
            dayEl.classList.add('current-month');
        }
        
        // Mark today
        if (date.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }
        
        // Calculate days since period start
        const periodStartDate = new Date(startDate);
        let daysSincePeriodStart = Math.floor(
            (date - periodStartDate) / (24 * 60 * 60 * 1000)
        );
        
        // Normalize to the current cycle
        while (daysSincePeriodStart < 0) {
            daysSincePeriodStart += cycleLength;
        }
        daysSincePeriodStart = daysSincePeriodStart % cycleLength;
        
        // Apply phase classes
        if (daysSincePeriodStart < menstrualPhase) {
            dayEl.classList.add('phase-menstrual');
            dayEl.setAttribute('title', 'Menstrual Phase');
        } else if (daysSincePeriodStart < menstrualPhase + follicularPhase) {
            dayEl.classList.add('phase-follicular');
            dayEl.setAttribute('title', 'Follicular Phase');
        } else if (daysSincePeriodStart < menstrualPhase + follicularPhase + ovulatoryPhase) {
            dayEl.classList.add('phase-ovulatory');
            dayEl.setAttribute('title', 'Ovulatory Phase');
        } else {
            dayEl.classList.add('phase-luteal');
            dayEl.setAttribute('title', 'Luteal Phase');
        }
        
        dayEl.textContent = date.getDate();
        cycleCalendar.appendChild(dayEl);
    }
}

// Functions to load data for widgets
function loadHealthMetrics() {
    const metricsContainer = document.getElementById('metrics-summary');
    if (!metricsContainer) return;
    
    // Check for user data first
    if (typeof auth !== 'undefined' && auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).collection('healthMetrics')
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const latestMetrics = querySnapshot.docs[0].data();
                    
                    // Format and display the metrics
                    metricsContainer.innerHTML = `
                        <div class="metric-item">
                            <div class="metric-label">Sleep</div>
                            <div class="metric-value">${latestMetrics.sleep || '--'} hrs</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Mood</div>
                            <div class="metric-value">${latestMetrics.mood || '--'}</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Symptoms</div>
                            <div class="metric-value">${latestMetrics.symptoms?.length ? latestMetrics.symptoms.join(', ') : 'None'}</div>
                        </div>
                    `;
                } else {
                    // Fall back to sample data
                    displaySampleHealthMetrics(metricsContainer);
                }
            })
            .catch((error) => {
                console.error('Error fetching health metrics:', error);
                // Fall back to sample data on error
                displaySampleHealthMetrics(metricsContainer);
            });
    } else {
        // No authenticated user, use sample data
        displaySampleHealthMetrics(metricsContainer);
    }
}

// Display sample health metrics when real data is unavailable
function displaySampleHealthMetrics(container) {
    container.innerHTML = `
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
    
    if (typeof auth !== 'undefined' && auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).collection('insights')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    let insightsHTML = '';
                    
                    querySnapshot.forEach(doc => {
                        const insight = doc.data();
                        insightsHTML += `
                            <div class="insight-item">
                                <div class="insight-title">${insight.title}</div>
                                <div class="insight-description">${insight.description}</div>
                            </div>
                        `;
                    });
                    
                    insightsContainer.innerHTML = insightsHTML;
                } else {
                    // Fall back to sample insights
                    displaySampleInsights(insightsContainer);
                }
            })
            .catch((error) => {
                console.error('Error fetching insights:', error);
                // Fall back to sample insights on error
                displaySampleInsights(insightsContainer);
            });
    } else {
        // No authenticated user, use sample insights
        displaySampleInsights(insightsContainer);
    }
}

// Display sample insights when real data is unavailable
function displaySampleInsights(container) {
    container.innerHTML = `
        <div class="insight-item">
            <div class="insight-title">Sleep pattern improving</div>
            <div class="insight-description">Your sleep has been more consistent over the past week.</div>
        </div>
        <div class="insight-item">
            <div class="insight-title">Symptom correlation detected</div>
            <div class="insight-description">Headaches often occur 2 days before your period.</div>
        </div>
        <div class="insight-item">
            <div class="insight-title">Exercise impact</div>
            <div class="insight-description">Regular exercise appears to reduce cramp intensity during menstruation.</div>
        </div>
    `;
}

function loadResources() {
    const resourcesContainer = document.getElementById('resource-list');
    if (!resourcesContainer) return;
    
    // Attempt to load resources from server/database
    fetch('/api/resources')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.resources && data.resources.length > 0) {
                let resourcesHTML = '';
                
                data.resources.forEach(resource => {
                    resourcesHTML += `
                        <div class="resource-item" data-id="${resource.id}">
                            <div class="resource-title">${resource.title}</div>
                            <div class="resource-description">${resource.description}</div>
                            ${resource.url ? `<a href="${resource.url}" class="resource-link" target="_blank">Read more</a>` : ''}
                        </div>
                    `;
                });
                
                resourcesContainer.innerHTML = resourcesHTML;
                
                // Add click handlers to resource items
                document.querySelectorAll('.resource-item').forEach(item => {
                    item.addEventListener('click', function() {
                        // Only navigate if there's no explicit link being clicked
                        if (!event.target.classList.contains('resource-link')) {
                            showResourceDetails(item.getAttribute('data-id'));
                        }
                    });
                });
            } else {
                // Fall back to sample resources
                displaySampleResources(resourcesContainer);
            }
        })
        .catch(error => {
            console.error('Error fetching resources:', error);
            // Fall back to sample resources on error
            displaySampleResources(resourcesContainer);
        });
}

// Display sample resources when real data is unavailable
function displaySampleResources(container) {
    container.innerHTML = `
        <div class="resource-item">
            <div class="resource-title">Understanding Your Cycle</div>
            <div class="resource-description">Learn about the different phases of your menstrual cycle.</div>
        </div>
        <div class="resource-item">
            <div class="resource-title">Healthy Sleep Habits</div>
            <div class="resource-description">Tips for improving your sleep quality.</div>
        </div>
        <div class="resource-item">
            <div class="resource-title">Nutrition and Your Cycle</div>
            <div class="resource-description">How to adjust your diet based on your cycle phase.</div>
        </div>
    `;
    
    // Add click handlers to sample resources
    document.querySelectorAll('.resource-item').forEach(item => {
        item.addEventListener('click', function() {
            alert('Resource details would open here in production version.');
        });
    });
}

// Show detailed view of a specific resource
function showResourceDetails(resourceId) {
    console.log(`Showing details for resource: ${resourceId}`);
    
    // Example implementation with a modal
    const modal = document.getElementById('resource-modal') || createResourceModal();
    
    // Fetch resource data (replace with actual implementation)
    const resourceData = {
        title: "Resource Title",
        content: "Detailed content would appear here...",
        imageUrl: "/path/to/image.jpg"
    };
    
    // Populate modal with resource data
    modal.querySelector('.modal-title').textContent = resourceData.title;
    modal.querySelector('.modal-content').innerHTML = resourceData.content;
    
    // Show modal
    modal.classList.add('active');
}

// Create resource modal if it doesn't exist
function createResourceModal() {
    const modal = document.createElement('div');
    modal.id = 'resource-modal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3 class="modal-title"></h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-content"></div>
        </div>
    `;
    
    // Add close functionality
    modal.querySelector('.modal-close').addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    document.body.appendChild(modal);
    return modal;
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

// Toggle sidebar visibility
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}
