import { signIn } from './authfirebase.js';

document.addEventListener('DOMContentLoaded', function() {
    const signInForm = document.getElementById('signInForm');
    const signInButton = document.getElementById('signInButton');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!signInForm) {
        console.error("Error: Could not find signin form element");
        return;
    }
    
    signInForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Get form input values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!email || !password) {
            errorMessage.textContent = 'Please enter both email and password';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Show loading state
        signInButton.disabled = true;
        signInButton.textContent = 'Signing in...';
        errorMessage.style.display = 'none';
        
        try {
            console.log("Attempting to sign in with:", email);
            const result = await signIn(email, password);
            
            if (result.success) {
                console.log("Sign in successful!");
                // The redirect will happen automatically via onAuthStateChanged listener
            } else {
                // Show error message
                errorMessage.textContent = result.error.message || 'Invalid email or password. Please try again.';
                errorMessage.style.display = 'block';
                
                // Reset button
                signInButton.disabled = false;
                signInButton.textContent = 'Sign In';
            }
        } catch (error) {
            console.error("Error during sign in:", error);
            
            // Show error message
            errorMessage.textContent = error.message || 'An unexpected error occurred.';
            errorMessage.style.display = 'block';
            
            // Reset button
            signInButton.disabled = false;
            signInButton.textContent = 'Sign In';
        }
    });
});
