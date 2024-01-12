import {Auth} from "../services/auth.js";

export class CheckAccessToken {
  constructor() {
    this.init();
  }

  async init() {
    const accessToken = localStorage.getItem(Auth.accessTokenKey)
    if (!accessToken) {
      location.href = '#/';
    }
  }
}