import {QueryParamsType} from "../types/query-params.type";

export class UrlManager {
  public static getQueryParams(): QueryParamsType {
    const qs: string = document.location.hash.split('+').join(' ');

    let params: QueryParamsType = {},
      tokens: RegExpExecArray | null,
      re: RegExp = /[?&]([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
  }
}