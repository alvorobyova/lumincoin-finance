import { CustomHttp } from "../services/custom-http";
import { Auth } from "../services/auth";
import config from "../../config/config";

// Types
import { UserInfoType } from "../types/user-info.type";
import { BalanceResponseType } from "../types/balance-response.type";
import { DefaultResponseType } from "../types/default-response.type";

export class Sidebar {
  readonly fullName: HTMLElement | null;
  readonly sidebarElement: HTMLElement | null;
  readonly balanceElement: HTMLElement | null;
  public userInfo: UserInfoType | null;
  readonly accessToken: string | null;

  constructor() {
    this.fullName = document.getElementById("profile-full-name");
    this.userInfo = Auth.getUserInfo();
    this.sidebarElement = document.querySelector(".sidebar");
    this.balanceElement = document.getElementById("balance");
    this.accessToken = localStorage.getItem(Auth.accessTokenKey);

    this.showBalance();
    this.getUserInfo();
    this.toggleActiveItem();
    this.toggleActiveLink();

    this.init();
  }

  private async init(): Promise<void> {
    if (this.sidebarElement) {
      this.sidebarElement.style.display = "flex";
    }
  }

  private getUserInfo(): void {
    if (this.fullName) {
      this.userInfo && this.accessToken
        ? (this.fullName.innerText = this.userInfo.fullName)
        : (this.fullName.innerText = "Нет данных");
    }
  }

  private async showBalance(): Promise<void> {
    try {
      const result: BalanceResponseType | DefaultResponseType =
        await CustomHttp.request(`${config.host}/balance`);
      if (result) {
        if ((result as DefaultResponseType).error !== undefined) {
          throw new Error((result as DefaultResponseType).message);
        }
        if (this.balanceElement) {
          const balanceResponse = result as BalanceResponseType;
          this.balanceElement.innerText = balanceResponse.balance;
        }
      }
    } catch (error) {
      console.log(error);
    }
    return;
  }

  private toggleActiveLink(): void {
    const goToTable: HTMLElement | null = document.getElementById("goToTable");
    if (goToTable) {
      goToTable.onclick = () => {
        location.href = "#/operations?period=today";
      };
    }

    const goToIncomes: HTMLElement | null =
      document.getElementById("goToIncomes");
    if (goToIncomes) {
      goToIncomes.onclick = () => {
        location.href = "#/categories/income";
      };
    }

    const goToExpenses: HTMLElement | null =
      document.getElementById("goToExpenses");
    if (goToExpenses) {
      goToExpenses.onclick = () => {
        location.href = "#/categories/expense";
      };
    }

    const goToMain: HTMLElement | null = document.getElementById("goToMain");
    if (goToMain) {
      goToMain.onclick = () => {
        location.href = "#/main?period=today";
      };
    }
  }

  private toggleActiveItem(): void {
    const navItems: NodeListOf<HTMLElement> | null =
      document.querySelectorAll(".nav-item");
    const catToggleBlock: HTMLElement | null = document.getElementById(
      "categoriesToggleBlock"
    );
    const catToggleLink: HTMLElement | null = document.getElementById(
      "categoriesToggleLink"
    );
    const catCollapse: HTMLElement | null =
      document.getElementById("categoriesCollapse");

    if (navItems) {
      navItems.forEach(function (item: HTMLElement) {
        item.addEventListener("click", function (event: Event) {
          event.preventDefault();

          navItems.forEach(function (navItem: Element) {
            if (navItem) {
              navItem.querySelector(".nav-link")?.classList.remove("active");
            }
          });

          if (item !== catToggleBlock && catToggleBlock) {
            const catLinks: NodeListOf<HTMLLinkElement> | null =
              catToggleBlock.querySelectorAll(".nav-link");
            if (catLinks) {
              catLinks.forEach(function (catLink: HTMLLinkElement) {
                catLink.classList.remove("active");
                if (catCollapse) {
                  catCollapse.classList.remove("show");
                }
              });
            }
          }

          item.querySelector(".nav-link")?.classList.add("active");

          if (catToggleLink) {
            if (catToggleLink.classList.contains("collapsed")) {
              catToggleLink.classList.remove("active");
            }
          }
        });
      });
    }

    const navLinksCollapse: NodeListOf<HTMLElement> =
      document.querySelectorAll(".nav-item-collapse");
    if (navLinksCollapse) {
      navLinksCollapse.forEach(function (item: HTMLElement) {
        item.addEventListener("click", function (event: Event) {
          event.preventDefault();
          navLinksCollapse.forEach(function (navLink: HTMLElement) {
            navLink.querySelector(".nav-link")?.classList.remove("active");
          });

          item.querySelector(".nav-link")?.classList.add("active");
        });
      });
    }
  }
}
