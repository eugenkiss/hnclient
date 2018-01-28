import {ApiError} from './client'
import {buildUrl, canUseDOM, sleep} from '../utils'

export class BaseApiError {
  constructor(
    public statusCode: number,
    public error: string,
    public message: string) {}

  toJson(): object {
    const o: object = {}
    o['statusCode'] = this.statusCode
    o['error'] = this.error
    o['message'] = this.message
    return o
  }
}

export class BaseApiClient {

  logApiError = false

  constructor(
    private host?: string,
  ) {}

  request = async (url: string, options: Object): Promise<{ json: any, response: Response }> => {
    if (!canUseDOM) await sleep(100000000)
    let response: Response
    try {
      response = await fetch(url, options)
    } catch (e) {
      if (this.logApiError) {
        console.error(`NetworkError:\n${url}\n${JSON.stringify(options)}\n${e.message}`)
      }
      throw new ApiError(-1, 'Network Error', e.message)
    }
    if (!response.ok) {
      const httpError = new ApiError(response.status, response.statusText, response.statusText)
      if (this.logApiError) {
        console.debug(`HttpError:\n${url}\n${response.statusText}\n${JSON.stringify(options)}\n${JSON.stringify(httpError.toJson())}`)
      }
      throw httpError
    }
    if (response.status === 204) { // No content
      return { json: null, response: response }
    }
    let json: any
    try {
      json = await response.json()
    } catch (e) {
      if (this.logApiError) {
        console.debug(`ApiError: Malformed JSON:\n${e}`)
      }
      throw new ApiError(-1, 'Malformed JSON', e)
    }
    if (json.error) {
      const apiError = new ApiError(response.status || -1, json.error, json.message)
      if (this.logApiError) {
        console.debug(`ApiError:\n${url}\n${json.message}\n${JSON.stringify(options)}\n${JSON.stringify(apiError.toJson())}`)
      }
      throw apiError
    }
    return { json: json, response: response }
  }

  GET = <T>(endpoint: string, params?: Object, host?: string): Promise<{ json: T, response: Response }> => {
    const url = buildUrl(host || this.host, endpoint, params)
    const options = {
      method: 'GET'
    }
    return this.request(url, options)
  }
}
