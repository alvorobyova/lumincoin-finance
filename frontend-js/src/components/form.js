import config from "../../config/config.js";
import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
// import checkAccessToken from "../utils/shared.js";


export class Form {
  constructor(page) {
    this.processElement = null;
    this.fullNameElement = null;
    this.fullNameValue = null;
    this.page = page;
    this.init();

    const accessToken = localStorage.getItem(Auth.accessTokenKey)
    if (accessToken) {
      location.href = '#/main';
      return;
    }

    this.fields = [
      {
        name: 'email',
        id: 'email',
        element: null,
        regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        valid: false,
      },
      {
        name: 'password',
        id: 'password',
        element: null,
        regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
        valid: false,
      },
    ];

    if (this.page === 'signup') {
      this.fields.unshift(
        {
          name: 'fullName',
          id: 'fullName',
          element: null,
          regex: /^[А-ЯЁ][а-яёЁ]*([-'][А-ЯЁ][а-яёЁ]+)?(?: [А-ЯЁ][а-яёЁ]*([-'][А-ЯЁ][а-яёЁ]+)?){2}$/,
          valid: false,
        });
      this.fields.push(
        {
          name: 'passwordRepeat',
          id: 'passwordRepeat',
          element: null,
          regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
          valid: false,
        });
    }


    const that = this; // здесь помещаем текущий контекст(ссылка на объект
                       // Form) в эту переменную, c помощью этого мы можем
                       // обращаться к this в любом месте, будет работать
                       // замыкание

    // проход по каждому элементу массива. в результате в свойство element
    // разместится нужный элемент, который будет найден по id
    this.fields.forEach(item => {
      item.element = document.getElementById(item.id);
      item.element.oninput = function () {
        that.validateField.call(that, item, this); //
      }
    });

    this.processElement = document.getElementById('process');
    this.processElement.onclick = function () {
      that.processForm();
    };
  }

  async init() {
    document.querySelector('.sidebar').style.display = 'none';
  }

  // при изменения значения в каждом инпуте будет вызываться функция
  validateField(field, element) {
    let password = document.getElementById('password');
    if (!element.value || !element.value.match(field.regex) || (element.id === 'repeatPassword' && element.value !== password.value)) {
      element.style.borderColor = 'red';
      field.valid = false;
    } else {
      element.removeAttribute('style');
      field.valid = true;
    }
    this.validateForm();
  }

  // функция, которая будет активировать нажатие кнопки, когда все поля валидны
  validateForm() {
    const validForm = this.fields.every(item => item.valid);
    if (validForm) {
      this.processElement.removeAttribute('disabled');
    } else {
      this.processElement.setAttribute('disabled', 'disabled');
    }
    return validForm;
  }

  async processForm() {
    if (this.validateForm()) {

      const email = this.fields.find(item => item.name === 'email').element.value;
      const password = this.fields.find(item => item.name === 'password').element.value;

      if (this.page === 'signup') {
        this.fullNameElement = this.fields.find(item => item.name === 'fullName').element;
        this.fullNameValue = this.fullNameElement.value;

        if (this.fullNameValue) {
          const [lastName, name] = this.fullNameValue.split(" ");
          this.lastName = lastName;
          this.name = name;
        }
        try {
          const result = await CustomHttp.request(config.host + '/signup', 'POST', {
            name: this.name,
            lastName: this.lastName,
            email: email,
            password: password,
            passwordRepeat: this.fields.find(item => item.name === 'passwordRepeat').element.value,

          })
          if (result) {
            if (result.error || !result.user) {
              throw new Error(result.message);
            }
          }
        } catch (error) {
          return console.log(error);
        }
        location.href = '#/'
      } else {
        try {
          const result = await CustomHttp.request(config.host + '/login', 'POST', {
            email: email,
            password: password,
          })

          if (result) {
            if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken
              || !result.user.name || !result.user.lastName || !result.user.id) {
              throw new Error(result.message);
            }

            Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
            Auth.setUserInfo({
              fullName: result.user.name + " " + result.user.lastName,
              userId: result.user.id,
            })
            location.href = '#/main?period=today'
          }

        } catch (error) {
          console.log(error);
        }
      }

    }
  }
}