import {Form} from "./components/form.js";
import {Auth} from "./services/auth.js";
import {Sidebar} from "./components/sidebar.js";
import {CheckAccessToken} from "./utils/shared.js";
import {Category} from "./components/category";
import {Categories} from "./components/categories.js";
import {Operations} from "./components/operations.js";
import {Operation} from "./components/operation";
import {Main} from "./components/main.js";
import {UrlManager} from "./utils/url-manager.js";

export class Router {
  constructor() {
    this.contentElement = document.getElementById('content');
    this.stylesElement = document.getElementById('styles');
    this.titleElement = document.getElementById('page-title');
    this.profileElement = document.getElementById('profile');


    this.routes = [
      {
        route: '#/',
        title: 'Lumincoin Finance | Вход',
        template: 'templates/login.html',
        styles: 'css/form.css',
        load: () => {
          new Form('login');
        }
      },
      {
        route: '#/signup',
        title: 'Lumincoin Finance | Регистрация',
        template: 'templates/signup.html',
        styles: 'css/form.css',
        load: () => {
          new Form('signup');
        }
      },
      {
        route: '#/main',
        title: 'Lumincoin Finance | Главная',
        template: 'templates/main.html',
        load: () => {
          const queryParams = UrlManager.getQueryParams();
          if(queryParams && queryParams.period) {
            new Main(queryParams.period);
          }
          new CheckAccessToken();
          new Sidebar();

        }
      },
      {
        route: '#/categories/income',
        title: 'Lumincoin Finance | Доходы',
        template: 'templates/categories.html',
        load: () => {
          new CheckAccessToken();
          new Sidebar();
          new Categories('income');
        }
      },
      {
        route: '#/categories/expense',
        title: 'Lumincoin Finance | Расходы',
        template: 'templates/categories.html',
        load: () => {
          new CheckAccessToken();
          new Sidebar();
          new Categories('expense');
        }
      },
      {
        route: '#/operations',
        title: 'Lumincoin Finance | Доходы и расходы',
        template: 'templates/operations.html',
        load: () => {
          const queryParams = UrlManager.getQueryParams();
          if(queryParams && queryParams.period) {
            new Operations(queryParams.period);
          }
          new CheckAccessToken();
          new Sidebar();

        }
      },
      {
        route: '#/operation/edit',
        title: 'Lumincoin Finance | Редактирование дохода/расхода',
        template: 'templates/operation.html',
        load: () => {
          new CheckAccessToken();
          new Sidebar();
          new Operation('edit');
        }
      },
      {
        route: '#/operation/add',
        title: 'Lumincoin Finance | Создание дохода/расхода',
        template: 'templates/operation.html',
        load: () => {
          new CheckAccessToken();
          new Sidebar();
          new Operation('add');
        }
      },

    ];

    let sections = ['categories', 'operations'];
    let types = ['income', 'expense'];
    let actions = ['add', 'edit'];

    sections.forEach(section => {
      types.forEach(type => {
        actions.forEach(action => {
          this.setRoute(section, type, action);
        });
      });
    });
  }

  setRoute(section = '', type = '', action = '') {
    let route = {};
    if (section) {
      if (type) {
        switch (type) {
          case "income":
            route.title = 'Доходы';
            break;
          case "expense":
            route.title = 'Расходы';
            break;
        }
        if (action) {
          route.route = '#/' + section + '/' + type + '/' + action;
          switch (action) {
            case "add":
              route.title = 'LF | Создание ' + (section === "categories" ? 'категории ' + route.title.toLowerCase().slice(0, route.title.length - 1) + 'ов' : route.title.toLowerCase().slice(0, route.title.length - 1) + 'а');
              break;
            case "edit":
              route.title = 'LF | Редактирование ' + (section === "categories" ? 'категории ' + route.title.toLowerCase().slice(0, route.title.length - 1) + 'ов' : route.title.toLowerCase().slice(0, route.title.length - 1) + 'а');
              break;
          }
          switch (section) {
            case "categories":
              route.template = 'templates/category.html';
              route.load = () => {
                new CheckAccessToken();
                new Sidebar();
                new Category(type, action);
              }
              break;
            case "operations":
              route.template = 'templates/operation.html';
              route.load = () => {
                new CheckAccessToken();
                new Sidebar();
                new Operation(type, action);
              }
              break;
          }
        } else {
          switch (section) {
            case "categories":
              route.route = '#/' + section + '/' + type;
              route.template = '../templates/categories.html';
              route.load = () => {
                new CheckAccessToken();
                new Sidebar();
                new Categories(type);
              }
              break;
            case "operations":
              route.route = '#/' + section;
              route.template = '../templates/operations.html';
              route.load = () => {
                new CheckAccessToken();
                new Sidebar();
                new Operations();
              }
              break;
          }
        }
      }
    }
    this.routes.push(route);
  }

  async openRoute() {
    const urlRoute = window.location.hash.split('?')[0];
    if (urlRoute === '#/logout') {
      await Auth.logout();
      localStorage.removeItem(Auth.userInfoKey);
      window.location.href = '#/';
      return;
    }

    // проходимся по всем роутам и ищем нужный, исходя из того, какой сейчас url
    const newRoute = this.routes.find(item => {
      return item.route === urlRoute; // сравниваем с тем, что у нас будет идти
                                      // после основного слеша
    });

    // после того, как открыли route, нам нужно загрузить все данные этой
    // страницы (html-шаблон/css/ определенный класс)

    if (!newRoute) {
      window.location.href = '#/';
      return;
    }

    this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
    this.stylesElement.setAttribute('href', newRoute.styles);
    this.titleElement.innerText = newRoute.title;

    const userInfo = Auth.getUserInfo();

    const accessToken = localStorage.getItem(Auth.accessTokenKey)
    if (userInfo && accessToken) {
      this.profileElement.style.display = 'flex';
    } else {
      this.profileElement.style.display = 'none';
    }

    newRoute.load();
  }

}

