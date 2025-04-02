import { auth, signUp } from "./authfirebase.js";

document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.getElementById('signUpButton');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    signUpButton.addEventListener('click', async function() {
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!name || !email || !password) {
            showError('Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long.');
            return;
        }

        signUpButton.textContent = 'Creating account...';
        signUpButton.disabled = true;

        try {
            await signUp(email, password, name, "");
            window.location.href = '/dashboard.html';
        } catch (error) {
            showError(error.message);
            signUpButton.textContent = 'Sign Up';
            signUpButton.disabled = false;
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
