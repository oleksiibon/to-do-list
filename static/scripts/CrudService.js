class CrudService {
  constructor(url) {
    this.url = url;
    this.headers = { "Content-Type": "application/json" };
  }

  request(method, body, path) {
    return new Promise((resolve, reject) => {
      let init = { method: method, headers: this.headers};
      if (!body.empty){
        init.body = body;
      }
      fetch(this.url + path, init)
        .then(data => data.json())
        .then((data) => {
          resolve(data);
        })
        .catch((e) => {
          reject(e);
        })
    });
  }

  add(body) {
    return this.request("POST", body, "");
  }
  delete(path) {
    return new Promise((resolve, reject) => {
      fetch(this.url +"/"+ path, { method: "DELETE", headers: this.headers })
        .then(data => data.json())
        .then((data) => {
          resolve(data);
        })
        .catch((e) => {
          reject(e);
        })
    });
  }
  getAll() {
    return new Promise((resolve, reject) => {
      fetch(this.url, { method: "GET", headers: this.headers })
        .then(data => data.json())
        .then((data) => {
          resolve(data);
        })
        .catch((e) => {
          reject(e);
        })
    });
  }
}

