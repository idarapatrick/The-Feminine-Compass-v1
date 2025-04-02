document.addEventListener('DOMContentLoaded', function() {
    // Get the sign in button
    const signInButton = document.getElementById('signInButton');
    
    // Add direct click event listener
    signInButton.addEventListener('click', function() {
        // Redirect immediately to dashboard
        window.location.href = '/src/pages/dashboard.html';
    });
});
