class User {
  constructor(id, pass) {
    this.id = id;
    this.pass = pass;
    this.history = [];
  };

  addRecord(url) {
    this.history.pushState(url);
  }
}

const shortUrl