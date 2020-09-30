const { assert } = require('chai');

const { urlPrefix } = require('../helper');

describe('getUserByEmail', function() {
  it('should return "http://www." with a url not starting with http://www.', () => {
  res = urlPrefix('youtube.com'); 
  expRes = 'http://www.' 
  assert.strictEqual(res, expRes);
  });
  it('should return "http://" with a url starting with "www."', () => {
    res = urlPrefix('www.youtube.com');
    expRes = 'http://';
    assert.strictEqual(res, expRes);
  })
  it('should return empty string with "http://www.google.ca"', () => {
    res = urlPrefix('http://www.google.ca');
    expRes = '';
    assert.strictEqual(res, expRes);
  })
});