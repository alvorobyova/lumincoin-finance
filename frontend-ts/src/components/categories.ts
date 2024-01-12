import { CustomHttp } from "../services/custom-http";
import { UrlManager } from "../utils/url-manager";
import config from "../../config/config";

// Types
import { CategoriesResponseType } from "../types/categories-response.type";
import { QueryParamsType } from "../types/query-params.type";
import { DefaultResponseType } from "../types/default-response.type";

export class Categories {
  private catInit: CategoriesResponseType[];
  readonly type: string;
  readonly categoryRoute: string;
  readonly deleteModal: HTMLElement | null;
  private routeParams: QueryParamsType;

  constructor(type: string) {
    this.catInit = [];
    this.type = type;
    this.categoryRoute = "/categories/" + this.type;
    this.deleteModal = document.getElementById("deleteModal");
    this.routeParams = UrlManager.getQueryParams();
    this.init();
  }

  private async init(): Promise<void> {
    const goForm: HTMLElement | null = document.getElementById("go-form");
    if (goForm) {
      goForm.setAttribute("href", `/#${this.categoryRoute}/add`);
    }

    try {
      const mainTitle: HTMLElement | null = document.getElementById(
        "main__content-title"
      );
      const modalTextCategory: HTMLElement | null =
        document.querySelector(".modal-body span");

      if (mainTitle && modalTextCategory) {
        mainTitle.innerText = this.type === "expense" ? "Расходы" : "Доходы";
        modalTextCategory.innerText =
          this.type === "expense" ? "расходы" : "доходы";
      }

      const result: DefaultResponseType | CategoriesResponseType[] =
        await CustomHttp.request(`${config.host}${this.categoryRoute}`);

      if (result) {
        if ((result as DefaultResponseType).error !== undefined) {
          throw new Error((result as DefaultResponseType).message);
        }

        this.catInit = result as CategoriesResponseType[];
        this.showCategories();
      }
    } catch (error) {
      console.log(error);
    }
  }

  private showCategories(): void {
    const container: HTMLElement | null = document.querySelector(
      ".main__content_items"
    );
    if (!container) return;

    if (this.catInit) {
      this.catInit.forEach((item) => {
        const cardCol: HTMLElement | null = document.createElement("div");
        if (cardCol) {
          cardCol.classList.add("col");
        }

        const card: HTMLElement | null = document.createElement("div");
        if (card) {
          card.classList.add("card", "px-4", "py-3");
          card.setAttribute("data-category-id", item.id.toString());
        }
        const cardTitle: HTMLElement | null = document.createElement("h2");
        if (cardTitle) {
          cardTitle.classList.add("card-title");
          cardTitle.innerText = item.title;
        }

        const buttonsDiv: HTMLElement | null = document.createElement("div");
        if (buttonsDiv) {
          buttonsDiv.classList.add("buttons", "d-flex", "align-content-center");
        }

        const editButton: HTMLButtonElement | null =
          document.createElement("button");
        if (editButton) {
          editButton.type = "button";
          editButton.classList.add(
            "btn",
            "btn-primary",
            "me-3",
            "px-3",
            "py-2"
          );
          editButton.innerText = "Редактировать";

          editButton.addEventListener("click", () => {
            this.editCategory(item);
          });
        }

        const deleteButton: HTMLButtonElement | null =
          document.createElement("button");
        if (deleteButton) {
          deleteButton.type = "button";
          deleteButton.classList.add("btn", "btn-danger");
          deleteButton.innerText = "Удалить";

          deleteButton.addEventListener("click", () => {
            this.deleteCategory(item);
          });
        }

        buttonsDiv.appendChild(editButton);
        buttonsDiv.appendChild(deleteButton);

        card.appendChild(cardTitle);
        card.appendChild(buttonsDiv);
        cardCol.appendChild(card);
        container.appendChild(cardCol);
      });
    }
  }

  private editCategory(item: CategoriesResponseType): void {
    if (item.id) {
      location.href = `/#${this.categoryRoute}/edit?id=${item.id}`;
      this.routeParams.id = item.id.toString();
    }
  }

  private deleteCategory(item: CategoriesResponseType): void {
    if (item.id) {
      if (this.deleteModal) {
        this.deleteModal.style.display = "flex";
      }

      const approveDeleteButton: HTMLElement | null =
        document.getElementById("approveDelete");
      if (approveDeleteButton) {
        approveDeleteButton.onclick = async (): Promise<void> => {
          // запрос DELETE на сервер
          const result: DefaultResponseType | null = await CustomHttp.request(
            `${config.host}${this.categoryRoute}/${item.id}`,
            "DELETE"
          );
          try {
            if (result) {
              if (this.deleteModal) {
                this.deleteModal.style.display = "none";
              }
              location.reload();
            }
          } catch (error) {
            console.log(error);
          }
        };
      }

      const cancelDeleteButton: HTMLElement | null =
        document.getElementById("cancelDelete");
      if (cancelDeleteButton) {
        cancelDeleteButton.addEventListener("click", () => {
          if (this.deleteModal) {
            this.deleteModal.style.display = "none";
          }
        });
      }
    }
    return;
  }
}
