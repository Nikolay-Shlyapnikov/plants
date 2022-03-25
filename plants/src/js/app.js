const formBtn = document.querySelector('.form__button');
const cross = document.querySelector('.window__cross');

const sendBtn = document.querySelector('.form-button.send');
const backBtn = document.querySelector('.form-button.back');

const overlay = document.querySelector('.overlay');
const errorSpan = document.querySelector('span.error');

const nameInput = document.querySelector('.form__input.name');
const numberInput = document.querySelector('.form__input.number');

const window = document.querySelector('.window');
const spinner = document.querySelector('.spinner__wrapper');

let nameValid = false; //изначально форма не валидна
let numberValid = false;
document.addEventListener('click', (e) => {
    if (e.target == formBtn) { //дополнительные проверки на отображение окна не требуются, т.к. если окно открыто, то не получится нажать на кнопку "форма" и наоборот
        overlay.style.display = 'flex';
        document.body.style.overflowY = 'hidden';
    }
    if (e.target == cross || e.target == backBtn || e.target.closest('div.window__cross') || e.target.closest('button.form-button.back')) { // делегирование событий
        overlay.style.display = 'none';
        document.body.style.overflowY = 'scroll';
    }
    if (e.target == sendBtn || e.target.closest('button.form-button.send')) {
        if (numberValid && nameValid) { // если и имя, и номер валидны, то запрос можно отправлять на сервер 
            sendInformation();
        }
    }
}, true);
numberInput.onblur = function() {
    if ((this.value.includes('+7') && this.value.length == 12) || (this.value.includes('8') && this.value.length == 11)) { //Условия валидности номера телефона проверяются по окончанию ввода
        numberValid = true;
    } else {
        numberValid = false;
    }
}
nameInput.onblur = function() { //Условия валидности имени проверяются по окончанию ввода
    if (this.value.length > 2) {
        nameValid = true;
    } else {
        nameValid = false;
    }
}
const xhr = new XMLHttpRequest();

function sendInformation() { //функция по отправке информации на сервер 

    xhr.responseType = "json";
    xhr.onreadystatechange = function() {
        if (this.readyState != 4) { // в процессе изменения состояния запроса на всех стадиях будет крутиться спиннер 
            spinner.style.display = 'flex';
        }
        if (this.readyState == 4) {
            if (this.status == 200) {
                spinner.style.display = 'none'; //по завершении запроса спиннер выключается 
                resultOfQuery(this.response); // передача данных в формате JSON в функцию 
            } else {
                errorSpan.innerHTML = 'Ошибка при запросе'; // если результат запроса неудовлетворительный, то выводится ошибка
                return;
            }
        }

    }
    xhr.open('GET', 'https://jsonplaceholder.typicode.com/todos', true);
    xhr.send();
};

function resultOfQuery(data) { //функция для получения нужных элементов массива
    let resultArray = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].userId == 5 && data[i].completed == false) {
            resultArray.push(data[i]); //добавление подходящих объектов в отдельный результирующий массив
        }

    }
    printResults(resultArray);
    console.log(resultArray);
};

function printResults(Array) { // функция по отрисовке результатов
    window.innerHTML = `<div class="result__table">
	 								<div class="table__row">
		  								<div class='table__num'>Номер</div>
		  								<div class='table__user-id'>userID</div>
		  								<div class='table__id'>id</div>
		  								<div class='table__title'>title</div>
		  								<div class='table__complete'>complete</div>
	 								</div>
								</div>`; // Заголовок таблицы
    const table = document.querySelector('.result__table');
    for (let i = 0; i < Array.length; i++) {
        table.insertAdjacentHTML('beforeend', `
		  <div class="table__row">
			  <div class='table__num'>${i+1}</div>
			  <div class='table__user-id'>${Array[i].userId}</div>
			  <div class='table__id'>${Array[i].id}</div>
			  <div class='table__title'>${Array[i].title}</div>
			  <div class='table__completed'>${Array[i].completed}</div>
			</div>`);

    }
}