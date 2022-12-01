var express = require("express");
var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");
const fs = require("fs");

const GQL_PATH = '../../packages/api/src/generated/schema.graphql'

const rawSchema = fs.readFileSync(GQL_PATH).toString()

// Construct a schema, using GraphQL schema language
var schema = buildSchema(rawSchema);

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return "Hello world!";
  },
};

var app = express();
app.use(
  "/api/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");