// ----------------------------
// IMPORTS
// ----------------------------
import { auth, db } from '/js/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// ----------------------------
// DOM ELEMENTS
// ----------------------------
const usernameTag = document.getElementById('userName');

// Menu
const menuButton = document.getElementById("menu-button");
const nav = document.getElementById("nav");
const headContent = document.getElementById("head_contain");
// Category modal
const sections = document.getElementById('category-modal');
const inputCategory = document.getElementById('category-name');
const btnCategory = document.querySelector('.create_category');
const cancelCategory = document.querySelector('.cancel');
const doneCategory = document.querySelector('.done');
const smallCategory = document.getElementById('small-category');
const mainContentContainer = document.querySelector('.main-content-container');

const categorySelect = document.getElementById('category');

// Task modal
const showCreateTaskBtn = document.querySelector('.create_task');
const createTaskBtnClose = document.querySelector('.create-task-btn-close');
const mainTop = document.querySelector('.main-top');
const mainBottom = document.querySelector('.mian-button');
const taskForm = document.querySelector(".task-form");

// ----------------------------
// AUTH / USER INFO
// ----------------------------
onAuthStateChanged(auth, async (user) => {
    if (!user) return; // <-- Only return if user is NOT logged in

    // Set username
    usernameTag.textContent = user.displayName || user.email || "Guest";

    // Reference to categories collection
    const categoriesRef = collection(db, 'categories');

    // Query: only get categories where email == current user
    const q = query(categoriesRef, where('email', '==', user.email));

    try {
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const categoryData = doc.data();
            const option = document.createElement('option');
            option.value = categoryData.category;  // field name in Firestore
            option.textContent = categoryData.category;
            categorySelect.appendChild(option);
        });

        console.log('Categories loaded:', querySnapshot.size);
    } catch (err) {
        console.error('Error fetching categories:', err);
    }
});



// ----------------------------
// MENU BUTTON LOGIC
// ----------------------------
if (menuButton && nav && headContent) {
    menuButton.addEventListener("click", () => {
        nav.classList.toggle('compact');
        headContent.classList.toggle('hidden');
    });
}

// ----------------------------
// CATEGORY MODAL LOGIC
// ----------------------------
if (btnCategory && sections && mainContentContainer) {
    btnCategory.addEventListener('click', () => {
        sections.style.display = 'block';
        mainContentContainer.style.display = 'none';
        document.body.style.background = 'rgba(50, 44, 44, 0.17)';
    });
}

if (cancelCategory && sections && mainContentContainer && inputCategory) {
    cancelCategory.addEventListener('click', () => {
        sections.style.display = 'none';
        mainContentContainer.style.display = 'block';
        document.body.style.background = 'none';
        inputCategory.value = '';
    });
}

if (doneCategory && inputCategory && smallCategory && sections && mainContentContainer) {
    doneCategory.addEventListener('click', (e) => {
        e.preventDefault();
        const newCategoryName = inputCategory.value.trim();
        if (!newCategoryName) {
            alert('Please enter a category name.');
            return;
        }
        const text = document.createElement('div');
        text.textContent = newCategoryName;
        smallCategory.appendChild(text);

        inputCategory.value = '';
        sections.style.display = 'none';
        mainContentContainer.style.display = 'block';
        document.body.style.background = 'none';
    });
}


// ----------------------------
// TASK MODAL LOGIC
// ----------------------------

// Show task form
showCreateTaskBtn.addEventListener('click', () => {
    mainTop.style.display = 'none';
    mainBottom.style.display = 'none';
    taskForm.style.display = 'block';
});

// Close task form
createTaskBtnClose.addEventListener('click', () => {
    mainTop.style.display = 'block';
    mainBottom.style.display = 'block';
    taskForm.style.display = 'none';
});

// Submit task form
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = usernameTag.textContent;
    const taskName = document.getElementById("taskName").value;
    const priority = document.getElementById("priority").value;
    const status = 'todo';
    const category = document.getElementById("category").value;;
    const dueDate = document.getElementById("dueDate").value;
    const remark = document.getElementById("remark").value;

    try {
        await addDoc(collection(db, "tasks"), {
            email,
            taskName,
            priority,
            status,
            category,
            dueDate,
            remark,
            createdAt: serverTimestamp()
        });

        alert("✅ Task created successfully!");
        taskForm.reset();
        taskForm.style.display = 'none';
        mainTop.style.display = 'block';
        mainBottom.style.display = 'block';

    } catch (error) {
        console.error("❌ Error adding task: ", error);
        alert("Failed to create task. Check console.");
    }
});

