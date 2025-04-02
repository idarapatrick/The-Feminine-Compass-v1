 // Carousel functionality  
let slideIndex = 1;  
showSlides(slideIndex);    

// Auto slide every 7 seconds  
setInterval(() => {      
    slideIndex++;      
    if (slideIndex > 3) slideIndex = 1;      
    showSlides(slideIndex);  
}, 7000);   

function currentSlide(n) {      
    showSlides(slideIndex = n);  
}   

function showSlides(n) {      
    const slides = document.getElementsByClassName("slide");      
    const dots = document.getElementsByClassName("dot");            
    
    for (let i = 0; i < slides.length; i++) {          
        slides[i].classList.remove("active");      
    }            
    
    for (let i = 0; i < dots.length; i++) {          
        dots[i].classList.remove("active");      
    }            
    
    slides[slideIndex-1].classList.add("active");      
    dots[slideIndex-1].classList.add("active");  
}   

// Auth Modal Functionality  
const getStartedBtn = document.getElementById('getStartedBtn');  
const authModal = document.getElementById('authModal');  
const closeModal = document.getElementById('closeModal');  
const signInTab = document.getElementById('signInTab');  
const signUpTab = document.getElementById('signUpTab');  
const signInContent = document.getElementById('signInContent');  
const signUpContent = document.getElementById('signUpContent');  
const goToSignIn = document.getElementById('goToSignIn');  
const goToSignUp = document.getElementById('goToSignUp');   

// Open modal when Get Started is clicked  
getStartedBtn.addEventListener('click', () => {      
    authModal.classList.add('active');  
});   

// Close modal when X is clicked  
closeModal.addEventListener('click', () => {      
    authModal.classList.remove('active');  
});   

// Close modal when clicking outside  
authModal.addEventListener('click', (e) => {      
    if (e.target === authModal) {          
        authModal.classList.remove('active');      
    }  
});   

// Tab switching functionality  
signInTab.addEventListener('click', () => {      
    signInTab.classList.add('active');      
    signUpTab.classList.remove('active');      
    signInContent.classList.add('active');      
    signUpContent.classList.remove('active');  
});   

signUpTab.addEventListener('click', () => {      
    signUpTab.classList.add('active');      
    signInTab.classList.remove('active');      
    signUpContent.classList.add('active');      
    signInContent.classList.remove('active');  
});   

// Navigation to actual Sign In and Sign Up pages  
goToSignIn.addEventListener('click', () => {      
    window.location.href = '/src/auth/signin.html';  
});   

goToSignUp.addEventListener('click', () => {      
    window.location.href = '/src/auth/signup.html';  
});
