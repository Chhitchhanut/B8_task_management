// ----------------------------
// IMPORTS
// ----------------------------
import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

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

// Current user tracking
let currentUser = null;

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        renderCategories();
    } else {
        // Redirect to login if not authenticated
        window.location.href = "index.html";
    }
});

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
        if (!currentUser) {
            alert("Please log in to create categories");
            return;
        }

        await addDoc(collection(db, "categories"), {
            category: newCategoryName,
            email: currentUser.email
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
        // Clear existing options first
        categorySelect.innerHTML = '';
        categoryFilter.innerHTML = '';
        
        // Add placeholder option for task creation dropdown
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = '-- Select Category --';
        placeholderOption.selected = true;
        placeholderOption.disabled = true;
        categorySelect.appendChild(placeholderOption);
        
        // Add placeholder option for filter dropdown
        const filterPlaceholderOption = document.createElement('option');
        filterPlaceholderOption.value = '';
        filterPlaceholderOption.textContent = 'Filter by Category';
        filterPlaceholderOption.selected = true;
        categoryFilter.appendChild(filterPlaceholderOption);
        
        // Add user's categories to both dropdowns
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const categoryData = doc.data();
            
            // Add to task creation dropdown
            const option = document.createElement('option');
            option.value = categoryData.category;
            option.textContent = categoryData.category;
            categorySelect.appendChild(option);
            
            // Add to filter dropdown
            const filterOption = document.createElement('option');
            filterOption.value = categoryData.category;
            filterOption.textContent = categoryData.category;
            categoryFilter.appendChild(filterOption);
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
    if (!currentUser) {
        alert("Please log in to create tasks");
        return;
    }
    const email = currentUser.email;
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

// >>>>>>>>>>>>>>>>>>>>>>>> Task Table >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const tbody = document.querySelector('tbody');

// ADD THIS LINE — THIS FIXES CANCEL!
let originalRowHTML = '';  // Stores the row HTML before editing

function formatDueDate(timestamp) {
    if (!timestamp) return '—';
    try {
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return '—';
    }
}

function parseFlexibleDate(text) {
    if (!text || text.trim() === '' || text === '—') return null;
    const cleaned = text.trim();
    
    const parsed = new Date(cleaned);
    if (!isNaN(parsed)) return parsed;

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const parsedGB = new Intl.DateTimeFormat('en-GB', options).parse(cleaned);
    if (parsedGB) return parsedGB;

    return null;
}

function escapeHtml(text) {
    if (!text) return '—';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load tasks
const tasksCol = query(collection(db, 'tasks'), orderBy('dueDate'));
onSnapshot(tasksCol, (snapshot) => {
    tbody.innerHTML = '';
    let no = 1;
    snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const row = document.createElement('tr');
        row.dataset.id = docSnap.id;

        row.innerHTML = `
            <td>${no++}</td>
            <td>${escapeHtml(data.taskName || 'Untitled')}</td>
            <td>
                <select class="status-select">
                    <option value="todo" ${data.status === 'todo' ? 'selected' : ''}>Todo</option>
                    <option value="in-progress" ${data.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="done" ${data.status === 'done' ? 'selected' : ''}>Done</option>
                </select>
            </td>
            <td>
                <select class="priority-select">
                    <option value="high" ${data.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="medium" ${data.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="low" ${data.priority === 'low' ? 'selected' : ''}>Low</option>
                </select>
            </td>
            <td>${escapeHtml(data.category || '—')}</td>
            <td>${formatDueDate(data.dueDate)}</td>
            <td>
                <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                <button class="delete-btn"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
            <td>${escapeHtml(data.remark || '—')}</td>
        `;
        tbody.appendChild(row);
    });

    // Optional: Show message if no tasks
    if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#888; padding:30px;">No tasks yet</td></tr>';
    }
});

// Click handlers
tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const row = btn.closest('tr');
    const taskId = row.dataset.id;

    if (btn.classList.contains('delete-btn')) {
        if (confirm('Delete this task?')) {
            await deleteDoc(doc(db, 'tasks', taskId));
        }

    } else if (btn.classList.contains('edit-btn')) {
        enterEditMode(row);

    } else if (btn.classList.contains('save-btn')) {
        await saveTask(row, taskId);

    } else if (btn.classList.contains('cancel-btn')) {
        // NOW THIS WORKS — restores everything perfectly!
        row.innerHTML = originalRowHTML;
        row.classList.remove('editing');
    }
});

tbody.addEventListener('change', async (e) => {
    if (e.target.matches('.status-select, .priority-select')) {
        const row = e.target.closest('tr');
        const field = e.target.classList.contains('status-select') ? 'status' : 'priority';
        await updateDoc(doc(db, 'tasks', row.dataset.id), { [field]: e.target.value });
    }
});

// EDIT MODE
function enterEditMode(row) {
    if (row.classList.contains('editing')) return;

    // SAVE THE ORIGINAL ROW HTML BEFORE CHANGING ANYTHING
    originalRowHTML = row.innerHTML;

    row.classList.add('editing');

    const currentDisplayDate = row.cells[5].textContent.trim();

    row.cells[1].innerHTML = `<input type="text" class="edit-input" value="${escapeHtml(row.cells[1].textContent)}">`;
    row.cells[4].innerHTML = `<input type="text" class="edit-input" value="${row.cells[4].textContent === '—' ? '' : row.cells[4].textContent}">`;
    row.cells[5].innerHTML = `<input type="text" class="edit-input" placeholder="e.g. 27 December 2025" value="${currentDisplayDate === '—' ? '' : currentDisplayDate}">`;
    row.cells[7].innerHTML = `<input type="text" class="edit-input" value="${row.cells[7].textContent === '—' ? '' : row.cells[7].textContent}">`;

    row.cells[6].innerHTML = `
        <button class="save-btn"><i class="fa-solid fa-check"></i> Save</button>
        <button class="cancel-btn"><i class="fa-solid fa-xmark"></i> Cancel</button>
    `;
}

