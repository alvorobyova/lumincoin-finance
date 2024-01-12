export type LoginResponseType = {
  tokens: {
    accessToken?: string,
    refreshToken?: string,
  },
  user: {
    name?: string,
    lastName?: string,
    id?: number,
  },
  error: boolean,
  message: string
}