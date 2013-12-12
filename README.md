RestMock
=================

[![Build Status](https://travis-ci.org/codeimpossible/restmock.png)](https://travis-ci.org/codeimpossible/restmock)


A simple mock library for jQuery AJAX requests.

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