// SAVE TASK
async function saveTask(row, taskId) {
    const inputs = row.querySelectorAll('.edit-input');
    const taskName = inputs[0].value.trim();
    const category = inputs[1].value.trim();
    const dueDateText = inputs[2].value.trim();
    const remark = inputs[3].value.trim();

    if (!taskName) {
        alert('Task Name is required!');
        return;
    }

    const updateData = {
        taskName,
        category: category || null,
        remark: remark || null,
        status: row.querySelector('.status-select').value,
        priority: row.querySelector('.priority-select').value
    };

    const parsedDate = parseFlexibleDate(dueDateText);
    if (dueDateText && !parsedDate) {
        alert('Please enter a valid date (e.g. 27 December 2025)');
        return;
    }
    updateData.dueDate = parsedDate;

    try {
        await updateDoc(doc(db, 'tasks', taskId), updateData);
        row.classList.remove('editing');
    } catch (error) {
        alert('Error saving: ' + error.message);
    }
}

// // When I login on gmail cat@gmail.com have new data diferent gmail doc@gmail.com

const tBody = document.querySelector('tbody');
const userNameDisplay = document.getElementById('userName'); // Shows email
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');


// Load tasks ONLY for the current logged-in user
function loadTasksForUser(userEmail) {
    // This query gets only tasks where email == user's email
    const q = query(collection(db, 'tasks'), where('email', '==', userEmail));

    onSnapshot(q, (snapshot) => {
        tbody.innerHTML = '';
        let no = 1;

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:50px; color:#888;">No tasks yet</td></tr>';
            return;
        }

        snapshot.forEach((docSnap) => {
            const task = docSnap.data();
            const row = document.createElement('tr');
            row.dataset.id = docSnap.id;

            row.innerHTML = `
        <td>${no++}</td>
        <td>${task.taskName || 'Untitled'}</td>
        <td>
          <select class="status-select">
            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Todo</option>
            <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
          </select>
        </td>
        <td>
          <select class="priority-select">
            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
          </select>
        </td>
        <td>${task.category || '—'}</td>
        <td>${formatDueDate(task.dueDate)}</td>
        <td>
          <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button class="delete-btn"><i class="fa-solid fa-trash"></i> Delete</button>
        </td>
        <td>${task.remark || '—'}</td>
      `;

            tbody.appendChild(row);
        });
    });
}

// Check login status
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User logged in
        userNameDisplay.textContent = user.email;
        // Load ONLY this user's tasks
        loadTasksForUser(user.email);

    } else {
        // No user
        userNameDisplay.textContent = 'Guest';
        logoutBtn.style.display = 'none';
        loginBtn.style.display = 'inline-block';

        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:50px;">Please login to see your tasks</td></tr>';
    }
});

// Status & Priority change → save to Firebase
tbody.addEventListener('change', async (e) => {
    if (e.target.classList.contains('status-select') || e.target.classList.contains('priority-select')) {
        const row = e.target.closest('tr');
        const taskId = row.dataset.id;
        const field = e.target.classList.contains('status-select') ? 'status' : 'priority';
        const value = e.target.value;

        await updateDoc(doc(db, 'tasks', taskId), { [field]: value });
    }
});

// Delete task
tbody.addEventListener('click', async (e) => {
    if (e.target.closest('.delete-btn')) {
        if (confirm('Delete this task?')) {
            const row = e.target.closest('tr');
            await deleteDoc(doc(db, 'tasks', row.dataset.id));
        }
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
    if (!currentUser) return;

    try {
        const q = query(collection(db, "categories"), where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);
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


// ======================================================

// Wait for page to be ready
setTimeout(function () {
    // Get all category items
    const categories = document.querySelectorAll('.category-item');
    const rows = document.querySelectorAll('tbody tr');
    // Add click handlers to each category
    categories.forEach((category, index) => {
        category.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Remove active from all
            categories.forEach(cat => cat.classList.remove('active-category'));
            // Add active to clicked
            this.classList.add('active-category');
            // Get the category name
            const categoryName = this.textContent.trim();
            // Filter rows
            rows.forEach((row, rowIndex) => {
                const rowCategory = row.querySelector('.category-cell').textContent.trim();
                if (rowCategory === categoryName) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
    // All Tasks click handler
    const allTasks = document.querySelector('.all_task');
    if (allTasks) {
        allTasks.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            categories.forEach(cat => cat.classList.remove('active-category'));
            rows.forEach(row => row.style.display = '');
        });
    }
}, 1000);

//================== filter caregory ========================

setTimeout(function () {
    // Get all category items
    const categories = document.querySelectorAll('.category-item');
    const rows = document.querySelectorAll('tbody tr');
    // Add click handlers to each category
    categories.forEach((category, index) => {
        category.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Remove active from all
            categories.forEach(cat => cat.classList.remove('active-category'));
            // Add active to clicked
            this.classList.add('active-category');
            // Get the category name
            const categoryName = this.textContent.trim();
            // Filter rows
            rows.forEach((row, rowIndex) => {
                const rowCategory = row.querySelector('.category-cell').textContent.trim();
                if (rowCategory === categoryName) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
    // All Tasks click handler
    const allTasks = document.querySelector('.all_task');
    if (allTasks) {
        allTasks.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            categories.forEach(cat => cat.classList.remove('active-category'));
            rows.forEach(row => row.style.display = '');
        });
    }
}, 1000);

