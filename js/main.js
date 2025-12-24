
    const menuButton = document.getElementById("menu-button");
    const nav = document.getElementById("nav");
    const headContent = document.getElementById("head_contain");
    
    function hideShowBtn(){
        nav.classList.toggle('compact');
        headContent.classList.toggle('hidden');

    }
    menuButton.addEventListener("click", hideShowBtn)
