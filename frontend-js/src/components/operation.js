import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class Operation {
  constructor(type, action) {
    this.action = action;
    this.type = type;
    this.routeParams = UrlManager.getQueryParams();
    this.categoryMap = {};

    const cancel = document.querySelector('.cancel');
    cancel.addEventListener('click', this.cancelLink);

    this.init();
  }

  async init() {
    const titleElement = document.querySelector('.title');
    titleElement.innerText =
      (this.action === 'add' ? 'Создание ' : 'Редактирование ')
      + (this.type === 'income' ? 'дохода' : 'расхода');

    const submitButton = document.querySelector('.submit');
    submitButton.innerText = this.action === 'add' ? 'Создать' : 'Сохранить';

    // выбор селекта в поле тип
    const typeSelectElement = document.getElementById('typeSelect');
    if (this.type === 'income') {
      typeSelectElement.value = 'income';
    } else {
      typeSelectElement.value = 'expense';
    }

    // перенаправление пользователя на страницу создания, отличную от той, на
    // которой он находится
    typeSelectElement.addEventListener('change', function () {
      const selectedValue = typeSelectElement.value;
      redirectToPage(selectedValue);
    });

    function redirectToPage(selectedType) {
      if (selectedType === 'income') {
        window.location.href = '/#/operations/income/add';
      } else if (selectedType === 'expense') {
        window.location.href = '/#/operations/expense/add';
      }
    }

    // получение списков категорий и добавление в селект
    try {
      const result = this.type === 'expense'
        ? await CustomHttp.request(`${config.host}/categories/expense`) :
        await CustomHttp.request(`${config.host}/categories/income`);

      result.forEach(category => {
        this.categoryMap[category.title] = category.id;
      });


      const catSelectElement = document.getElementById('categorySelect');
      catSelectElement.innerHTML = ''; // Очищаем список перед добавлением
                                       // новых элементов

      if (result && !result.error) {
        const defaultOption = document.createElement('option');
        defaultOption.innerText = 'Категория..';
        defaultOption.setAttribute('disabled', 'disabled');
        defaultOption.setAttribute("selected", "selected");
        catSelectElement.appendChild(defaultOption);

        result.forEach(item => {
          const option = document.createElement('option');
          option.text = item.title;
          option.value = item.title;
          catSelectElement.appendChild(option);
        });

        console.log(result);
      }

    } catch (error) {
      console.log(error);
    }

    const typeSelect = document.getElementById('typeSelect');
    const categorySelect = document.getElementById('categorySelect');
    const amountInput = document.getElementById('amountInput');
    const dateInput = document.getElementById('dateInput');
    const commentTextarea = document.getElementById('commentTextarea');

    if (this.routeParams.id && this.action === 'edit') {
      try {
        const result = await CustomHttp.request(`${config.host}/operations/${this.routeParams.id}`);
        console.log(result);

        if (result) {
          if (result.error) {
            throw new Error(result.error);
          }

          typeSelect.value = result.type;
          categorySelect.value = result.category;
          amountInput.value = result.amount;
          dateInput.value = result.date;
          commentTextarea.value = result.comment;
        }
      } catch (error) {
        console.log(error);
      }

    }

    submitButton.onclick = async () => {
      if (!typeSelect.value || !categorySelect.value || !amountInput.value || !dateInput.value || !commentTextarea.value) {
        alert('Пожалуйста, заполните все обязательные поля.');
        return;
      }

      let url = null;
      let method = '';

      const formData = {
        type: typeSelect.value,
        category: categorySelect.value,
        category_id: this.categoryMap[categorySelect.value],
        amount: amountInput.value,
        date: dateInput.value,
        comment: commentTextarea.value
      };

      console.log(formData);

      console.log(this.categoryMap);
      console.log(this.categoryMap[categorySelect.value]);

      if (this.action === 'add') {
        [url, method] = [config.host + '/operations', 'POST'];
      } else if (this.action === 'edit') {
        if (this.routeParams.id) {
          [url, method] = [`${config.host}/operations/${this.routeParams.id}`, 'PUT'];
        }
      }

      try {
        const result = await CustomHttp.request(url, method, formData);
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
  }

  cancelLink() {
    window.history.back();
  }
}