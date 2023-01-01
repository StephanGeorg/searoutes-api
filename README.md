# Express-REST-API

## Features

  + Express based server
  + Validation with [celebrate](https://github.com/arb/celebrate)/[joi](https://github.com/hapijs/joi)
  + Logging with [winston](https://github.com/winstonjs/winston) and [morgan](https://github.com/expressjs/morgan)
  + Human readable errors with [winston](https://github.com/winstonjs/winston) cli logger format and [pretty-error](https://github.com/AriaMinaei/pretty-error)
  + Testing with [mocha](https://mochajs.org/) and [supertest](https://github.com/visionmedia/supertest)
  + Coverage with [istanbul](https://istanbul.js.org/) and [nyc](https://github.com/istanbuljs/nyc)
  + [Mongo](https://mongodb.github.io/node-mongodb-native/) and [Postgres](https://node-postgres.com/) data layers with connection pooling
  + Schema validation via [Joi](https://hapi.dev/family/joi)
  + Metrics submission [StatsD](https://github.com/statsd/statsd) via [hot-shots](https://github.com/brightcove/hot-shots)
  + Serving statuses with [HTTPStatus](https://github.com/adaltas/node-http-status)

## TODO

  - ✅ Implement [ExtendableErrors](https://github.com/EQuimper/nodejs-api-boilerplate/blob/master/src/services/error.js)
  - Implement Boom


### Error logging

Errors will be logged as follows:

```
error:   ┏ _users.default.getUsers is not a function (500): GET /api/users/list ::1 +2s
error:   ┗ [1] { task: 'Controller/listUsers', context: {}, environment: 'development' }
error:   ┏ _users.default.getUsers is not a function   TypeError: _users.default.getUsers is not a function

  - users.js:8 Object.listUsers
    /Users/stephan/Sites/Boilerplates/Express-REST-API/src/services/users.js:8:18

  - users.js:32 _callee$
    /Users/stephan/Sites/Boilerplates/Express-REST-API/src/controllers/users.js:32:40

  - runtime.js:45 tryCatch
    [Express-REST-API]/[regenerator-runtime]/runtime.js:45:40

  - runtime.js:271 Generator.invoke [as _invoke]
    [Express-REST-API]/[regenerator-runtime]/runtime.js:271:22

  - runtime.js:97 Generator.prototype.(anonymous function) [as next]
    [Express-REST-API]/[regenerator-runtime]/runtime.js:97:21

  - users.js:32 asyncGeneratorStep
    /Users/stephan/Sites/Boilerplates/Express-REST-API/src/controllers/users.js:32:103

  - users.js:34 _next
    /Users/stephan/Sites/Boilerplates/Express-REST-API/src/controllers/users.js:34:194

  - users.js:34
    /Users/stephan/Sites/Boilerplates/Express-REST-API/src/controllers/users.js:34:364

  - new Promise

  - users.js:34 Object.<anonymous>
    /Users/stephan/Sites/Boilerplates/Express-REST-API/src/controllers/users.js:34:97

 +50ms
error:   ┗ [1] { environment: 'development' }
info:    ┏ ::1 - - [09/Jan/2020:09:27:45 +0000] "GET /api/users/get/1 HTTP/1.1" 500 29 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
 +5ms
info:    ┗ [1] { environment: 'development' }

```
