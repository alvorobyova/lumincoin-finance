import {CustomHttp} from "../services/custom-http.js";
import {UrlManager} from "../utils/url-manager.js";
import config from "../../config/config.js";

export class Categories {
  constructor(type) {

    this.catInit = null;
    this.type = type;
    this.categoryRoute = '/categories/' + this.type;
    this.deleteModal = document.getElementById('deleteModal');
    this.routeParams = UrlManager.getQueryParams();
    this.init();
  }

  async init() {
    const goForm = document.getElementById('go-form');
    goForm.setAttribute('href', `/#${this.categoryRoute}/add`);
    try {
      const mainTitle = document.getElementById('main__content-title');
      const modalTextCategory = document.querySelector('.modal-body span');

      mainTitle.innerText = (this.type === 'expense' ? 'Расходы' : 'Доходы');
      modalTextCategory.innerText = (this.type === 'expense' ? 'расходы' : 'доходы');

      const result = await CustomHttp.request(`${config.host}${this.categoryRoute}`);

      if (result) {
        if (result.error) {
          throw new Error(result.error);
        }

        this.catInit = result;
        console.lgo(this.catInit)
        this.showCategories();
        // this.setCategories();
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*setCategories() {
    const catTitles = this.catInit.map(item => item.title);
    if(this.type === 'expense') {
      localStorage.setItem('expenseCat', JSON.stringify(catTitles));
    } else {
      localStorage.setItem('incomeCat', JSON.stringify(catTitles))
    }
  }*/

  showCategories() {
    const container = document.querySelector(".main__content_items");
    if (this.catInit) {
      this.catInit.forEach((item) => {
        const cardCol = document.createElement("div");
        cardCol.classList.add("col");

        const card = document.createElement("div");
        card.classList.add("card", "px-4", "py-3");
        card.setAttribute("data-category-id", item.id);

        const cardTitle = document.createElement("h2");
        cardTitle.classList.add("card-title");
        cardTitle.innerText = item.title;

        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("buttons", "d-flex", "align-content-center");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.classList.add("btn", "btn-primary", "me-3", "px-3", "py-2");
        editButton.innerText = "Редактировать";

        editButton.addEventListener('click', () => {
          this.editCategory(item)
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.classList.add("btn", "btn-danger");
        deleteButton.innerText = "Удалить";

        deleteButton.addEventListener("click", () => {
          this.deleteCategory(item)
        });

        buttonsDiv.appendChild(editButton);
        buttonsDiv.appendChild(deleteButton);

        card.appendChild(cardTitle);
        card.appendChild(buttonsDiv);

        cardCol.appendChild(card);

        container.appendChild(cardCol);
      });
    }
  }

  editCategory(item) {
    if (item.id) {
      location.href = `/#${this.categoryRoute}/edit?id=${item.id}`;
      this.routeParams.id = item.id;
    }
  }

  deleteCategory(item) {
    if (item.id) {
      this.deleteModal.style.display = "flex";

      const approveDeleteButton = document.getElementById("approveDelete");
      approveDeleteButton.addEventListener("click", async () => {
        this.deleteModal.style.display = "none";

        // запрос DELETE на сервер
        const result = await CustomHttp.request(`${config.host}${this.categoryRoute}/${item.id}`, 'DELETE');
        try {
          if (result) {
            if (result.error) {
              throw new Error(result.error);
            }
            location.reload();
          }
        } catch (error) {
          console.log(error);
        }
      });
    }

    const cancelDeleteButton = document.getElementById("cancelDelete");
    cancelDeleteButton.addEventListener("click", () => {
      this.deleteModal.style.display = "none";
    });
  }
}