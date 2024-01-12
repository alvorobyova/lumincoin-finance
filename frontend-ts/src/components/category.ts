import { UrlManager } from "../utils/url-manager";
import { CustomHttp } from "../services/custom-http";
import config from "../../config/config";

// Types
import { QueryParamsType } from "../types/query-params.type";
import {
  AddCategoryResponseType,
  EditCategoryResponseType,
} from "../types/categories-response.type";
import { DefaultResponseType } from "../types/default-response.type";

export class Category {
  readonly type: string;
  readonly action: string;
  readonly categoryRoute: string;
  private routeParams: QueryParamsType;

  constructor(type: string, action: string) {
    this.type = type;
    this.action = action;
    this.categoryRoute = "/categories/" + this.type;
    this.routeParams = UrlManager.getQueryParams();

    const cancel: HTMLElement | null = document.querySelector(".cancel");
    if (cancel) {
      cancel.addEventListener("click", this.cancelLink);
    }
    this.init();
  }

  private async init(): Promise<void> {
    const titleElement: HTMLElement | null = document.querySelector(".title");
    if (titleElement) {
      titleElement.innerText =
        (this.action === "add" ? "Создание " : "Редактирование ") +
        "категории " +
        (this.type === "income" ? "доходов" : "расходов");
    }

    const submitButton: HTMLButtonElement | null =
      document.querySelector(".submit");
    const inputName: HTMLInputElement | null = document.querySelector(".name");
    if (submitButton) {
      submitButton.innerText = this.action === "add" ? "Создать" : "Сохранить";
      if (inputName) {
        inputName.oninput = function () {
          if (inputName.value) {
            inputName.removeAttribute("style");
            submitButton.removeAttribute("disabled");
          } else {
            inputName.style.borderColor = "red";
            submitButton.setAttribute("disabled", "disabled");
          }
        };
      }
    }

    if (this.action === "edit") {
      try {
        const result: EditCategoryResponseType | DefaultResponseType =
          await CustomHttp.request(
            `${config.host}${this.categoryRoute}/${this.routeParams.id}`
          );

        if (result) {
          if ((result as DefaultResponseType).error !== undefined) {
            throw new Error((result as DefaultResponseType).message);
          }
          if (inputName) {
            const categoryResponse = result as EditCategoryResponseType;
            inputName.value = categoryResponse.title;
          }
        }
      } catch (error) {
        console.log(error);
        return;
      }
    }
    if (submitButton) {
      if (inputName) {
        submitButton.onclick = async () => {
          if (inputName.value) {
            const title: string | null = inputName.value;
            let url: string | null = null;
            let method: string = "";

            if (this.action === "add") {
              [url, method] = [config.host + this.categoryRoute, "POST"];
            } else if (this.action === "edit") {
              if (this.routeParams.id) {
                [url, method] = [
                  `${config.host}${this.categoryRoute}/${this.routeParams.id}`,
                  "PUT",
                ];
              }
            }

            try {
              if (url && method) {
                const result: AddCategoryResponseType | DefaultResponseType =
                  await CustomHttp.request(url, method, { title: title });
                if (result) {
                  if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                  }
                  window.history.back();
                }
              }
            } catch (error) {
              console.log(error);
              return;
            }
          }
        };
      }
    }
  }

  private cancelLink(): void {
    window.history.back();
  }
}
