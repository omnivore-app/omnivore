"use strict";

module.exports = {
  "parserOptions": {
    "ecmaVersion": 6
  },
  "rules": {
    // Braces only needed for multi-line arrow function blocks
    // "arrow-body-style": [2, "as-needed"],

    // Require spacing around =>
    // "arrow-spacing": 2,

    // Always require spacing around a single line block
    // "block-spacing": 1,

    // No newline before open brace for a block
    "brace-style": 2,

    // No space before always a space after a comma
    "comma-spacing": [2, {"before": false, "after": true}],

    // Commas at the end of the line not the start
    // "comma-style": 2,

    // Don't require spaces around computed properties
    // "computed-property-spacing": [2, "never"],

    // Functions must always return something or nothing
    "consistent-return": 2,

    // Require braces around blocks that start a new line
    // Note that this rule is likely to be overridden on a per-directory basis
    // very frequently.
    // "curly": [2, "multi-line"],

    // Always require a trailing EOL
    "eol-last": 2,

    // Require function* name()
    // "generator-star-spacing": [2, {"before": false, "after": true}],

    // Two space indent
    "indent": [2, 2, { "SwitchCase": 1 }],

    // Space after colon not before in property declarations
    "key-spacing": [2, { "beforeColon": false, "afterColon": true, "mode": "minimum" }],

    // Unix linebreaks
    "linebreak-style": [2, "unix"],

    // Always require parenthesis for new calls
    "new-parens": 2,

    // Use [] instead of Array()
    // "no-array-constructor": 2,

    // No duplicate arguments in function declarations
    "no-dupe-args": 2,

    // No duplicate keys in object declarations
    "no-dupe-keys": 2,

    // No duplicate cases in switch statements
    "no-duplicate-case": 2,

    // No labels
    "no-labels": 2,

    // If an if block ends with a return no need for an else block
    "no-else-return": 2,

    // No empty statements
    "no-empty": 2,

    // No empty character classes in regex
    "no-empty-character-class": 2,

    // Disallow empty destructuring
    "no-empty-pattern": 2,

    // No assiging to exception variable
    // "no-ex-assign": 2,

    // No using !! where casting to boolean is already happening
    // "no-extra-boolean-cast": 2,

    // No double semicolon
    "no-extra-semi": 2,

    // No overwriting defined functions
    "no-func-assign": 2,

    // Declarations in Program or Function Body
    "no-inner-declarations": 2,

    // No invalid regular expresions
    "no-invalid-regexp": 2,

    // No odd whitespace characters
    "no-irregular-whitespace": 2,

    // No single if block inside an else block
    "no-lonely-if": 2,

    // No mixing spaces and tabs in indent
    "no-mixed-spaces-and-tabs": [2, "smart-tabs"],

    // No unnecessary spacing
    "no-multi-spaces": [2, { exceptions: { "AssignmentExpression": true, "VariableDeclarator": true, "ArrayExpression": true, "ObjectExpression": true } }],

    // No reassigning native JS objects
    "no-native-reassign": 2,

    // No (!foo in bar)
    "no-negated-in-lhs": 2,

    // Nested ternary statements are confusing
    "no-nested-ternary": 2,

    // Use {} instead of new Object()
    // "no-new-object": 2,

    // No Math() or JSON()
    "no-obj-calls": 2,

    // No octal literals
    "no-octal": 2,

    // No redeclaring variables
    "no-redeclare": 2,

    // No unnecessary comparisons
    "no-self-compare": 2,

    // No declaring variables from an outer scope
    "no-shadow": 2,

    // No declaring variables that hide things like arguments
    "no-shadow-restricted-names": 2,

    // No spaces between function name and parentheses
    "no-spaced-func": 2,

    // No trailing whitespace
    "no-trailing-spaces": 2,

    // No using undeclared variables
    // "no-undef": 2,

    // Error on newline where a semicolon is needed
    "no-unexpected-multiline": 2,

    // No unreachable statements
    "no-unreachable": 2,

    // No expressions where a statement is expected
    // "no-unused-expressions": 2,

    // No declaring variables that are never used
    "no-unused-vars": [2, {"vars": "all", "args": "none"}],

    // No using variables before defined
    // "no-use-before-define": [2, "nofunc"],

    // No using with
    "no-with": 2,

    // No if/while/for blocks on the same line as the if/while/for statement:
    "nonblock-statement-body-position": [2, "below"],

    // Always require semicolon at end of statement
    "semi": [2, "always"],

    // Require space after keywords
    "keyword-spacing": 2,

    // Always use double quotes
    "quotes": [2, "double", {"avoidEscape": true}],

    // Require space before blocks
    "space-before-blocks": 2,

    // Never use spaces before function parentheses
    // "space-before-function-paren": [2, { "anonymous": "always", "named": "never" }],

    // Require spaces before finally, catch, etc.
    // "space-before-keywords": [2, "always"],

    // No space padding in parentheses
    // "space-in-parens": [2, "never"],

    // Require spaces around operators
    // "space-infix-ops": 2,

    // Require spaces after return, throw and case
    // "space-return-throw-case": 2,

    // ++ and -- should not need spacing
    // "space-unary-ops": [2, { "words": true, "nonwords": false }],

    // No comparisons to NaN
    "use-isnan": 2,

    // Only check typeof against valid results
    "valid-typeof": 2,
  },
};
