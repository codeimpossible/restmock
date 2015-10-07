beforeEach () ->
  jasmine.addMatchers
    toBeInstanceOf: (obj) -> @.actual instanceof obj
