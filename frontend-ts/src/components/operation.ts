import { UrlManager } from '../utils/url-manager';
import { CustomHttp } from '../services/custom-http';
import config from '../../config/config';

// Types
import { QueryParamsType } from '../types/query-params.type';
import { CategoriesResponseType } from '../types/categories-response.type';
import { DefaultResponseType } from '../types/default-response.type';
import { FormDataType, OperationResponseType } from '../types/operations-response.type';
import { funcShared } from '../utils/funcs-shared';

export class Operation {
  private action: string;
  private type: string;
  private routeParams: QueryParamsType;
  private categoryMap: { [categoryName: string]: number } = {};

  constructor(type: string, action: string = '') {
    this.action = action;
    this.type = type;
    this.routeParams = UrlManager.getQueryParams();
    this.categoryMap = {};

    const cancel = document.querySelector('.cancel');
    if (cancel) {
      cancel.addEventListener('click', this.cancelLink);
    }

    this.init();
  }

  private async init(): Promise<void> {
    const titleElement: HTMLElement | null = document.querySelector('.title');
    if (titleElement) {
      titleElement.innerText =
        (this.action === 'add' ? 'Создание ' : 'Редактирование ') +
        (this.type === 'income' ? 'дохода' : 'расхода');
    }

    const submitButton: HTMLButtonElement | null = document.querySelector('.submit');
    if (submitButton) {
      submitButton.innerText = this.action === 'add' ? 'Создать' : 'Сохранить';
    }

    // выбор селекта в поле тип
    const typeSelectElement: HTMLSelectElement | null = document.getElementById(
      'typeSelect'
    ) as HTMLSelectElement;
    if (typeSelectElement) {
      if (this.type === 'income') {
        typeSelectElement.value = 'income';
      } else {
        typeSelectElement.value = 'expense';
      }
    }

    typeSelectElement.addEventListener('change', function () {
      const selectedValue: string | null = typeSelectElement.value;
      redirectToPage(selectedValue);
    });

    function redirectToPage(selectedType: string): void {
      if (selectedType === 'income') {
        window.location.href = '/#/operations/income/add';
      } else if (selectedType === 'expense') {
        window.location.href = '/#/operations/expense/add';
      }
    }

    // получение списков категорий и добавление в селект
    try {
      const result: CategoriesResponseType[] | null =
        this.type === 'expense'
          ? await CustomHttp.request(`${config.host}/categories/expense`)
          : await CustomHttp.request(`${config.host}/categories/income`);

      if (result) {
        if (Array.isArray(result)) {
          result.forEach((category: CategoriesResponseType) => {
            this.categoryMap[category.title] = category.id;
          });
        }

        const catSelectElement: HTMLElement | null = document.getElementById('categorySelect');
        if (catSelectElement) {
          catSelectElement.innerHTML = '';

          const defaultOption: HTMLElement | null = funcShared('option');
          if (defaultOption) {
            defaultOption.innerText = 'Категория..';
            defaultOption.setAttribute('disabled', 'disabled');
            defaultOption.setAttribute('selected', 'selected');
            catSelectElement.appendChild(defaultOption);
          }

          result.forEach((item) => {
            const option: HTMLOptionElement | null = document.createElement('option');
            if (option) {
              option.text = item.title;
              option.value = item.title;
            }
            catSelectElement.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.log(error);
      return;
    }

    const typeSelect: HTMLSelectElement | null = document.getElementById(
      'typeSelect'
    ) as HTMLSelectElement;
    const categorySelect: HTMLSelectElement | null = document.getElementById(
      'categorySelect'
    ) as HTMLSelectElement;
    const amountInput: HTMLInputElement | null = document.getElementById(
      'amountInput'
    ) as HTMLInputElement;
    const dateInput: HTMLInputElement | null = document.getElementById(
      'dateInput'
    ) as HTMLInputElement;
    const commentTextarea: HTMLInputElement | null = document.getElementById(
      'commentTextarea'
    ) as HTMLInputElement;

    if (this.routeParams.id && this.action === 'edit') {
      try {
        const result: OperationResponseType | DefaultResponseType = await CustomHttp.request(
          `${config.host}/operations/${this.routeParams.id}`
        );

        if (result) {
          if ((result as DefaultResponseType).error !== undefined) {
            throw new Error((result as DefaultResponseType).message);
          }

          typeSelect.value = (result as OperationResponseType).type;
          categorySelect.value = (result as OperationResponseType).category;
          amountInput.value = (result as OperationResponseType).amount.toString();
          dateInput.value = (result as OperationResponseType).date;
          commentTextarea.value = (result as OperationResponseType).comment;
        }
      } catch (error) {
        console.log(error);
        return;
      }
    }
    if (submitButton) {
      submitButton.onclick = async () => {
        if (
          !typeSelect.value ||
          !categorySelect.value ||
          !amountInput.value ||
          !dateInput.value ||
          !commentTextarea.value
        ) {
          alert('Пожалуйста, заполните все обязательные поля.');
          return;
        }

        let url: string | null = null;
        let method: string = '';

        const formData: FormDataType = {
          type: typeSelect.value,
          category: categorySelect.value,
          category_id: this.categoryMap[categorySelect.value],
          amount: +amountInput.value,
          date: dateInput.value,
          comment: commentTextarea.value,
        };

        if (this.action === 'add') {
          [url, method] = [config.host + '/operations', 'POST'];
        } else if (this.action === 'edit') {
          if (this.routeParams.id) {
            [url, method] = [`${config.host}/operations/${this.routeParams.id}`, 'PUT'];
          }
        }

        if (url) {
          try {
            const result: OperationResponseType | DefaultResponseType = await CustomHttp.request(
              url,
              method,
              formData
            );
            if (result) {
              if ((result as DefaultResponseType).error !== undefined) {
                throw new Error((result as DefaultResponseType).message);
              }
              window.history.back();
            }
          } catch (error) {
            console.log(error);
            return;
          }
        }
      };
    }
  }

  cancelLink(): void {
    window.history.back();
  }
}
