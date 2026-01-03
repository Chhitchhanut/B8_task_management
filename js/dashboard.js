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
const mobileNavOverlay = document.getElementById('mobileNavOverlay');
const mobileNavClose = document.getElementById('mobileNavClose');

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
    if (window.innerWidth <= 1024) {
        // Mobile navigation toggle
        nav.classList.toggle('mobile-hidden');
        nav.classList.toggle('mobile-visible');
        mobileNavOverlay.classList.toggle('active');
        
        // Prevent body scroll when mobile nav is open
        if (nav.classList.contains('mobile-visible')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    } else {
        // Desktop navigation toggle
        downIcon.style.display = 'none';
        nav.classList.toggle('compact');
        allCategory.style.display = 'none';
        headContent.classList.toggle('hidden');
        if (!nav.classList.contains('compact')) {
            downIcon.style.display = 'block';
            allCategory.style.display = 'block';
        }
    }
}

// Close mobile navigation when clicking overlay
mobileNavOverlay.addEventListener('click', closeMobileNav);

// Close mobile navigation when clicking the close button
mobileNavClose.addEventListener('click', closeMobileNav);

// Function to close mobile navigation
function closeMobileNav() {
    nav.classList.remove('mobile-visible');
    nav.classList.add('mobile-hidden');
    mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        // Reset mobile navigation styles when switching to desktop
        nav.classList.remove('mobile-hidden', 'mobile-visible');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

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
    
    // Prevent creating gmail categories
    if (newCategoryName.toLowerCase().includes('gmail')) {
        alert('Gmail categories cannot be created.');
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

        // Also add to the task form category dropdown
        const option = document.createElement('option');
        option.value = newCategoryName;
        option.textContent = newCategoryName;
        categorySelect.appendChild(option);

        // Also add to the category filter dropdown
        const filterOption = document.createElement('option');
        filterOption.value = newCategoryName;
        filterOption.textContent = newCategoryName;
        categoryFilter.appendChild(filterOption);

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
        const taskCategory = row.querySelector('.category-select')?.value.toLowerCase() || '';
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
let rateChart; // Make sure this is declared globally

onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    // USER NAME
    usernameTag.textContent = user.displayName || user.email || "Guest";

    // LOAD CATEGORIES
    const categoriesRef = collection(db, 'categories');
    const catQuery = query(categoriesRef, where('email', '==', user.email));

    try {
        // Clear dropdowns
        categorySelect.innerHTML = '<option value="" selected disabled>-- Select Category --</option>';
        categoryFilter.innerHTML = '<option value="">Filter by Category</option>';

        const catSnapshot = await getDocs(catQuery);
        catSnapshot.forEach(doc => {
            const { category } = doc.data();
            if (category && !category.toLowerCase().includes('gmail') && category.trim() !== '') {
                // Task form dropdown
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);

                // Filter dropdown
                const filterOption = document.createElement('option');
                filterOption.value = category;
                filterOption.textContent = category;
                categoryFilter.appendChild(filterOption);
            }
        });
    } catch (err) {
        console.error('Category error:', err);
    }

    // LOAD TASKS
    const tasksRef = collection(db, "tasks");
    const taskQuery = query(tasksRef, where('email', '==', user.email));
    const taskSnapshot = await getDocs(taskQuery);

    const tasks = taskSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // COUNT TASKS
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "done").length;
    const incompleteTasks = tasks.filter(t => t.status !== "done").length;

    document.getElementById("rate-all-tasks").textContent = totalTasks;
    document.getElementById("rate-completed-tasks").textContent = completedTasks;
    document.getElementById("rate-incomplete-tasks").textContent = incompleteTasks;

    // TABLE
    const rateTableBody = document.getElementById("rate-task-table-body");
    const btnCompleted = document.querySelector('.rate-completed-btn');
    const btnIncomplete = document.querySelector('.rate-incomplete-btn');

    function renderTasks(list) {
        rateTableBody.innerHTML = '';
        list.forEach(task => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${task.taskName}</td>
                <td class="rate-status-${task.status.toLowerCase()}">${task.status}</td>
                <td>${task.category}</td>
                <td>${task.remark}</td>
            `;
            rateTableBody.appendChild(tr);
        });
    }

    function setActive(type) {
        btnCompleted.classList.remove('rate-btn-active');
        btnIncomplete.classList.remove('rate-btn-active-incomplete');

        if (type === 'completed') btnCompleted.classList.add('rate-btn-active');
        if (type === 'incomplete') btnIncomplete.classList.add('rate-btn-active-incomplete');
    }

    // Default view
    renderTasks(tasks.filter(t => t.status === "done"));
    setActive('completed');

    btnCompleted.addEventListener('click', () => {
        renderTasks(tasks.filter(t => t.status === "done"));
        setActive('completed');
    });

    btnIncomplete.addEventListener('click', () => {
        renderTasks(tasks.filter(t => t.status !== "done"));
        setActive('incomplete');
    });

    // PIE CHART
    const perfomanceBtn = document.querySelector('.rate');
    const perfomanceSec = document.querySelector('.completed-rate');

    perfomanceBtn.addEventListener('click', () => {
        perfomanceBtn.classList.add('nav-active');
        perfomanceSec.style.display = 'block';
        mainTop.style.display = 'none';
        mainBottom.style.display = 'none';

        // Only create chart once
        if (!rateChart) {
            const ctx = document.getElementById('rate-taskChart').getContext('2d');
            rateChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Completed', 'Incomplete'],
                    datasets: [{
                        data: [completedTasks, incompleteTasks],
                        backgroundColor: ['#3b82f6', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const value = context.raw;
                                    const percent = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${percent}% (${value})`;
                                }
                            }
                        }
                    }
                }
            });
        }
    });
    loadTasks()
});



