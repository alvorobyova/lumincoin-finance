import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Sidebar {
  constructor() {
    this.fullName = document.getElementById('profile-full-name');
    this.userInfo = Auth.getUserInfo();
    this.sidebarElement = document.querySelector('.sidebar');
    this.balanceElement = document.getElementById('balance');
    this.accessToken = localStorage.getItem(Auth.accessTokenKey);
    this.accessToken = localStorage.getItem(Auth.accessTokenKey);

    this.showBalance();
    this.getUserInfo();
    this.toggleActiveItem();
    this.toggleActiveLink();
    this.init();

  }

  async init() {
    this.sidebarElement.style.display = "flex";
  }

  getUserInfo() {
    this.userInfo && this.accessToken ?
      this.fullName.innerText = this.userInfo.fullName :
      this.fullName.innerText = 'Нет данных';
  }

  async showBalance() {
    try {
      const result = await CustomHttp.request(`${config.host}/balance`);
      if (result) {
        if (result.error) {
          throw new Error(result.error);
        }
        this.balanceElement.innerText = result.balance;
      }
    } catch (error) {
      console.log(error);
    }
  }

  toggleActiveLink() {
    document.getElementById('goToTable').onclick = () => {
      location.href = '#/operations?period=today';
    }
    document.getElementById('goToIncomes').onclick = () => {
      location.href = '#/categories/income';
    }
    document.getElementById('goToExpenses').onclick = () => {
      location.href = '#/categories/expense';
    }
    document.getElementById('goToMain').onclick = () => {
      location.href = '#/main?period=today';
    }
  }

  toggleActiveItem() {
    const navItems = document.querySelectorAll(".nav-item");
    const catToggleBlock = document.getElementById('categoriesToggleBlock');
    const catToggleLink = document.getElementById('categoriesToggleLink');
    const catCollapse = document.getElementById('categoriesCollapse');

    navItems.forEach(function (item) {
      item.addEventListener("click", function (event) {
        event.preventDefault();

        navItems.forEach(function (navItem) {
          navItem.querySelector(".nav-link").classList.remove("active");
        });

        if (item !== catToggleBlock) {
          const catLinks = catToggleBlock.querySelectorAll('.nav-link');
          catLinks.forEach(function (catLink) {
            catLink.classList.remove('active');
            catCollapse.classList.remove('show');
          });
        }

        item.querySelector(".nav-link").classList.add("active");

        if(catToggleLink.classList.contains('collapsed')) {
          catToggleLink.classList.remove('active');
        }

      });
    });

    const navLinksCollapse = document.querySelectorAll(".nav-item-collapse");
    navLinksCollapse.forEach(function (item) {
      item.addEventListener("click", function (event) {
        event.preventDefault();

        navLinksCollapse.forEach(function (navLink) {
          navLink.querySelector(".nav-link").classList.remove("active");
        });

        item.querySelector(".nav-link").classList.add("active");
      });
    });

  }

}