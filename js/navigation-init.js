// Set All Tasks as active by default on page load
setTimeout(() => { 
    document.querySelector('.all_task').classList.add('nav-active'); 
}, 1500);

// Add proper All Tasks click handler to switch content views
setTimeout(() => {
    const allTasksBtn = document.querySelector('.all_task');
    if (allTasksBtn) {
        // Remove existing click handler and add new one
        allTasksBtn.replaceWith(allTasksBtn.cloneNode(true));
        const newAllTasksBtn = document.querySelector('.all_task');
        
        newAllTasksBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove active class from all navigation items
            document.querySelectorAll('.icons').forEach(item => { 
                item.classList.remove('nav-active'); 
            }); 
            // Add active class to All Tasks
            newAllTasksBtn.classList.add('nav-active'); 
            
            // Remove active category selection
            document.querySelectorAll('.category-item').forEach(cat => cat.classList.remove('active-category'));
            
            // Show all task rows
            document.querySelectorAll('tbody tr').forEach(row => row.style.display = '');
            
            // Show task table and hide performance section
            document.querySelector('.main-top').style.display = 'block';
            document.querySelector('.mian-button').style.display = 'block';
            document.querySelector('.completed-rate').style.display = 'none';
            document.querySelector('.task-form').style.display = 'none';
        });
    }
}, 1600);
