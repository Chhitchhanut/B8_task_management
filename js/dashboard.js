// MENU BUTTON
const menuButton = document.getElementById("menu-button");
const nav = document.getElementById("nav");
const headContent = document.getElementById("head_contain");
const downIcon = document.getElementById('icon_down');
const allCategory = document.getElementById('small-category');
function hideShowBtn() {
    downIcon.style.display = 'none';
    nav.classList.toggle('compact');
    allCategory.style.display = 'none';
    headContent.classList.toggle('hidden');
    if (headContent) {
        allCategory.style.display = 'block';
    }
    if (nav.classList.contains('compact')) {
        downIcon.style.display = 'none';
        allCategory.style.display = 'none';
    } else {
        downIcon.style.display = 'block';
    }
}
menuButton.addEventListener("click", hideShowBtn);

// CREATE CATEGORY
const sections = document.getElementById('category-modal');
const inputCategory = document.getElementById('category-name');
const cancelCategory = document.querySelector('.cancel');
const doneCategory = document.querySelector('.done');
const btnCategory = document.querySelector('.create_category');
const mainContentContainer = document.querySelector('.main-content-container');
btnCategory.addEventListener('click', () => {
    sections.style.display = 'block';
    mainContentContainer.style.display = 'none';
    document.body.style.background = 'rgba(50, 44, 44, 0.17)';
    allCategory.style.display = 'block';
    // downIcon.style.display = 'block';
});

cancelCategory.addEventListener('click', () => {
    sections.style.display = 'none';
    document.body.style.background = 'none';
    mainContentContainer.style.display = 'block';
    inputCategory.value = '';
});

// CREATE NEW CATEGORY
doneCategory.addEventListener('click', (e) => {
    e.preventDefault();
    const newCategoryName = inputCategory.value.trim();
    if (newCategoryName === '') {
        alert('Please enter a category name.');
        return;
    }
    const text = document.createElement('div');
    text.textContent = newCategoryName;
    allCategory.appendChild(text);
    inputCategory.value = '';
    sections.style.display = 'none';
    document.body.style.background = 'none';
    mainContentContainer.style.display = 'block';
});

// DOWN CATEGORY TOGGLE

downIcon.addEventListener('click', () => {
    if (allCategory.style.display === 'none' || allCategory.style.display === '') {
        allCategory.style.display = 'block';
        downIcon.classList.remove('bx-chevron-down');
        downIcon.classList.add('bx-chevron-up');
    } else {
        allCategory.style.display = 'none';
        downIcon.classList.remove('bx-chevron-up');
        downIcon.classList.add('bx-chevron-down');
    }
});

// DATA
function updateTaskCounts() {
    // Cards
    const allCard = document.querySelector('.summary-card.all span');
    const doneCard = document.querySelector('.summary-card.done span');
    const inProgressCard = document.querySelector('.summary-card.progress span');
    const todoCard = document.querySelector('.summary-card.todo span');
    const statusSelects = document.querySelectorAll('.status-select');

    let all = statusSelects.length;
    let done = 0;
    let inProgress = 0;
    let todo = 0;

    // Count based on selected value
    statusSelects.forEach(select => {
        const value = select.value;
        if (value === 'done') done++;
        else if (value === 'in-progress') inProgress++;
        else if (value === 'todo') todo++;
    });

    // Update cards
    allCard.textContent = all;
    doneCard.textContent = done;
    inProgressCard.textContent = inProgress;
    todoCard.textContent = todo;
}

// Update counts whenever a status changes
const tableBody = document.querySelector('table tbody');
function tables(e) {
    if (e.target.classList.contains('status-select')) {
        updateTaskCounts();
    }
}
tableBody.addEventListener('change', tables);
updateTaskCounts();

// FILLER
const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');
const categoryFilter = document.getElementById('categoryFilter');
const tableRows = document.querySelectorAll('tbody tr');
const searchInput = document.getElementById('categorySearch');
const searchBtn = document.getElementById('searchBtn');

function filterTasks() {
    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;
    const selectedCategory = categoryFilter.value; // fixed typo

    for (let row of tableRows) {
        const taskStatus = row.querySelector('.status-select').value;
        const taskPriority = row.querySelector('.priority-select').value;
        const taskCategory = row.querySelector('.category-cell').textContent.toLowerCase();

        let showRow = true;

        if (selectedStatus && taskStatus !== selectedStatus) {
            showRow = false;
        }
        if (selectedPriority && taskPriority !== selectedPriority) {
            showRow = false;
        }
        if (selectedCategory && taskCategory !== selectedCategory.toLowerCase()) {
            showRow = false;
        }

        if (showRow) {
            row.style.display = '';
        } else {
            row.style.display = 'none';    
        }
    }
}
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filterTasks();
});

statusFilter.addEventListener('change', filterTasks);
priorityFilter.addEventListener('change', filterTasks);
categoryFilter.addEventListener('change', filterTasks);

// SEARCH
function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    tableRows.forEach(row => {
        const taskName = row.cells[1].textContent.toLowerCase(); // second column = Name
        if (taskName.includes(searchTerm)) {
            row.style.display = ''; // show row
        } else {
            row.style.display = 'none'; // hide row
        }
    });
}
// Trigger search on button click
searchBtn.addEventListener('click', filterTasks);
// Optional: filter while typing
searchInput.addEventListener('input', filterTasks);











