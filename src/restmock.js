// ## RestMock

// RestMock is a javascript library that allows UI developers to mock server requests using a sinatra-like syntax:
// example:
//
// ```
//    // mock a request to /users/1 or /users/2, etc
//    RestMock.addHandlers({
//     'get /users/(\\d+)': function(id) {
//       return {
//         // example to return a JSON response,
//         // could be HTML or anything really
//         id: 1,
//         fullName: 'Hans Gruber',
//         occupation: 'Exceptional Thief',
//         mortalEnemy: 'John McClaine',
//         catchPhrase: 'Where are my detonators?'
//       };
//     }
//    });
// ```
(function($, global) {
    // create a copy of the jQuery AJAX method
    $._restMockAjax = $.ajax;

    // the handlers for each HTTP verb are stored in a hash map
    var _descriptors = { 'get': {}, 'put': {}, 'post': {}, 'delete': {}, 'patch': {} },

        // vetRequest will look at a pending call to `$.ajax` and determine if
        // a handler has been registered for that request. The handler will be
        // a tuple containing the handler function and the args that were extracted
        // from the url - using RegExp capturing groups. Otherwise this method returns
        // `undefined`.
        vetRequest = function(url, method) {
            var routeRegex = null,
                args = [],
                descriptorCollection = _descriptors[method];
            for( routeRegex in descriptorCollection ) {
                if( descriptorCollection.hasOwnProperty(routeRegex) ) {
                    // extract arguments from the URL given using regex
                    // capturing groups.
                    args = (new RegExp( routeRegex,'ig')).exec(url) || [];
                    if( args.length > 0 ) {
                        args = args.slice(1);
                        return [ descriptorCollection[routeRegex], args ];
                    }
                }
            }
        };

    /* jshint unused: false */
    var RestMockInterceptor = global.RestMock = {
        _ajax: null,
        intercept: function( url, options ) {
            var promise = null,
                deferred = $.Deferred(),
                completeDeferred = jQuery.Callbacks( 'once memory' );

            // shift arguments around. $.ajax can be called
            // multiple ways
            if( !options ) {
                // we were called with only an options array,
                // url will be options.url
                options = url;
            } else {
                options.url = url;
            }
            options = $.ajaxSetup( {}, options );

            // fake XHR object, used by callbacks to retrieve
            // headers/status information
            var fakeXhr = (function() {
                var _headers = {
                    'Content-Type': 'application/json'
                };
                return {
                    readyState: 4,
                    setResponseHeader: function(name, value) {
                        _headers[name] = value;
                    },
                    getResponseHeader: function(name) {
                        return _headers[name];
                    },
                    status: 200
                };
            })();

            // affix the callbacks we got
            if(options.success) {
                deferred.done( options.success );
            }

            if(options.error) {
                deferred.fail( options.error );
            }

            // create default 'promise'
            promise = deferred.promise();

            // attach aliases for success/error
            promise.success = promise.done;
            promise.error = promise.fail;

            // should rest mock handle this request?
            var tuple = vetRequest( options.url, options.type.toLowerCase() );
            if( tuple ) {
                var delay = 0;
                $.event.trigger( 'ajaxStart' );

                options.data = typeof(options.data) === 'string' ?
                    JSON.parse(options.data) :
                    options.data;

                var scope = {
                    delayResponse: function(ms) {
                        delay = ms;
                    },
                    data: options.data,
                    error: function(code, response) {
                        response = response instanceof String ? response : JSON.stringify(response);
                        fakeXhr.responseText = response;
                        fakeXhr.status = code;
                    },
                    setResponseHeader: fakeXhr.setResponseHeader
                };

                $.event.trigger( 'ajaxSend' );
                var result = tuple[0].apply( scope, tuple[1] );

                var serverResponse = function() {
                    // dispatch the promise, passing what was mocked from
                    // server, and any HTTP status codes from our fakeXHR
                    var jqEvent = 'ajaxSuccess';
                    if( fakeXhr.status !== 200 ) {
                        deferred.reject(fakeXhr, fakeXhr.status, fakeXhr.status.toString() );
                        jqEvent = 'ajaxError';
                    } else {
                        deferred.resolve( result, fakeXhr.status, fakeXhr );
                    }
                    $.event.trigger( jqEvent, [ fakeXhr, options, result ] );
                };

                if( delay ) {
                    setTimeout( serverResponse, delay );
                } else {
                    serverResponse();
                }

                completeDeferred.fire();
                $.event.trigger( 'ajaxComplete', [ fakeXhr, options ] );
                $.event.trigger( 'ajaxStop' );
            } else {
                // hand off to jquery
                promise = this._ajax.apply($, [options]);
            }
            return promise;
        },
        reset: function() {
            $.ajax = $._restMockAjax;
            // feed the new jquery to Backbone
            if(global.Backbone) {
                if( global.Backbone.setDomLibrary ) {
                    global.Backbone.setDomLibrary($);
                }
                if( global.Backbone.$ ) {
                    global.Backbone.$ = $;
                }
            }
        },
        addHandlers: function( config ) {
            if( $.ajax !== this.intercept ) {
                this._ajax = $._restMockAjax;
                $.ajax = this.intercept;

                if(global.Backbone) {
                    if( global.Backbone.setDomLibrary ) {
                        global.Backbone.setDomLibrary($);
                    }
                    if( global.Backbone.$ ) {
                        global.Backbone.$ = $;
                    }
                }
            }

            for(var k in config) {
                if( config.hasOwnProperty(k) ) {
                    var args = k.split(' '),
                        regex = args[1],
                        method = args[0];

                    _descriptors[method][regex] = config[k];
                }
            }
        }
    };
})(jQuery, this);