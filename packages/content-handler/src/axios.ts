import axios from 'axios'

axios.interceptors.request.use((config) => {
  config.headers['X-Target-Url'] = config.url
  config.url = 'http://localhost:8787'

  return config;
});

export = {
  proxyAxios: axios,
}
