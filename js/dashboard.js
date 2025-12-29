
// MENU BUTTON
const menuButton = document.getElementById("menu-button");
const nav = document.getElementById("nav");
const headContent = document.getElementById("head_contain");
function hideShowBtn() {
    nav.classList.toggle('compact');
    headContent.classList.toggle('hidden');
}
menuButton.addEventListener("click", hideShowBtn)

// CREATE CATEGORY

const sections = document.getElementById('category-modal');
const inputCategory = document.getElementById('category-name');
const modelAction = document.querySelectorAll('.modal-actions button')
const cancelCategory = document.querySelector('.cancel');
const doneCategory = document.querySelector('.done');
const btnCategory = document.querySelector('.create_category');
const mainContentContainer = document.querySelector('.main-content-container');

btnCategory.addEventListener('click', () => {
    sections.style.display = 'block';
    mainContentContainer.style.display = 'none';
    document.body.style.background = ' rgba(50, 44, 44, 0.17)'
});

cancelCategory.addEventListener('click', () => {
    sections.style.display = 'none';
    document.body.style.background = 'none'
    mainContentContainer.style.display = 'block';
    inputCategory.value = '';

});

// CREATE NEW CATEGORY
const smallCategory = document.getElementById('small-category');
doneCategory.addEventListener('click', (e) => {
    e.preventDefault();
    const text = document.createElement('div');
    const newCategoryName = inputCategory.value.trim();
    if (newCategoryName === '') {
        alert('Please enter a category name.');
    }
    else {
        text.textContent = newCategoryName;
    }
    smallCategory.appendChild(text);
    inputCategory.value = '';
    document.body.style.background = 'none'
    sections.style.display = 'none'
    mainContentContainer.style.display = 'block';

});


document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('tbody');

  
    tableBody.addEventListener('click', function (e) {
        const button = e.target.closest('button');
        if (!button) return;

        const row = button.closest('tr');

        if (button.classList.contains('edit-btn')) {
            handleEdit(row);
        } else if (button.classList.contains('delete-btn')) {
            handleDelete(row);
        } else if (button.classList.contains('save-btn')) {
            handleSave(row);
        } else if (button.classList.contains('cancel-btn')) {
            handleCancel(row);
        }
    });

    function handleEdit(row) {
        
        if (row.classList.contains('editing')) return;

        row.originalData = {
            name: row.cells[1].textContent.trim(),
            status: row.cells[2].querySelector('select').value || '',
            priority: row.cells[3].querySelector('select').value || '',
            category: row.cells[4].textContent.trim(),
            dueDate: row.cells[5].textContent.trim()
        };

        row.cells[1].innerHTML = `<input type="text" class="edit-input" value="${row.originalData.name}">`;

    
        const statusSelect = row.cells[2].querySelector('select');
        statusSelect.disabled = false;
        statusSelect.value = row.originalData.status || '';

        
        const prioritySelect = row.cells[3].querySelector('select');
        prioritySelect.disabled = false;
        prioritySelect.value = row.originalData.priority || '';

        row.cells[4].innerHTML = `<input type="text" class="edit-input" value="${row.originalData.category}">`;
        row.cells[5].innerHTML = `<input type="date" class="edit-input" value="${row.originalData.dueDate}">`;

        
        row.cells[6].innerHTML = `
            <button class="save-btn" style="background:#28a745;color:white;">
                <i class="fa-solid fa-check"></i> Save
            </button>
            <button class="cancel-btn" style="background:#6c757d;color:white;">
                <i class="fa-solid fa-xmark"></i> Cancel
            </button>
        `;

        row.classList.add('editing');
    }

    function handleSave(row) {
        
        const newName = row.cells[1].querySelector('input').value.trim();
        const newStatus = row.cells[2].querySelector('select').value;
        const newPriority = row.cells[3].querySelector('select').value;
        const newCategory = row.cells[4].querySelector('input').value.trim();
        const newDueDate = row.cells[5].querySelector('input').value;

        
        if (!newName || !newStatus || !newPriority) {
            alert('Please fill in Name, Status, and Priority.');
            return;
        }

        
        row.cells[1].textContent = newName;
        row.cells[2].querySelector('select').value = newStatus;
        row.cells[3].querySelector('select').value = newPriority;
        row.cells[4].textContent = newCategory;
        row.cells[5].textContent = newDueDate || '—';

       
        row.cells[6].innerHTML = `
            <button class="edit-btn">
                <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="delete-btn">
                <i class="fa-solid fa-trash"></i> Delete
            </button>
        `;

        row.classList.remove('editing');
    }

    function handleCancel(row) {
        
        row.cells[1].textContent = row.originalData.name;
        row.cells[2].querySelector('select').value = row.originalData.status;
        row.cells[3].querySelector('select').value = row.originalData.priority;
        row.cells[4].textContent = row.originalData.category;
        row.cells[5].textContent = row.originalData.dueDate || '—';

        
        row.cells[6].innerHTML = `
            <button class="edit-btn">
                <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="delete-btn">
                <i class="fa-solid fa-trash"></i> Delete
            </button>
        `;

        row.classList.remove('editing');
        delete row.originalData;
    }

    function handleDelete(row) {
        if (confirm('Are you sure you want to delete this task?')) {
            row.remove();

            
            document.querySelectorAll('tbody tr').forEach((tr, index) => {
                tr.cells[0].textContent = index + 1;
            });
        }
    }
});






