describe("RestMock", function() {
  var mockServer;
  mockServer = void 0;
  beforeEach(function() {
    mockServer = {
      failure: function() {
        return this.error(404, {});
      },
      success: function() {
        return {
          response: "hi"
        };
      }
    };
    spyOn(jQuery, "ajax");
    spyOn(RestMock, "intercept").andCallThrough();
    spyOn(mockServer, "failure").andCallThrough();
    return spyOn(mockServer, "success").andCallThrough();
  });
  afterEach(function() {
    return RestMock.reset();
  });
  describe("addHandlers", function() {
    return it("should replace $.ajax", function() {
      expect(jQuery.ajax).not.toBe(RestMock.intercept);
      RestMock.addHandlers({
        "get /test/something": mockServer.success
      });
      $.get("/test/something");
      expect(jQuery.ajax).toBe(RestMock.intercept);
      expect(mockServer.success).toHaveBeenCalled();
      return expect(RestMock.intercept).toHaveBeenCalled();
    });
  });
  describe("reset()", function() {
    return it("releases $.ajax", function() {
      RestMock.addHandlers({
        "get /test/something": mockServer.failure
      });
      RestMock.reset();
      $.get("/test/something");
      expect(jQuery.ajax).not.toBe(RestMock.intercept);
      return expect(mockServer.failure).not.toHaveBeenCalled();
    });
  });
  return describe("mocked server response", function() {
    it("can be an error", function() {
      var promise;
      RestMock.addHandlers({
        "get /test/something": mockServer.failure
      });
      promise = $.get("/test/something");
      expect(mockServer.failure).toHaveBeenCalled();
      return expect(promise.state()).toBe("rejected");
    });
    it("sets a response header of application/json", function() {
      RestMock.addHandlers({
        "get /test/something": mockServer.success
      });
      return $.get("/test/something").always(function(output, status, xhr) {
        var header;
        header = xhr.getResponseHeader("Content-Type");
        return expect(header).toBe("application/json");
      });
    });
    it("can set custom headers", function() {
      RestMock.addHandlers({
        "get /test/something": function() {
          this.setResponseHeader("X-Custom-Flag", "something");
          return {};
        }
      });
      return $.get("/test/something").always(function(output, status, xhr) {
        var header;
        header = xhr.getResponseHeader("X-Custom-Flag");
        return expect(header).toBe("something");
      });
    });
    it("can access POST data", function() {
      RestMock.addHandlers({
        "post /test/something": function() {
          return expect(this.data.test).toBe("hello");
        }
      });
      $.post("/test/something", {
        test: "hello"
      });
      return $.post("/test/something", "{ \"test\": \"hello\" }");
    });
    return it("can access POST data (json)", function() {
      RestMock.addHandlers({
        "post /test/something": function() {
          return expect(this.data.test).toBe("hello");
        }
      });
      return $.post("/test/something", "{ \"test\": \"hello\" }");
    });
  });
});
