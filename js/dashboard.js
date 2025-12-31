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
const downIcon = document.getElementById('icon_down');
const allCategory = document.getElementById('small-category');

const mainContentContainer = document.querySelector('.main-content-container');
const body = document.body;

// Category modal
const sections = document.getElementById('category-modal');
const inputCategory = document.getElementById('category-name');
const btnCategory = document.querySelector('.create_category');
const cancelCategory = document.querySelector('.cancel');
const doneCategory = document.querySelector('.done');
const smallCategoryDiv = document.getElementById("small-category");

// Task modal
const showCreateTaskBtn = document.querySelector('.create_task');
const createTaskBtnClose = document.querySelector('.create-task-btn-close');
const mainTop = document.querySelector('.main-top');
const mainBottom = document.querySelector('.mian-button');
const taskForm = document.querySelector(".task-form");
const categorySelect = document.getElementById('category');

// Filters
const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('categorySearch');
const searchBtn = document.getElementById('searchBtn');
const tableBody = document.querySelector('table tbody');
const tableRows = document.querySelectorAll('tbody tr');

// ----------------------------
// MENU BUTTON LOGIC
// ----------------------------
function hideShowBtn() {
    downIcon.style.display = 'none';
    nav.classList.toggle('compact');
    allCategory.style.display = 'none';
    headContent.classList.toggle('hidden');
    if (!nav.classList.contains('compact')) {
        downIcon.style.display = 'block';
        allCategory.style.display = 'block';
    }
}
menuButton.addEventListener("click", hideShowBtn);

// ----------------------------
// CATEGORY MODAL LOGIC
// ----------------------------
btnCategory.addEventListener('click', () => {
    sections.style.display = 'block';
    sections.classList.add('show');
    mainContentContainer.style.display = 'none';
    document.body.style.background = 'rgba(50, 44, 44, 0.17)';
    allCategory.style.display = 'block';
    // Add smooth animation to modal
    setTimeout(() => {
        sections.querySelector('.modal-card').classList.add('scale-in');
    }, 10);
});

cancelCategory.addEventListener('click', () => {
    sections.querySelector('.modal-card').classList.remove('scale-in');
    setTimeout(() => {
        sections.style.display = 'none';
        sections.classList.remove('show');
        document.body.style.background = 'none';
        mainContentContainer.style.display = 'block';
        inputCategory.value = '';
    }, 300);
});

doneCategory.addEventListener('click', async (e) => {
    e.preventDefault();
    const newCategoryName = inputCategory.value.trim();
    if (newCategoryName === '') {
        alert('Please enter a category name.');
        return;
    }
    try {
        await addDoc(collection(db, "categories"), {
            category: newCategoryName,
            email: usernameTag.textContent
        });

        // Create new category element with smooth animation
        const div = document.createElement("div");
        div.textContent = newCategoryName;
        div.className = 'category-item';

        // Add click handler for category filtering
        div.addEventListener('click', () => {
            // Remove active class from all category items
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active-category');
            });

            // Add active class to clicked category
            div.classList.add('active-category');

            // Set the category filter and trigger filtering
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.value = newCategoryName;
                categoryFilter.dispatchEvent(new Event('change'));
            }
        });

        smallCategoryDiv.appendChild(div);

        // Close modal with smooth animation
        sections.querySelector('.modal-card').classList.remove('scale-in');
        setTimeout(() => {
            sections.style.display = 'none';
            sections.classList.remove('show');
            document.body.style.background = 'none';
            mainContentContainer.style.display = 'block';
            inputCategory.value = '';
        }, 300);

    } catch (error) {
        console.error(error);
        alert("Failed to add category!");
    }
});

// ----------------------------
// DOWN CATEGORY TOGGLE - SMOOTH ANIMATION
// ----------------------------
downIcon.addEventListener('click', () => {
    const isHidden = allCategory.style.display === 'none' || allCategory.style.display === '';

    if (isHidden) {
        // Show dropdown with smooth animation
        allCategory.style.display = 'block';
        allCategory.classList.add('show');
        downIcon.classList.replace('bx-chevron-down', 'bx-chevron-up');
        downIcon.classList.add('rotated');
    } else {
        // Hide dropdown with smooth animation
        allCategory.classList.remove('show');
        downIcon.classList.replace('bx-chevron-up', 'bx-chevron-down');
        downIcon.classList.remove('rotated');

        // Hide after animation completes
        setTimeout(() => {
            if (!allCategory.classList.contains('show')) {
                allCategory.style.display = 'none';
            }
        }, 400);
    }
});

// ----------------------------
// DATA / TASK COUNT LOGIC
// ----------------------------
function updateTaskCounts() {
    const allCard = document.querySelector('.summary-card.all span');
    const doneCard = document.querySelector('.summary-card.done span');
    const inProgressCard = document.querySelector('.summary-card.progress span');
    const todoCard = document.querySelector('.summary-card.todo span');
    const statusSelects = document.querySelectorAll('.status-select');

    let all = statusSelects.length;
    let done = 0;
    let inProgress = 0;
    let todo = 0;

    statusSelects.forEach(select => {
        const value = select.value;
        if (value === 'done') done++;
        else if (value === 'in-progress') inProgress++;
        else if (value === 'todo') todo++;
    });

    allCard.textContent = all;
    doneCard.textContent = done;
    inProgressCard.textContent = inProgress;
    todoCard.textContent = todo;
}

