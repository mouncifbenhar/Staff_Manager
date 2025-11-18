let sidebar = document.querySelector('.sidebar');
let menubtn = document.getElementById('menu-btn');
let menubtnC = document.getElementById('menu-btn-c');

menubtn.addEventListener('click', ()=>{
    sidebar.classList.toggle('open');   
});

menubtnC.addEventListener('click', ()=>{
    sidebar.classList.remove('open');   
});