// ----------------------------
// TASK MODAL LOGIC
// ----------------------------
showCreateTaskBtn.addEventListener('click', () => {
    mainTop.style.display = 'none';
    mainBottom.style.display = 'none';
    taskForm.style.display = 'block';
    perfomanceSec.style.display = 'none';
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

function formatDueDate(dateValue) {
    if (!dateValue) return '—';
    try {
        let date;
        
        // Handle Firebase timestamp
        if (dateValue.toDate) {
            date = dateValue.toDate();
        }
        // Handle string dates
        else if (typeof dateValue === 'string') {
            date = new Date(dateValue);
        }
        // Handle Date objects
        else if (dateValue instanceof Date) {
            date = dateValue;
        }
        // Handle timestamp numbers
        else if (typeof dateValue === 'number') {
            date = new Date(dateValue);
        }
        
        if (isNaN(date.getTime())) {
            return '—';
        }
        
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        console.error('Date formatting error:', e);
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

// Load tasks - CONSOLIDATED FUNCTION
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
        let no =1 ;
        
        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:50px; color:#888;">No tasks yet</td></tr>';
            updateTaskCounts();
            filterTasks();
            return;
        }


        querySnapshot.forEach((doc, index) => {
            const task = doc.data();
            const row = document.createElement('tr');
            row.dataset.id = doc.id;

            row.innerHTML = `
                <td>${no++}</td>
                <td>${escapeHtml(task.taskName || 'Untitled')}</td>
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
                <td>
                    <select class="category-select">
                        <option value="">—</option>
                    </select>
                </td>
                <td>${formatDueDate(task.dueDate)}</td>
                <td>
                    <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                    <button class="delete-btn"><i class="fa-solid fa-trash"></i> Delete</button>
                </td>
                <td>${escapeHtml(task.remark || '—')}</td>
            `;

            // Populate category dropdown with available categories
            const categorySelect = row.querySelector('.category-select');
            const categoriesRef = collection(db, 'categories');
            const categoriesQuery = query(categoriesRef, where('email', '==', auth.currentUser.email));
            
            getDocs(categoriesQuery).then((categoriesSnapshot) => {
                categoriesSnapshot.forEach((categoryDoc) => {
                    const categoryData = categoryDoc.data();
                    if (categoryData.category && 
                        !categoryData.category.toLowerCase().includes('gmail') && 
                        categoryData.category.trim() !== '') {
                        
                        const option = document.createElement('option');
                        option.value = categoryData.category;
                        option.textContent = categoryData.category;
                        if (task.category === categoryData.category) {
                            option.selected = true;
                        }
                        categorySelect.appendChild(option);
                    }
                });
            });

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

// CONSOLIDATED EVENT HANDLERS FOR TABLE
tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const row = btn.closest('tr');
    const taskId = row.dataset.id;

    if (btn.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteDoc(doc(db, 'tasks', taskId));
                // Reload tasks to refresh the table
                await loadTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task. Please try again.');
            }
        }

    } else if (btn.classList.contains('edit-btn')) {
        enterEditMode(row);


    } else if (btn.classList.contains('save-btn')) {
        await saveTask(row, taskId);

    } else if (btn.classList.contains('cancel-btn')) {
        // Restore the original row HTML
        row.innerHTML = originalRowHTML;
        row.classList.remove('editing');
    }
});

tbody.addEventListener('change', async (e) => {
    if (e.target.matches('.status-select, .priority-select, .category-select')) {
        const row = e.target.closest('tr');
        const taskId = row.dataset.id;
        
        let field;
        if (e.target.classList.contains('status-select')) {
            field = 'status';
        } else if (e.target.classList.contains('priority-select')) {
            field = 'priority';
        } else if (e.target.classList.contains('category-select')) {
            field = 'category';
        }
        
        try {
            await updateDoc(doc(db, 'tasks', taskId), { [field]: e.target.value });
            if (field === 'status') {
                updateTaskCounts(); // Update counts when status changes
            }
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task. Please try again.');
        }
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
    // const category = inputs[1].value.trim();
    const dueDateText = inputs[1].value.trim();
    const remark = inputs[2].value.trim();

    if (!taskName) {
        alert('Task Name is required!');
        return;
    }

    const updateData = {
        taskName,
        // category: category || null,
        category: row.querySelector('.category-select').value,
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
        // Reload tasks to refresh the table with updated data
        await loadTasks();
    } catch (error) {
        console.error('Error saving task:', error);
        alert('Failed to save task. Please try again.');
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
            const categoryData = doc.data();
            // Filter out gmail categories and only show created categories
            if (categoryData.category && 
                !categoryData.category.toLowerCase().includes('gmail') && 
                categoryData.category.trim() !== '') {
                const div = document.createElement("div");
                div.textContent = categoryData.category;
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
                        categoryFilter.value = categoryData.category;
                        categoryFilter.dispatchEvent(new Event('change'));
                    }
                });
                smallCategoryDiv.appendChild(div);
            }
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


const logoutBtn = document.querySelector('.logout');

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert('Logged out successfully!');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
});