tableBody.addEventListener('change', (e) => {
    if (e.target.classList.contains('status-select')) {
        updateTaskCounts();
    }
});
updateTaskCounts();

// ----------------------------
// SEARCH / FILTER LOGIC
// ----------------------------
function filterTasks() {
    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;
    const selectedCategory = categoryFilter.value.toLowerCase();
    const searchQuery = searchInput.value.toLowerCase();

    // Get fresh table rows each time to include dynamically loaded tasks
    const currentTableRows = document.querySelectorAll('tbody tr');

    for (let row of currentTableRows) {
        const taskStatus = row.querySelector('.status-select')?.value || '';
        const taskPriority = row.querySelector('.priority-select')?.value || '';
        const taskCategory = row.querySelector('.category-cell')?.textContent.toLowerCase() || '';
        const taskName = row.cells[1]?.textContent.toLowerCase() || '';

        let showRow = true;

        if (selectedStatus && taskStatus !== selectedStatus) showRow = false;
        if (selectedPriority && taskPriority !== selectedPriority) showRow = false;
        if (selectedCategory && taskCategory !== selectedCategory) showRow = false;
        if (searchQuery && !taskName.includes(searchQuery) && !taskCategory.includes(searchQuery)) showRow = false;

        row.style.display = showRow ? '' : 'none';
    }
}

statusFilter.addEventListener('change', filterTasks);
priorityFilter.addEventListener('change', filterTasks);
categoryFilter.addEventListener('change', filterTasks);
searchBtn.addEventListener('click', filterTasks);
searchInput.addEventListener('input', filterTasks);

// ----------------------------
// AUTH / USER INFO
// ----------------------------
onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    usernameTag.textContent = user.displayName || user.email || "Guest";

    // Load categories
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('email', '==', user.email));

    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const categoryData = doc.data();
            const option = document.createElement('option');
            option.value = categoryData.category;
            option.textContent = categoryData.category;
            categorySelect.appendChild(option);
        });
        console.log('Categories loaded:', querySnapshot.size);
    } catch (err) {
        console.error('Error fetching categories:', err);
    }

    // Load tasks
    await loadTasks();
});

// ----------------------------
// TASK MODAL LOGIC
// ----------------------------
showCreateTaskBtn.addEventListener('click', () => {
    mainTop.style.display = 'none';
    mainBottom.style.display = 'none';
    taskForm.style.display = 'block';
});

createTaskBtnClose.addEventListener('click', () => {
    mainTop.style.display = 'block';
    mainBottom.style.display = 'block';
    taskForm.style.display = 'none';
});

taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = usernameTag.textContent;
    const taskName = document.getElementById("taskName").value;
    const priority = document.getElementById("priority").value;
    const status = 'todo';
    const category = document.getElementById("category").value;
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

        // Reload tasks to show the new task
        await loadTasks();
    } catch (error) {
        console.error("❌ Error adding task: ", error);
        alert("Failed to create task. Check console.");
    }
});

// ----------------------------
// LOAD TASKS FROM FIREBASE
// ----------------------------

async function loadTasks() {
    const user = auth.currentUser;
    if (!user) return;

    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where('email', '==', user.email));

    try {
        const querySnapshot = await getDocs(q);
        const tbody = document.querySelector('table tbody');

        // Clear existing rows except the header
        tbody.innerHTML = '';
        querySnapshot.forEach((doc, index) => {
            const task = doc.data();
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${task.taskName}</td>
                <td>
                    <select class="status-select">
                        <option value="" selected disabled>select here...</option>
                        <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Todo</option>
                        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
                    </select>
                </td>
                <td>
                    <select class="priority-select">
                        <option value="" selected disabled>select here...</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                    </select>
                </td>
                <td class="category-cell">${task.category}</td>
                <td>${task.dueDate}</td>
                <td>
                    <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                    <button class="delete-btn"><i class="fa-solid fa-trash"></i> Delete</button>
                </td>
                <td>${task.remark || '—'}</td>
            `;

            tbody.appendChild(row);
        });

        // Update task counts after loading
        updateTaskCounts();

        // Apply current filters after loading
        filterTasks();

    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}



// ----------------------------
// RENDER ALL CATEGORIES IN SIDEBAR - SMOOTH ANIMATION
// ----------------------------
async function renderCategories() {
    smallCategoryDiv.innerHTML = "";
    try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        querySnapshot.forEach((doc, index) => {
            const div = document.createElement("div");
            div.textContent = doc.data().category;
            div.className = 'category-item';
            div.style.animationDelay = `${index * 0.1}s`;

            // Add click handler for category filtering
            div.addEventListener('click', () => {
                // Remove active class from all category items
                document.querySelectorAll('.category-item').forEach(item => {
                    item.classList.remove('active-category');
                });

                // Add active class to clicked category
                div.classList.add('active-category');

                // Set the category filter and trigger filtering
                const categoryFilter = document.getElementById('categoryFilter');
                if (categoryFilter) {
                    categoryFilter.value = doc.data().category;
                    categoryFilter.dispatchEvent(new Event('change'));
                }
            });
            smallCategoryDiv.appendChild(div);
        });
    } catch (err) {
        console.error("Error fetching categories:", err);
    }
}
renderCategories();
