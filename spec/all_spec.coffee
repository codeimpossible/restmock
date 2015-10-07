describe "RestMock", ->
  mockServer = undefined
  beforeEach ->
    mockServer =
      failure: ->
        @error 404, {}

      success: ->
        response: "hi"

    spyOn jQuery, "ajax"
    spyOn(RestMock, "intercept").and.callThrough()
    spyOn(mockServer, "failure").and.callThrough()
    spyOn(mockServer, "success").and.callThrough()

  afterEach ->
    RestMock.reset()

  describe "addHandlers", ->
    it "should replace $.ajax", ->
      expect(jQuery.ajax).not.toBe RestMock.intercept
      RestMock.addHandlers "get /test/something": mockServer.success
      $.get "/test/something"
      expect(jQuery.ajax).toBe RestMock.intercept
      expect(mockServer.success).toHaveBeenCalled()
      expect(RestMock.intercept).toHaveBeenCalled()


  describe "reset()", ->
    it "releases $.ajax", ->
      RestMock.addHandlers "get /test/something": mockServer.failure
      RestMock.reset()
      $.get "/test/something"
      expect(jQuery.ajax).not.toBe RestMock.intercept
      expect(mockServer.failure).not.toHaveBeenCalled()


  describe "mocked server response", ->
    it "can be an error", ->
      RestMock.addHandlers "get /test/something": mockServer.failure
      promise = $.get("/test/something")
      expect(mockServer.failure).toHaveBeenCalled()
      expect(promise.state()).toBe "rejected"

    it "sets a response header of application/json", ->
      RestMock.addHandlers "get /test/something": mockServer.success
      $.get("/test/something").always (output, status, xhr) ->
        header = xhr.getResponseHeader("Content-Type")
        expect(header).toBe "application/json"


    it "can set custom headers", ->
      RestMock.addHandlers "get /test/something": ->
        @setResponseHeader "X-Custom-Flag", "something"
        return {}

      $.get("/test/something").always (output, status, xhr) ->
        header = xhr.getResponseHeader("X-Custom-Flag")
        expect(header).toBe "something"


    it "can access POST data", ->
      RestMock.addHandlers "post /test/something": ->
        expect(@data.test).toBe "hello"

      $.post "/test/something",
        test: "hello"

      $.post "/test/something", "{ \"test\": \"hello\" }"

    it "can access POST data (json)", ->
      RestMock.addHandlers "post /test/something": ->
        expect(@data.test).toBe "hello"

      $.post "/test/something", "{ \"test\": \"hello\" }"