// ----------------------------
// THEME AND SETTINGS FUNCTIONALITY
// ----------------------------

// Theme Management
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const settingsModal = document.getElementById('settings-modal');
const settingsBtn = document.querySelector('.setting.icons');
const closeSettingsBtn = document.querySelector('[data-close-settings]');
const settingsForm = document.getElementById('settings-form');
const themeSelect = document.getElementById('theme-select');

// Initialize theme from localStorage or system preference
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme = 'light';
    if (savedTheme) {
        theme = savedTheme;
    } else if (systemPrefersDark) {
        theme = 'dark';
    }
    
    applyTheme(theme);
    updateThemeIcon(theme);
    if (themeSelect) themeSelect.value = theme;
}

// Apply theme to document
function applyTheme(theme) {
    if (theme === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
}

// Update theme icon
function updateThemeIcon(theme) {
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'bx bx-sun';
        } else {
            themeIcon.className = 'bx bx-moon';
        }
    }
}

// Toggle theme with button
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    updateThemeIcon(newTheme);
    if (themeSelect) themeSelect.value = newTheme;
}

// Settings Management
const defaultSettings = {
    theme: 'auto',
    compactView: false,
    autoComplete: false,
    showCompleted: true,
    defaultPriority: 'medium',
    tasksPerPage: 20,
    dueDateAlerts: true,
    overdueNotifications: true,
    dailySummary: false,
    dataSync: true,
    analytics: false
};

