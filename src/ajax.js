import axios from 'axios'
// axios.defaults.baseURL = '/api';
// axios.defaults.baseURL = 'http://localhost:3000';
// axios.defaults.prefix = '';
axios.defaults.withCredentials = true; //让ajax携带cookie
axios.defaults.headers.post['Content-Type'] = 'application/a-www-form-urlencoded';


function response(res, waring) {
    res = res.data;
    if(res.code !== 0) {
      if(res.code === 1) {
        window.location.href="/#/"
      }else {
        return res
      }
    }
    return res;
}


const $ = {
  get: (url, params) => {
    return axios.get(url, {
      params: params
    }).then(res => {
      return response(res)
    })
  },
  getunwaring: (url, params) => {
    return axios.get(url, {
      params: params
    }).then(res => {
      return response(res, true)
    })
  },
  post: (url, params) => {
    return axios.post(url, params).then(res => {
      return response(res)
    })
  },
  delete: (url, params) => {
    return axios.delete(url).then(res => {
      return response(res)
    })
  },
  put: (url, params) => {
    return axios.put(url, params).then(res => {
      return response(res)
    })
  }
}
export const get = $.get;
export const post = $.post;
export default $;
// export const getunwaring = $.getunwaring;
