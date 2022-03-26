const formBtn = document.querySelector('.form__button');
const cross = document.querySelector('.window__cross');

const sendBtn = document.querySelector('.form-button.send');
const backBtn = document.querySelector('.form-button.back');

const overlay = document.querySelector('.overlay');
const errorServ = document.querySelector('span.serv-error');

const selectOption = document.querySelectorAll('.featured-plants__option');
const selectTitle = document.querySelector('.featured-plants__select-title-text');
const plantsPhotoArr = document.querySelectorAll('.featured-plants__photo>img');
const plantsPhotoName = document.querySelectorAll('.featured-plants__name');
const plantsPhotoPrice = document.querySelectorAll('.featured-plants__price');
let plantsInfo = [];
for (let i = 0; i < plantsPhotoArr.length; i++) { //Создание массива объектов растений, он необходим для фильтрации(не только по цене);
    plantsInfo[i] = {
        imgSrc: plantsPhotoArr[i].src,
        name: plantsPhotoName[i].textContent,
        price: plantsPhotoPrice[i].textContent.replace('IDR ', ''), // отсечение от цены лишних символов для последующих математических операций
    }
}
let plantsWrapper = document.querySelector('.featured-plants__wrapper');

const nameInput = document.querySelector('.form__input.name');
const numberInput = document.querySelector('.form__input.number');
const errorName = document.querySelector('span.for-error-name-input');
const errorNumber = document.querySelector('span.for-error-number-input');

const window = document.querySelector('.window');
const spinner = document.querySelector('.spinner__wrapper');

const sliderNextBtn = document.querySelector('.slider__button.next');
const sliderPrevBtn = document.querySelector('.slider__button.prec');
const sliderTrack = document.querySelector('.slider__photo-track');
const slides = document.querySelectorAll('.slider__photo');
let offset = 0;
let slideWidthArray = []; //Массив, хранящий ширину всех слайдов в слайдере
for (let i = 0; i < slides.length; i++) {
    slideWidthArray.push(slides[i].offsetWidth);
}
let stepOfSlide = 0; //текущая позиция слайдера, изначально-0

let nameValid = false; //изначально форма не валидна
let numberValid = false;

document.addEventListener('click', (e) => {
    for (let i = 0; i < selectOption.length; i++) {
        if (e.target == selectOption[i]) {
            selectTitle.textContent = e.target.textContent;
            if (e.target.textContent == 'Cheaper First') {
                plantsInfo.sort(function(a, b) { //Сравнение цен по убыванию
                    return a.price - b.price;
                });
                printPlants(plantsInfo);
            }
            if (e.target.textContent == 'Dear First') {
                plantsInfo.sort(function(a, b) { //Сравнение цен по возрастанию
                    return b.price - a.price;
                });
                printPlants(plantsInfo);
            }
            console.log(plantsInfoDouble);
        }
    }

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
    if (e.target == sliderNextBtn || e.target.closest('.slider__button.next')) {
        if (stepOfSlide == slides.length - 1) { // обработка случая, когда слайдер уперся в конец
            stepOfSlide = 0;
            offset = 0;
            sliderTrack.style.left = -offset + "px";
        } else {
            offset = offset + slideWidthArray[stepOfSlide];
            sliderTrack.style.left = -offset + 'px';
            stepOfSlide++;
        }
    }
    if (e.target == sliderPrevBtn || e.target.closest('.slider__button.prev')) {
        if (stepOfSlide == 0) { // обработка случая, когда слайдер в самом начале и пользователь листает "назад"
            stepOfSlide = slides.length - 1;
            offset = 0;
            for (let i = 0; i < slideWidthArray.length - 1; i++) {
                offset += slideWidthArray[i];
            }
            sliderTrack.style.left = -offset + "px";

        } else {
            offset = offset - slideWidthArray[stepOfSlide];
            sliderTrack.style.left = -offset + 'px';
            stepOfSlide--;
        }
    }
}, true);

function printPlants(objectArray) {
    plantsWrapper.innerHTML = ''; //очищение контейнера от старого порядка
    for (let i = 0; i < objectArray.length; i++) {
        plantsWrapper.insertAdjacentHTML('beforeend', `
        <div class="featured-plants">
            <div class="featured-plants__photo"><img src="${objectArray[i].imgSrc}" class="" alt="" srcset=""></div>
            <div class="featured-plants__name">${objectArray[i].name}</div>
            <div class="featured-plants__price">IDR ${objectArray[i].price}</div>
        </div>`);
    }
}

numberInput.onfocus = function() { //При начале ввода пользователем, убирается уведомления об ошибке
    this.classList.remove('invalid');
    errorNumber.innerHTML = '';
}
numberInput.onblur = function() {
    if ((this.value.includes('+7') && this.value.length == 12) || (this.value.includes('8') && this.value.length == 11)) { //Условия валидности номера телефона проверяются по окончанию ввода
        numberValid = true;
    } else {
        numberValid = false;
        this.classList.add('invalid');
        errorNumber.innerHTML = 'Номер должен начинаться с 8 или +7 и после иметь 10 цифр';
    }
}
nameInput.onfocus = function() { //При начале ввода пользователем, убирается уведомления об ошибке
    this.classList.remove('invalid');
    errorNumber.innerHTML = '';
}
nameInput.onblur = function() { //Условия валидности имени проверяются по окончанию ввода
    if (this.value.length > 2) {
        nameValid = true;
    } else {
        nameValid = false;
        this.classList.add('invalid');
        errorName.innerHTML = 'Имя должно иметь минимум 3 цифры';
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
                spinner.style.display = 'none'; //по завершении запроса спиннер выключается 
                errorServ.innerHTML = 'Ошибка при запросе'; // если результат запроса неудовлетворительный, то выводится ошибка
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
};

function printResults(Array) { // функция по отрисовке результатов
    window.style.overflowY = 'scroll';
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
        <div class="window__cross"><svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12.1309 1.68872L1.19971 12.6199" stroke="#B5B8BE" stroke-width="1.61527" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M12.1309 12.6199L1.19971 1.68872" stroke="#B5B8BE" stroke-width="1.61527" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
        </div>
		  <div class="table__row">
			  <div class='table__num'>${i+1}</div>
			  <div class='table__user-id'>${Array[i].userId}</div>
			  <div class='table__id'>${Array[i].id}</div>
			  <div class='table__title'>${Array[i].title}</div>
			  <div class='table__completed'>${Array[i].completed}</div>
			</div>`);
    }
}