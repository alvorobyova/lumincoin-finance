import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import {Router} from "./router.js";

class App {
  constructor() {
    this.router = new Router();

    // здесь в прослушивателе должна быть функция, которая будет определять, на
    // какой странице мы находимся
    window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this))

    // обработка события — смена url
    window.addEventListener('popstate', this.handleRouteChanging.bind(this))
  }

  // функция для улавливания смены url
  handleRouteChanging() {
    this.router.openRoute();
  }
}

// сразу создаем экземпляр класса, будет осуществлен вызов функции, описанной в
// конструкторе
(new App());