function loadSettings() {
    const savedSettings = localStorage.getItem('taskSettings');
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
}

function saveSettings(settings) {
    localStorage.setItem('taskSettings', JSON.stringify(settings));
}

function applySettings(settings) {
    // Apply form validation setting
    const formValidation = settings.formValidation !== false;
    
    // Apply other settings as needed
    console.log('Settings applied:', settings);
}

// Event Listeners
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        if (settingsModal) {
            settingsModal.style.display = 'flex';
            settingsModal.setAttribute('aria-hidden', 'false');
            mainContentContainer.style.display = 'none';
            document.body.style.background = 'rgba(50, 44, 44, 0.17)';
            
            // Add smooth animation to modal
            setTimeout(() => {
                settingsModal.querySelector('.modal-card').classList.add('scale-in');
            }, 10);
            
            // Load current settings into form
            const settings = loadSettings();
            document.getElementById('compact-view').checked = settings.compactView;
            document.getElementById('auto-complete').checked = settings.autoComplete;
            document.getElementById('show-completed').checked = settings.showCompleted;
            document.getElementById('default-priority').value = settings.defaultPriority;
            document.getElementById('tasks-per-page').value = settings.tasksPerPage;
            document.getElementById('due-date-alerts').checked = settings.dueDateAlerts;
            document.getElementById('overdue-notifications').checked = settings.overdueNotifications;
            document.getElementById('daily-summary').checked = settings.dailySummary;
            document.getElementById('data-sync').checked = settings.dataSync;
            document.getElementById('analytics').checked = settings.analytics;
        }
    });
}

if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
        if (settingsModal) {
            settingsModal.querySelector('.modal-card').classList.remove('scale-in');
            setTimeout(() => {
                settingsModal.style.display = 'none';
                settingsModal.setAttribute('aria-hidden', 'true');
                mainContentContainer.style.display = 'flex';
                document.body.style.background = '';
            }, 300);
        }
    });
}

if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const settings = {
            compactView: document.getElementById('compact-view').checked,
            autoComplete: document.getElementById('auto-complete').checked,
            showCompleted: document.getElementById('show-completed').checked,
            defaultPriority: document.getElementById('default-priority').value,
            tasksPerPage: parseInt(document.getElementById('tasks-per-page').value),
            dueDateAlerts: document.getElementById('due-date-alerts').checked,
            overdueNotifications: document.getElementById('overdue-notifications').checked,
            dailySummary: document.getElementById('daily-summary').checked,
            dataSync: document.getElementById('data-sync').checked,
            analytics: document.getElementById('analytics').checked
        };
        
        saveSettings(settings);
        applySettings(settings);
        
        if (settingsModal) {
            settingsModal.querySelector('.modal-card').classList.remove('scale-in');
            setTimeout(() => {
                settingsModal.style.display = 'none';
                settingsModal.setAttribute('aria-hidden', 'true');
                mainContentContainer.style.display = 'flex';
                document.body.style.background = '';
            }, 300);
        }
        
        alert('Settings saved successfully!');
    });
}

if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        applyTheme(theme);
        updateThemeIcon(theme);
    });
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'auto') {
        applyTheme('auto');
        updateThemeIcon(e.matches ? 'dark' : 'light');
    }
});

