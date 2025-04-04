import { signUp } from './authfirebase.js';

document.addEventListener('DOMContentLoaded', function() {
    const signUpForm = document.getElementById('signUpForm');
    const signUpButton = document.getElementById('signUpButton');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!signUpForm) {
        console.error("Error: Could not find signup form element");
        return;
    }
    
    signUpForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Get form input values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!firstName || !lastName || !email || !password) {
            errorMessage.textContent = 'Please fill out all fields';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (password.length < 6) {
            errorMessage.textContent = 'Password must be at least 6 characters';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Show loading state
        signUpButton.disabled = true;
        signUpButton.textContent = 'Creating account...';
        errorMessage.style.display = 'none';
        
        try {
            console.log("Attempting to sign up with:", { email, firstName, lastName });
            const result = await signUp(email, password, firstName, lastName);
            
            if (result.success) {
                console.log("Sign up successful!");
                // The redirect will happen automatically via onAuthStateChanged listener
            } else {
                // Show error message
                errorMessage.textContent = result.error.message || 'Sign up failed. Please try again.';
                errorMessage.style.display = 'block';
                
                // Reset button
                signUpButton.disabled = false;
                signUpButton.textContent = 'Sign Up';
            }
        } catch (error) {
            console.error("Error during sign up:", error);
            
            // Show error message
            errorMessage.textContent = error.message || 'An unexpected error occurred.';
            errorMessage.style.display = 'block';
            
            // Reset button
            signUpButton.disabled = false;
            signUpButton.textContent = 'Sign Up';
        }
    });
});