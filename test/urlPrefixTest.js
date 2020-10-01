const { assert } = require('chai');
const { urlDatabase, users } = require('../db');
const dbHelpers = require('../helpers/dbHelpers')(urlDatabase, users);

describe('getUserByEmail', function() {
  it('should return "http://www." with a url not starting with http://www.', () => {
    let res = dbHelpers.urlPrefix('youtube.com');
    let expRes = 'http://www.';
    assert.strictEqual(res, expRes);
  });
  it('should return "http://" with a url starting with "www."', () => {
    let res = dbHelpers.urlPrefix('www.youtube.com');
    let expRes = 'http://';
    assert.strictEqual(res, expRes);
  });
  it('should return empty string with "http://www.google.ca"', () => {
    let res = dbHelpers.urlPrefix('http://www.google.ca');
    let expRes = '';
    assert.strictEqual(res, expRes);
  });
});