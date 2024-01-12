import { Auth } from "../services/auth";

export class CheckAccessToken {
  constructor() {
    this.init();
  }

  public async init(): Promise<void> {
    const accessToken: string | null = localStorage.getItem(
      Auth.accessTokenKey
    );
    if (!accessToken) {
      location.href = "#/";
    }
  }
}
