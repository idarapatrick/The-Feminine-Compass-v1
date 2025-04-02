document.addEventListener('DOMContentLoaded', function() {
    // Get the sign up button
    const signUpButton = document.getElementById('signUpButton');
    
    // Add direct click event listener
    signUpButton.addEventListener('click', function() {
        // Redirect immediately to dashboard
        window.location.href = '/src/pages/dashboard.html';
    });
});
