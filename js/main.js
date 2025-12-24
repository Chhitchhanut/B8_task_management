
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


btnCategory.addEventListener('click', () => {
    sections.style.display = 'block';
    document.body.style.background = ' rgba(50, 44, 44, 0.17)'
});

cancelCategory.addEventListener('click', () => {
    sections.style.display = 'none';
});

// CREATE NEW CATEGORY
const smallCategory = document.getElementById('small-category');
doneCategory.addEventListener('click', (e) => {
    e.preventDefault();
    const newCategoryName = inputCategory.value.trim();
    if (newCategoryName === '') {
        alert('Please enter a category name.');
    }
    const text = document.createElement('div'); 
    text.textContent = newCategoryName;
    smallCategory.appendChild(text); 
    inputCategory.value = '';
});

