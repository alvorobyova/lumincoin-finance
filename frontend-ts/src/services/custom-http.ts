import { Auth } from "./auth";

export class CustomHttp {
  public static async request(
    url: string,
    method: string = "GET",
    body: object | null = null
  ): Promise<any> {
    const params: RequestInit = {
      method: method,
      headers: {
        "Content-type": "application/json",
        Accept: "application/json",
      },
    };

    let token: string | null = localStorage.getItem(Auth.accessTokenKey);
    if (token) {
      // params.headers["x-auth-token"] = token;
      const headers = new Headers(params.headers as Record<string, string>);
      headers.append("x-auth-token", token);
      params.headers = headers;
    }

    if (body) {
      params.body = JSON.stringify(body);
    }

    const response: Response = await fetch(url, params);

    if (response.status < 200 || response.status >= 300) {
      if (response.status === 401) {
        const result: boolean = await Auth.processUnauthorizedResponse();
        if (result) {
          return await this.request(url, method, body);
        } else {
          return null;
        }
      }
      throw new Error(response.statusText);
    }
    return await response.json();
  }
}
