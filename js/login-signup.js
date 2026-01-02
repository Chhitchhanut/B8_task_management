// Import from other file
import { auth, db } from './firebase-config.js';
// Import services
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elements
const loginBox = document.querySelector('.login-box');
const signupBox = document.querySelector('.signup-box');
const toSignup = document.getElementById('toSignup');
const toLogin = document.getElementById('toLogin');
const signupBtn = signupBox.querySelector('button');
const loginBtn = loginBox.querySelector('button');

// Switch forms
toSignup.addEventListener('click', () => {
    loginBox.style.display = 'none';
    signupBox.style.display = 'block';
});
toLogin.addEventListener('click', () => {
    signupBox.style.display = 'none';
    loginBox.style.display = 'block';
});

// SIGNUP
signupBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const fullName = document.signupForm.fullName.value;
    const userName = document.signupForm.username.value;
    const email = document.signupForm.email.value;
    const password = document.signupForm.password.value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, "users", uid), {
            email,
            fullName,
            userName
        });

        alert("Signup successful!");
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }
});

// LOGIN
loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.loginForm.email.value;
    const password = document.loginForm.password.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch userName from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const userName = docSnap.exists() ? docSnap.data().userName : user.email;

        alert(`Welcome back, ${userName}!`);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert("Login failed: " + error.message);
    }
});

// ----------------------------
// PASSWORD TOGGLE FUNCTIONALITY
// ----------------------------
const passwordToggles = document.querySelectorAll('.password-toggle');

passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const passwordInput = toggle.previousElementSibling;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggle.classList.remove('bx-hide');
            toggle.classList.add('bx-show');
        } else {
            passwordInput.type = 'password';
            toggle.classList.remove('bx-show');
            toggle.classList.add('bx-hide');
        }
    });
});