// Initialize theme on page load
initializeTheme();

// Export and Clear Data Functions
async function exportAllTasks() {
    if (!currentUser) {
        alert('Please log in to export tasks');
        return;
    }

    try {
        const q = query(collection(db, "tasks"), where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);
        const tasks = [];
        
        querySnapshot.forEach((doc) => {
            const taskData = doc.data();
            tasks.push({
                id: doc.id,
                ...taskData,
                createdAt: taskData.createdAt?.toDate()?.toISOString(),
                dueDate: taskData.dueDate?.toDate()?.toISOString()
            });
        });

        // Create JSON blob and download
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`Exported ${tasks.length} tasks successfully!`);
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export tasks. Please try again.');
    }
}

async function clearAllData() {
    if (!currentUser) {
        alert('Please log in to clear data');
        return;
    }

    const confirmed = confirm(
        '⚠️ WARNING: This will permanently delete ALL your tasks and categories. This action cannot be undone. Are you sure you want to continue?'
    );

    if (!confirmed) return;

    const doubleConfirmed = confirm(
        '🚨 FINAL WARNING: All your data will be lost forever. Type "DELETE" to confirm this action.'
    );

    if (doubleConfirmed) {
        try {
            // Delete all tasks
            const tasksQuery = query(collection(db, "tasks"), where("email", "==", currentUser.email));
            const tasksSnapshot = await getDocs(tasksQuery);
            
            const deletePromises = tasksSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // Delete all categories
            const categoriesQuery = query(collection(db, "categories"), where("email", "==", currentUser.email));
            const categoriesSnapshot = await getDocs(categoriesQuery);
            
            const categoryDeletePromises = categoriesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(categoryDeletePromises);

            // Clear localStorage
            localStorage.removeItem('taskSettings');
            localStorage.removeItem('taskFormDraft');
            localStorage.removeItem('theme');

            // Reload the page to show empty state
            alert('All data has been cleared successfully. The page will now reload.');
            window.location.reload();
        } catch (error) {
            console.error('Clear data error:', error);
            alert('Failed to clear data. Please try again.');
        }
    }
}

// Form Validation Enhancement
function enhanceFormValidation() {
    const settings = loadSettings();
    
    if (settings.formValidation) {
        // Add stricter validation to task form
        const taskNameInput = document.getElementById('taskName');
        const dueDateInput = document.getElementById('dueDate');
        
        if (taskNameInput) {
            taskNameInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value.length < 3) {
                    e.target.setCustomValidity('Task name must be at least 3 characters long');
                } else if (value.length > 100) {
                    e.target.setCustomValidity('Task name must be less than 100 characters');
                } else {
                    e.target.setCustomValidity('');
                }
            });
        }
        
        if (dueDateInput) {
            dueDateInput.addEventListener('change', (e) => {
                const selectedDate = new Date(e.target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    e.target.setCustomValidity('Due date cannot be in the past');
                } else {
                    e.target.setCustomValidity('');
                }
            });
        }
    }
}

// Auto-save functionality
function enableAutoSave() {
    const settings = loadSettings();
    
    if (settings.autoSave) {
        const taskForm = document.querySelector('.task-form');
        if (taskForm) {
            const formInputs = taskForm.querySelectorAll('input, select, textarea');
            
            formInputs.forEach(input => {
                input.addEventListener('input', () => {
                    // Save form data to localStorage
                    const formData = new FormData(taskForm);
                    const formDataObj = {};
                    formData.forEach((value, key) => {
                        formDataObj[key] = value;
                    });
                    localStorage.setItem('taskFormDraft', JSON.stringify(formDataObj));
                });
            });
        }
    }
}

// Add event listeners for export and clear buttons
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-data');
    const clearBtn = document.getElementById('clear-data');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportAllTasks);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
    }
});

// Initialize form enhancements
enhanceFormValidation();
enableAutoSave();