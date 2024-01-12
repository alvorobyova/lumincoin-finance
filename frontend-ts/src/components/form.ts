import config from "../../config/config";
import { CustomHttp } from "../services/custom-http";
import { Auth } from "../services/auth";

// Types
import { FormFieldType } from "../types/form-field.type";
import { SignupResponseType } from "../types/signup-response.type";
import { LoginResponseType } from "../types/login-response.type";

export class Form {
  readonly processElement: HTMLElement | null;
  private fullNameElement: HTMLInputElement | null;
  private fullNameValue: string | null;
  readonly page: "signup" | "login";
  private fields: FormFieldType[];
  private lastName: string | null;
  private name: string | null;

  constructor(page: "signup" | "login") {
    this.processElement = null;
    this.fullNameElement = null;
    this.fullNameValue = null;
    this.fields = [];
    this.page = page;
    this.lastName = null;
    this.name = null;

    this.init();

    const accessToken: string | null = localStorage.getItem(
      Auth.accessTokenKey
    );
    if (accessToken) {
      location.href = "#/main";
      return;
    }

    this.fields = [
      {
        name: "email",
        id: "email",
        element: null,
        regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        valid: false,
      },
      {
        name: "password",
        id: "password",
        element: null,
        regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
        valid: false,
      },
    ];

    if (this.page === "signup") {
      this.fields.unshift({
        name: "fullName",
        id: "fullName",
        element: null,
        regex:
          /^[А-ЯЁ][а-яёЁ]*([-'][А-ЯЁ][а-яёЁ]+)?(?: [А-ЯЁ][а-яёЁ]*([-'][А-ЯЁ][а-яёЁ]+)?){2}$/,
        valid: false,
      });
      this.fields.push({
        name: "passwordRepeat",
        id: "passwordRepeat",
        element: null,
        regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
        valid: false,
      });
    }

    const that: Form = this;

    this.fields.forEach((item: FormFieldType) => {
      item.element = document.getElementById(item.id) as HTMLInputElement;
      if (item.element) {
        item.element.oninput = function () {
          that.validateField.call(that, item, <HTMLInputElement>this); //
        };
      }
    });

    this.processElement = document.getElementById("process");
    if (this.processElement) {
      this.processElement.onclick = function () {
        that.processForm();
      };
    }
  }

  async init() {
    const sidebarElement: HTMLElement | null =
      document.querySelector(".sidebar");
    if (sidebarElement) {
      sidebarElement.style.display = "none";
    }
  }

  private validateField(field: FormFieldType, element: HTMLInputElement): void {
    let password = document.getElementById("password") as HTMLInputElement;
    if (
      !element.value ||
      !element.value.match(field.regex) ||
      (element.id === "repeatPassword" && element.value !== password.value)
    ) {
      element.style.borderColor = "red";
      field.valid = false;
    } else {
      element.removeAttribute("style");
      field.valid = true;
    }
    this.validateForm();
  }

  // функция, которая будет активировать нажатие кнопки, когда все поля валидны
  private validateForm(): boolean {
    const validForm: boolean = this.fields.every((item) => item.valid);
    if (this.processElement) {
      if (validForm) {
        this.processElement.removeAttribute("disabled");
      } else {
        this.processElement.setAttribute("disabled", "disabled");
      }
    }
    return validForm;
  }

  private async processForm(): Promise<void> {
    if (this.validateForm()) {
      const email = this.fields.find((item) => item.name === "email")?.element
        ?.value;
      const password = this.fields.find((item) => item.name === "password")
        ?.element?.value;

      if (this.page === "signup") {
        this.fullNameElement =
          this.fields.find((item) => item.name === "fullName")?.element || null;

        if (this.fullNameElement) {
          this.fullNameValue = this.fullNameElement.value;
        }

        if (this.fullNameValue) {
          const [lastName, name]: Array<string> = this.fullNameValue.split(" ");
          this.lastName = lastName;
          this.name = name;
        }
        try {
          const result: SignupResponseType = await CustomHttp.request(
            config.host + "/signup",
            "POST",
            {
              name: this.name,
              lastName: this.lastName,
              email: email,
              password: password,
              passwordRepeat: this.fields.find(
                (item) => item.name === "passwordRepeat"
              )?.element?.value,
            }
          );
          if (result) {
            if (result.error || !result.user) {
              throw new Error(result.message);
            }
          }
        } catch (error) {
          console.log(error);
          return;
        }
        location.href = "#/";
      } else {
        try {
          const result: LoginResponseType = await CustomHttp.request(
            config.host + "/login",
            "POST",
            {
              email: email,
              password: password,
            }
          );

          if (result) {
            if (
              result.error ||
              !result.tokens.accessToken ||
              !result.tokens.refreshToken ||
              !result.user.name ||
              !result.user.lastName ||
              !result.user.id
            ) {
              throw new Error(result.message);
            }

            Auth.setTokens(
              result.tokens.accessToken,
              result.tokens.refreshToken
            );
            Auth.setUserInfo({
              fullName: result.user.name + " " + result.user.lastName,
              userId: result.user.id,
            });
            location.href = "#/main?period=today";
          }
        } catch (error) {
          console.log(error);
          return;
        }
      }
    }
  }
}
