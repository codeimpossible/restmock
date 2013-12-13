RestMock
=================

[![Build Status](https://travis-ci.org/codeimpossible/restmock.png)](https://travis-ci.org/codeimpossible/restmock)


A simple mock library for jQuery AJAX requests.

## jQuery Versions
RestMock has been tested against the following jQuery versions:

 - v2.0.3
 - v1.10.2
 - v1.9.1
 - v1.8.3
 - v1.7.2

### Example: fetching data (using Backbone)

``` javascript
// use RestMock to fake any ajax request
// to /products/N where N is 1 or more digits
RestMock.addHandlers({
  "get /products/(\\d+)": function( id ) {
    return {
      id: id,
      name: "goldie blox",
      qa_testers: [{
        id: 1,
        name: "Julie"
      },{
        id: 2,
        name: "Francis"
      }]
    };
  }
});

var Product = Backbone.Model.extend({
  urlRoot: '/products'
});

var product = new Product({ id: 1 });

product.fetch().then(function() {
  console.log( product.get('name') );  // logs "goldie blox"
});
```

[Try it yourself](http://jsbin.com/OnIbAXU/2/edit?js,console)

### Example: delaying a mock response

``` javascript
// use RestMock to fake any ajax request 
// to /products/N where N is 1 or more digits
RestMock.addHandlers({
  "get /products/(\\d+)": function( id ) {
    this.delayResponse(10 * 1000); // delay the response by 10 seconds
    return {
      id: id,
      name: "goldie blox",
      qa_testers: [{
        id: 1,
        name: "Julie"
      },{
        id: 2,
        name: "Francis"
      }]
    };
  }
});
```
