import config from "../../config/config";

// Types
import {UserInfoType} from "../types/user-info.type";
import {RefreshResponseType} from "../types/refresh-response.type";
import {LogoutResponseType} from "../types/logout-response.type";

export class Auth {
  public static accessTokenKey: string = 'accessToken';
  private static refreshTokenKey: string = 'refreshToken';
  public static userInfoKey: string = 'userInfo';

  public static async processUnauthorizedResponse(): Promise<boolean> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
    if (refreshToken) {
      const response: Response = await fetch(config.host + '/refresh', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({refreshToken: refreshToken})
      });

      if (response && response.status === 200) {
        const result: RefreshResponseType | null = await response.json();
        if (result && !result.error && result.tokens.accessToken && result.tokens.refreshToken) {
          this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
          return true;
        }
      }
    }
    // this.removeTokens();
    return false;
  }

  public static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private static removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  static setUserInfo(info: UserInfoType): void {
    localStorage.setItem('userInfo', JSON.stringify(info));
  }

  public static getUserInfo(): UserInfoType | null {
    const userInfo: string | null = localStorage.getItem(this.userInfoKey);
    if (userInfo) {
      return JSON.parse(userInfo);
    }

    return null;
  }

  public static async logout(): Promise<boolean> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
    if (refreshToken) {
      const response: Response = await fetch(config.host + '/logout', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({refreshToken: refreshToken})
      })
      if (response && response.status === 200) {
        const result: LogoutResponseType | null = await response.json();
        if (result && !result.error) {
          this.removeTokens();
          localStorage.removeItem(this.userInfoKey);
          return true;
        }
      }
    }
    return false;
  }
}