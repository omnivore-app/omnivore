@preprocessor typescript

main -> _ logical_expression _ {% (data) => data[1] %}

# Whitespace: `_` is optional, `__` is mandatory.
_  -> whitespace_character:* {% (data) => data[0].length %}
__ -> whitespace_character:+ {% (data) => data[0].length %}

whitespace_character -> [ \t\n\v\f] {% id %}

# Numbers
decimal -> "-":? [0-9]:+ ("." [0-9]:+):? {%
  (data) => parseFloat(
    (data[0] || "") +
    data[1].join("") +
    (data[2] ? "."+data[2][1].join("") : "")
  )
%}

# Double-quoted string
dqstring -> "\"" dstrchar:* "\"" {% (data) => data[1].join('') %}
sqstring -> "'"  sstrchar:* "'"  {% (data) => data[1].join('') %}

dstrchar -> [^\\"\n] {% id %}
    | "\\" strescape {%
    (data) => JSON.parse("\""+data.join("")+"\"")
%}

sstrchar -> [^\\'\n] {% id %}
    | "\\" strescape
        {% (data) => JSON.parse("\"" + data.join("") + "\"") %}
    | "\\'"
        {% () => "'" %}

strescape -> ["\\/bfnrt] {% id %}
    | "u" [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] {%
    (data) => data.join('')
%}

logical_expression -> two_op_logical_expression {% id %}

two_op_logical_expression ->
    pre_two_op_logical_expression boolean_operator post_one_op_logical_expression {% (data) => ({
      type: 'LogicalExpression',
      location: {
        start: data[0].location.start,
        end: data[2].location.end,
      },
      operator: data[1],
      left: data[0],
      right: data[2]
    }) %}
  | pre_two_op_implicit_logical_expression __ post_one_op_implicit_logical_expression {% (data) => ({
      type: 'LogicalExpression',
      location: {
        start: data[0].location.start,
        end: data[2].location.end,
      },
      operator: {
        operator: 'AND',
        type: 'ImplicitBooleanOperator'
      },
      left: data[0],
      right: data[2]
    }) %}
	| one_op_logical_expression {% d => d[0] %}

pre_two_op_implicit_logical_expression ->
    two_op_logical_expression {% d => d[0] %}
  | parentheses_open _ two_op_logical_expression _ parentheses_close {% d => ({location: {start: d[0].location.start, end: d[4].location.start + 1, }, type: 'ParenthesizedExpression', expression: d[2]}) %}

post_one_op_implicit_logical_expression ->
    one_op_logical_expression {% d => d[0] %}
  | parentheses_open _ one_op_logical_expression _ parentheses_close {% d => ({location: {start: d[0].location.start, end: d[4].location.start + 1, },type: 'ParenthesizedExpression', expression: d[2]}) %}

pre_two_op_logical_expression ->
    two_op_logical_expression __ {% d => d[0] %}
  | parentheses_open _ two_op_logical_expression _ parentheses_close {% d => ({location: {start: d[0].location.start, end: d[4].location.start + 1, },type: 'ParenthesizedExpression', expression: d[2]}) %}

one_op_logical_expression ->
    parentheses_open _ parentheses_close {% d => ({location: {start: d[0].location.start, end: d[2].location.start + 1, },type: 'ParenthesizedExpression', expression: {
      type: 'EmptyExpression',
      location: {
        start: d[0].location.start + 1,
        end: d[0].location.start + 1,
      },
    }}) %}
  | parentheses_open _ two_op_logical_expression _ parentheses_close {% d => ({location: {start: d[0].location.start, end: d[4].location.start + 1, },type: 'ParenthesizedExpression', expression: d[2]}) %}
	|	"NOT" post_boolean_primary {% (data, start) => {
  return {
    type: 'UnaryOperator',
    operator: 'NOT',
    operand: data[1],
    location: {
      start,
      end: data[1].location.end,
    }
  };
} %}
  | "-" boolean_primary {% (data, start) => {
  return {
    type: 'UnaryOperator',
    operator: '-',
    operand: data[1],
    location: {
      start,
      end: data[1].location.end,
    }
  };
} %}
  | boolean_primary {% d => d[0] %}

post_one_op_logical_expression ->
    __ one_op_logical_expression {% d => d[1] %}
  | parentheses_open _ one_op_logical_expression _ parentheses_close {% d => ({location: {start: d[0].location, end: d[4].location + 1, },type: 'ParenthesizedExpression', expression: d[2]}) %}

parentheses_open ->
  "(" {% (data, start) => ({location: {start}}) %}

parentheses_close ->
  ")" {% (data, start) => ({location: {start}}) %}

boolean_operator ->
    "OR" {% (data, start) => ({location: {start, end: start + 2}, operator: 'OR', type: 'BooleanOperator'}) %}
  | "AND" {% (data, start) => ({location: {start, end: start + 3}, operator: 'AND', type: 'BooleanOperator'}) %}

boolean_primary ->
  tag_expression {% id %}

post_boolean_primary ->
    __ parentheses_open _ two_op_logical_expression _ parentheses_close {% d => ({location: {start: d[1].location.start, end: d[5].location.start + 1, }, type: 'ParenthesizedExpression', expression: d[3]}) %}
  | __ boolean_primary {% d => d[1] %}

tag_expression ->
    
    field comparison_operator expression {% (data, start) => {
    const field = {
      type: 'Field',
      name: data[0].name,
      path: data[0].name.split('.').filter(Boolean),
      quoted: data[0].quoted,
      quotes: data[0].quotes,
      location: data[0].location,
    };

    if (!data[0].quotes) {
      delete field.quotes;
    }

    return {
      location: {
        start,
        end: data[2].expression.location.end,
      },
      field,
      operator: data[1],
      ...data[2]
    }
  } %}
  | field comparison_operator {% (data, start) => {
    const field = {
      type: 'Field',
      name: data[0].name,
      path: data[0].name.split('.').filter(Boolean),
      quoted: data[0].quoted,
      quotes: data[0].quotes,
      location: data[0].location,
    };

    if (!data[0].quotes) {
      delete field.quotes;
    }

    return {
      type: 'Tag',
      location: {
        start,
        end: data[1].location.end,
      },
      field,
      operator: data[1],
      expression: {
        type: 'EmptyExpression',
        location: {
          start: data[1].location.end,
          end: data[1].location.end,
        },
      }
    }
  } %}
  | expression {% (data, start) => {
    return {location: {start, end: data[0].expression.location.end}, field: {type: 'ImplicitField'}, ...data[0]};
  } %}

field ->
    [_a-zA-Z$] [a-zA-Z\d_$.]:* {% (data, start) => ({type: 'LiteralExpression', name: data[0] + data[1].join(''), quoted: false, location: {start, end: start + (data[0] + data[1].join('')).length}}) %}
  | sqstring {% (data, start) => ({type: 'LiteralExpression', name: data[0], quoted: true, quotes: 'single', location: {start, end: start + data[0].length + 2}}) %}
  | dqstring {% (data, start) => ({type: 'LiteralExpression', name: data[0], quoted: true, quotes: 'double', location: {start, end: start + data[0].length + 2}}) %}

expression ->
    decimal {% (data, start) => ({type: 'Tag', expression: {location: {start, end: start + data.join('').length}, type: 'LiteralExpression', quoted: false, value: Number(data.join(''))}}) %}
  | regex {% (data, start) => ({type: 'Tag', expression: {location: {start, end: start + data.join('').length}, type: 'RegexExpression', value: data.join('')}}) %}
  | range {% (data) => data[0] %}
  | unquoted_value {% (data, start, reject) => {
    const value = data.join('');

    if (data[0] === 'AND' || data[0] === 'OR' || data[0] === 'NOT') {
      return reject;
    }
    
    let normalizedValue;

    if (value === 'true') {
      normalizedValue = true;
    } else if (value === 'false') {
      normalizedValue = false;
    } else if (value === 'null') {
      normalizedValue = null;
    } else {
      normalizedValue = value;
    }

    return {
      type: 'Tag',
      expression: {
        location: {
          start,
          end: start + value.length,
        },
        type: 'LiteralExpression',
        quoted: false,
        value: normalizedValue
      },
    };
  } %}
  | sqstring {% (data, start) => ({type: 'Tag', expression: {location: {start, end: start + data.join('').length + 2}, type: 'LiteralExpression', quoted: true, quotes: 'single', value: data.join('')}}) %}
  | dqstring {% (data, start) => ({type: 'Tag', expression: {location: {start, end: start + data.join('').length + 2}, type: 'LiteralExpression', quoted: true, quotes: 'double', value: data.join('')}}) %}

range ->
    range_open decimal " TO " decimal range_close {% (data, start) => {
    return {
      location: {
        start,
      },
      type: 'Tag',
      expression: {
        location: {
          start: data[0].location.start,
          end: data[4].location.start + 1,
        },
        type: 'RangeExpression',
        range: {
          min: data[1],
          minInclusive: data[0].inclusive,
          maxInclusive: data[4].inclusive,
          max: data[3],
        }
      }
    }
  } %}

range_open ->
  "[" {% (data, start) => ({location: {start}, inclusive: true}) %}
  | "{" {% (data, start) => ({location: {start}, inclusive: false}) %}

range_close ->
  "]" {% (data, start) => ({location: {start}, inclusive: true}) %}
  | "}" {% (data, start) => ({location: {start}, inclusive: false}) %}

comparison_operator ->
    (
      ":"
    | ":=" 
    | ":>"
    | ":<" 
    | ":>=" 
    | ":<="
  ) {% (data, start) => ({location: {start, end: start + data[0][0].length}, type: 'ComparisonOperator', operator: data[0][0]}) %}

regex ->
  regex_body regex_flags {% d => d.join('') %}

regex_body ->
    "/" regex_body_char:* "/" {% (data) => '/' + data[1].join('') + '/' %}

regex_body_char ->
    [^\\] {% id %}
  | "\\" [^\\] {% d => '\\' + d[1] %}

regex_flags ->
  null |
  [gmiyusd]:+ {% d => d[0].join('') %}

unquoted_value ->
  [a-zA-Z_*?@#$] [a-zA-Z\.\-_*?@#$]:* {% d => d[0] + d[1].join('') %}