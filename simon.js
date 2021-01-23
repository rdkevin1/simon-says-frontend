const levels = 10;
let keys = generateKeys();
let points = 0;
let successes = 0;
let formModal = new bootstrap.Modal(document.getElementById("formModal"), { backdrop: 'static' });
let pointsModal = new bootstrap.Modal(document.getElementById("pointsModal"), { backdrop: 'static' });
let title = '';
let userLevel = 0;
let lastPoints = [];
let initButton = document.getElementById('initButton');
const form = document.getElementById('formUser');
form.addEventListener('submit', submitUserForm);


let apiUrl = 'http://localhost:8000';

async function submitUserForm(event) {
    event.preventDefault();
    document.getElementById('registerButton').disabled = true;
    let url = `${apiUrl}/users/create`;
    let params = {
        'name': form.elements['name'].value,
        'points': points,
        'level': userLevel
    };    
    await axios.post(url, params).then(response => {        
        form.reset();
        formModal.hide(); 
        resetInfo();        
        Swal.fire({
            icon: 'success',
            title: 'Registro guardado con exito',                                   
            showConfirmButton: false, 
            timer: 2000,         
            allowOutsideClick: false
        });      
        getLastPoints();
    }).catch(error => {
        console.log(error);
        Swal.fire({
            icon: 'error',
            title: 'Ocurrio un error, intentelo de nuevo.',                                   
            showConfirmButton: false, 
            timer: 2000,         
            allowOutsideClick: false
        });          
    }).finally(() => document.getElementById('registerButton').disabled = false);
}

async function getLastPoints() {
    let url = `${apiUrl}/users`;
    await axios.get(url).then(response => {
        lastPoints = response.data;
        console.log(lastPoints);
        openPointsModal();
    }).catch(error => {
        console.log(error);
        Swal.fire({
            icon: 'error',
            title: 'Ocurrio un error, intentelo de nuevo.',                                   
            showConfirmButton: false, 
            timer: 2000,         
            allowOutsideClick: false
        });  
    });
}

function openFormModal() {
    document.getElementById('modalTitle').innerHTML = title;
    document.getElementById('points').innerHTML = `Puntos: ${points}`;
    document.getElementById('successes').innerHTML = `Aciertos: ${successes}`;
    return formModal.show();
}

function openPointsModal() {
    lastPointsSpace = document.getElementById('lastPoints');
    for (let user of lastPoints) {
        lastPointsSpace.innerHTML += `<li> Nombre: ${user.name} Puntos: ${user.points} Nivel: ${user.level} </li>`;
    }
    pointsModal.show();
}

function askPlayAgain() {
    pointsModal.hide();
    Swal.fire({
        title: title,
        text: '¿Quieres jugar de nuevo?',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        allowOutsideClick: false
    }).then((event) => {
        if (event.isConfirmed) {
            resetInfo();
            keys = generateKeys();
            nextLevel(0);
        } else {
            resetInfo();
            initButton.disabled = false;
        }
    });
}

function resetInfo() {
    title = '';
    points = 0;
    successes = 0;
}

function nextLevel(actualLevel) {
    userLevel = actualLevel;
    if (actualLevel === levels) {
        title = 'Ganaste';
        return openFormModal();
    }
    Swal.fire({
        title: `Nivel ${actualLevel + 1}`,
        text: `Aciertos: ${successes} \n Puntos: ${points}`,
        timer: 1000,
        showConfirmButton: false
    });
    for (let i = 0; i <= actualLevel; i++) {
        setTimeout(() => activate(getElementByKeyCode(keys[i])), 1000 * (i + 1) + 1000);
    }
    let i = 0;
    let actualKey = keys[i];
    points += 10;
    window.addEventListener('keydown', onkeydown);

    function onkeydown(ev) {
        const el = getElementByKeyCode(ev.keyCode);
        if (ev.keyCode === actualKey) {
            activate(el, { success: true });
            i++;
            if (i > actualLevel) {
                window.removeEventListener('keydown', onkeydown);
                setTimeout(() => nextLevel(i), 1500);
            }
            actualKey = keys[i];            
        } else {
            activate(el, { fail: true });
            if (actualLevel == 0) points = 0;
            const correctElement = getElementByKeyCode(actualKey);
            activate(correctElement);
            setTimeout(() => {
                title = 'Perdiste';
                openFormModal();
            }, 1000);
        }
    }
}

function generateKeys() {
    return new Array(levels).fill(0).map(generateRandomKey);
}

function generateRandomKey() {
    const min = 65;
    const max = 90;
    return Math.round(Math.random() * (max - min) + 65);
}

function getElementByKeyCode(keyCode) {
    return document.querySelector(`[data-key="${keyCode}"]`);
}

function activate(el, opts = {}) {
    el.classList.add('active');
    if (opts.success) {
        successes++;
        el.classList.add('success');
    } else if (opts.fail) {
        el.classList.add('fail');
    }
    setTimeout(deactivate.bind(null, el), 500);
}

function deactivate(el) {
    el.className = 'key';
}

function init() {
    Swal.fire({
        title: `Iniciando`,
        timer: 1000,
        showConfirmButton: false
    });
    initButton.disabled = true;
    setTimeout(() => nextLevel(0), 2000);
}

