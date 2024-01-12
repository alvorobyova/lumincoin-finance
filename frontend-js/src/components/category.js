import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class Category {
  constructor(type, action) {
    this.type = type;
    this.action = action;
    this.categoryRoute = '/categories/' + this.type;
    this.routeParams = UrlManager.getQueryParams();
    const cancel = document.querySelector('.cancel');
    cancel.addEventListener('click', this.cancelLink);

    this.init();
  }

  async init() {
    const titleElement = document.querySelector('.title');
    titleElement.innerText =
      (this.action === 'add' ? 'Создание ' : 'Редактирование ')
      + 'категории ' +
      (this.type === 'income' ? 'доходов' : 'расходов');
    const submitButton = document.querySelector('.submit');
    submitButton.innerText = this.action === 'add' ? 'Создать' : 'Сохранить';
    const inputName = document.querySelector('.name');
    inputName.oninput = function () {
      if (this.value) {
        this.removeAttribute('style');
        submitButton.removeAttribute('disabled');
      } else {
        this.style.borderColor = 'red';
        submitButton.setAttribute('disabled', 'disabled');
      }
    }

    if (this.action === 'edit') {
      try {
        const result = await CustomHttp.request(`${config.host}${this.categoryRoute}/${this.routeParams.id}`);

        if (result) {
          if (result.error) {
            throw new Error(result.error);
          }
          inputName.value = result.title;
        }
      } catch (error) {
        console.log(error);
      }

    }

    submitButton.onclick = async () => {
      if (inputName.value) {
        const title = inputName.value;
        let url = null;
        let method = '';

        if (this.action === 'add') {
          [url, method] = [config.host + this.categoryRoute, 'POST'];
        } else if (this.action === 'edit') {
          if (this.routeParams.id) {
            [url, method] = [`${config.host}${this.categoryRoute}/${this.routeParams.id}`, 'PUT'];
          }
        }

        try {
          const result = await CustomHttp.request(url, method, { title: title });
          if (result) {
            if (result.error) {
              throw new Error(result.error);
            }
            window.history.back();
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
  }

  cancelLink() {
    window.history.back();
  }
}