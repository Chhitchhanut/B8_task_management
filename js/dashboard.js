// ----------------------------
// IMPORTS
// ----------------------------
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, serverTimestamp, getDocs, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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