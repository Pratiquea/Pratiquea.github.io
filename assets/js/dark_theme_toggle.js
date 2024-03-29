const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); //add this
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); //add this
    }    
}

function switchText(e){
    if (e.target.checked) {
        document.getElementById('switch-text').innerHTML = "Dark Mode is On!"
    }
    else {
        document.getElementById('switch-text').innerHTML = "Enable Dark Mode!"
    }
}

toggleSwitch.addEventListener('change', switchTheme, false);
toggleSwitch.addEventListener('change', switchText, false);
