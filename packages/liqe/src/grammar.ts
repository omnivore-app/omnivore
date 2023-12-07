// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: undefined,
  ParserRules: [
    {"name": "main", "symbols": ["_", "logical_expression", "_"], "postprocess": (data) => data[1]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "whitespace_character"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": (data) => data[0].length},
    {"name": "__$ebnf$1", "symbols": ["whitespace_character"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "whitespace_character"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": (data) => data[0].length},
    {"name": "whitespace_character", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "decimal$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "decimal$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "decimal$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$2", "symbols": ["decimal$ebnf$2", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": ["decimal$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "decimal$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "decimal$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "decimal$ebnf$3", "symbols": ["decimal$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "decimal$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "decimal", "symbols": ["decimal$ebnf$1", "decimal$ebnf$2", "decimal$ebnf$3"], "postprocess": 
        (data) => parseFloat(
          (data[0] || "") +
          data[1].join("") +
          (data[2] ? "."+data[2][1].join("") : "")
        )
        },
    {"name": "dqstring$ebnf$1", "symbols": []},
    {"name": "dqstring$ebnf$1", "symbols": ["dqstring$ebnf$1", "dstrchar"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "dqstring", "symbols": [{"literal":"\""}, "dqstring$ebnf$1", {"literal":"\""}], "postprocess": (data) => data[1].join('')},
    {"name": "sqstring$ebnf$1", "symbols": []},
    {"name": "sqstring$ebnf$1", "symbols": ["sqstring$ebnf$1", "sstrchar"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "sqstring", "symbols": [{"literal":"'"}, "sqstring$ebnf$1", {"literal":"'"}], "postprocess": (data) => data[1].join('')},
    {"name": "dstrchar", "symbols": [/[^\\"\n]/], "postprocess": id},
    {"name": "dstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": 
        (data) => JSON.parse("\""+data.join("")+"\"")
        },
    {"name": "sstrchar", "symbols": [/[^\\'\n]/], "postprocess": id},
    {"name": "sstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": (data) => JSON.parse("\"" + data.join("") + "\"")},
    {"name": "sstrchar$string$1", "symbols": [{"literal":"\\"}, {"literal":"'"}], "postprocess": (d) => d.join('')},
    {"name": "sstrchar", "symbols": ["sstrchar$string$1"], "postprocess": () => "'"},
    {"name": "strescape", "symbols": [/["\\/bfnrt]/], "postprocess": id},
    {"name": "strescape", "symbols": [{"literal":"u"}, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/], "postprocess": 
        (data) => data.join('')
        },
    {"name": "logical_expression", "symbols": ["two_op_logical_expression"], "postprocess": id},
    {"name": "two_op_logical_expression", "symbols": ["pre_two_op_logical_expression", "boolean_operator", "post_one_op_logical_expression"], "postprocess":  (data) => ({
          type: 'LogicalExpression',
          location: {
            start: data[0].location.start,
            end: data[2].location.end,
          },
          operator: data[1],
          left: data[0],
          right: data[2]
        }) },
    {"name": "two_op_logical_expression", "symbols": ["pre_two_op_implicit_logical_expression", "__", "post_one_op_implicit_logical_expression"], "postprocess":  (data) => ({
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
        }) },
    {"name": "two_op_logical_expression", "symbols": ["one_op_logical_expression"], "postprocess": d => d[0]},
    {"name": "pre_two_op_implicit_logical_expression", "symbols": ["two_op_logical_expression"], "postprocess": d => d[0]},
    {"name": "pre_two_op_implicit_logical_expression", "symbols": ["parentheses_open", "_", "two_op_logical_expression", "_", "parentheses_close"], "postprocess": d => ({location: {start: d[0].location.start, end: d[4].location.start + 1, }, type: 'ParenthesizedExpression', expression: d[2]})},
    {"name": "post_one_op_implicit_logical_expression", "symbols": ["one_op_logical_expression"], "postprocess": d => d[0]},
    {"name": "post_one_op_implicit_logical_expression", "symbols": ["parentheses_open", "_", "one_op_logical_expression", "_", "parentheses_close"], "postprocess": d => ({location: {start: d[0].location.start, end: d[4].location.start + 1, },type: 'ParenthesizedExpression', expression: d[2]})},
    {"name": "pre_two_op_logical_expression", "symbols": ["two_op_logical_expression", "__"], "postprocess": d => d[0]},
    {"name": "pre_two_op_logical_expression", "symbols": ["parentheses_open", "_", "two_op_logical_expression", "_", "parentheses_close"], "postprocess": d => ({location: {start: d[0].location.start, end: d[4].location.start + 1, },type: 'ParenthesizedExpression', expression: d[2]})},
    {"name": "one_op_logical_expression", "symbols": ["parentheses_open", "_", "parentheses_close"], "postprocess":  d => ({location: {start: d[0].location.start, end: d[2].location.start + 1, },type: 'ParenthesizedExpression', expression: {
          type: 'EmptyExpression',
          location: {
            start: d[0].location.start + 1,
            end: d[0].location.start + 1,
          },
        }}) },
    {"name": "one_op_logical_expression", "symbols": ["parentheses_open", "_", "two_op_logical_expression", "_", "parentheses_close"], "postprocess": d => ({location: {start: d[0].location.start, end: d[4].location.start + 1, },type: 'ParenthesizedExpression', expression: d[2]})},
    {"name": "one_op_logical_expression$string$1", "symbols": [{"literal":"N"}, {"literal":"O"}, {"literal":"T"}], "postprocess": (d) => d.join('')},
    {"name": "one_op_logical_expression", "symbols": ["one_op_logical_expression$string$1", "post_boolean_primary"], "postprocess":  (data, start) => {
          return {
            type: 'UnaryOperator',
            operator: 'NOT',
            operand: data[1],
            location: {
              start,
              end: data[1].location.end,
            }
          };
        } },
    {"name": "one_op_logical_expression", "symbols": [{"literal":"-"}, "boolean_primary"], "postprocess":  (data, start) => {
          return {
            type: 'UnaryOperator',
            operator: '-',
            operand: data[1],
            location: {
              start,
              end: data[1].location.end,
            }
          };
        } },
    {"name": "one_op_logical_expression", "symbols": ["boolean_primary"], "postprocess": d => d[0]},
    {"name": "post_one_op_logical_expression", "symbols": ["__", "one_op_logical_expression"], "postprocess": d => d[1]},
    {"name": "post_one_op_logical_expression", "symbols": ["parentheses_open", "_", "one_op_logical_expression", "_", "parentheses_close"], "postprocess": d => ({location: {start: d[0].location, end: d[4].location + 1, },type: 'ParenthesizedExpression', expression: d[2]})},
    {"name": "parentheses_open", "symbols": [{"literal":"("}], "postprocess": (data, start) => ({location: {start}})},
    {"name": "parentheses_close", "symbols": [{"literal":")"}], "postprocess": (data, start) => ({location: {start}})},
    {"name": "boolean_operator$string$1", "symbols": [{"literal":"O"}, {"literal":"R"}], "postprocess": (d) => d.join('')},
    {"name": "boolean_operator", "symbols": ["boolean_operator$string$1"], "postprocess": (data, start) => ({location: {start, end: start + 2}, operator: 'OR', type: 'BooleanOperator'})},
    {"name": "boolean_operator$string$2", "symbols": [{"literal":"A"}, {"literal":"N"}, {"literal":"D"}], "postprocess": (d) => d.join('')},
    {"name": "boolean_operator", "symbols": ["boolean_operator$string$2"], "postprocess": (data, start) => ({location: {start, end: start + 3}, operator: 'AND', type: 'BooleanOperator'})},
    {"name": "boolean_primary", "symbols": ["tag_expression"], "postprocess": id},
    {"name": "post_boolean_primary", "symbols": ["__", "parentheses_open", "_", "two_op_logical_expression", "_", "parentheses_close"], "postprocess": d => ({location: {start: d[1].location.start, end: d[5].location.start + 1, }, type: 'ParenthesizedExpression', expression: d[3]})},
    {"name": "post_boolean_primary", "symbols": ["__", "boolean_primary"], "postprocess": d => d[1]},
    {"name": "tag_expression", "symbols": ["field", "comparison_operator", "expression"], "postprocess":  (data, start) => {
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
        } },
    {"name": "tag_expression", "symbols": ["field", "comparison_operator"], "postprocess":  (data, start) => {
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
        } },
    {"name": "tag_expression", "symbols": ["expression"], "postprocess":  (data, start) => {
          return {location: {start, end: data[0].expression.location.end}, field: {type: 'ImplicitField'}, ...data[0]};
        } },
    {"name": "field$ebnf$1", "symbols": []},
    {"name": "field$ebnf$1", "symbols": ["field$ebnf$1", /[a-zA-Z\d_$.]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "field", "symbols": [/[_a-zA-Z$]/, "field$ebnf$1"], "postprocess": (data, start) => ({type: 'LiteralExpression', name: data[0] + data[1].join(''), quoted: false, location: {start, end: start + (data[0] + data[1].join('')).length}})},
    {"name": "field", "symbols": ["sqstring"], "postprocess": (data, start) => ({type: 'LiteralExpression', name: data[0], quoted: true, quotes: 'single', location: {start, end: start + data[0].length + 2}})},
    {"name": "field", "symbols": ["dqstring"], "postprocess": (data, start) => ({type: 'LiteralExpression', name: data[0], quoted: true, quotes: 'double', location: {start, end: start + data[0].length + 2}})},
    {"name": "expression", "symbols": ["decimal"], "postprocess": (data, start) => ({type: 'Tag', expression: {location: {start, end: start + data.join('').length}, type: 'LiteralExpression', quoted: false, value: Number(data.join(''))}})},
    {"name": "expression", "symbols": ["regex"], "postprocess": (data, start) => ({type: 'Tag', expression: {location: {start, end: start + data.join('').length}, type: 'RegexExpression', value: data.join('')}})},
    {"name": "expression", "symbols": ["range"], "postprocess": (data) => data[0]},
    {"name": "expression", "symbols": ["unquoted_value"], "postprocess":  (data, start, reject) => {
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
        } },
    {"name": "expression", "symbols": ["sqstring"], "postprocess": (data, start) => ({type: 'Tag', expression: {location: {start, end: start + data.join('').length + 2}, type: 'LiteralExpression', quoted: true, quotes: 'single', value: data.join('')}})},
    {"name": "expression", "symbols": ["dqstring"], "postprocess": (data, start) => ({type: 'Tag', expression: {location: {start, end: start + data.join('').length + 2}, type: 'LiteralExpression', quoted: true, quotes: 'double', value: data.join('')}})},
    {"name": "range$string$1", "symbols": [{"literal":" "}, {"literal":"T"}, {"literal":"O"}, {"literal":" "}], "postprocess": (d) => d.join('')},
    {"name": "range", "symbols": ["range_open", "decimal", "range$string$1", "decimal", "range_close"], "postprocess":  (data, start) => {
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
        } },
    {"name": "range_open", "symbols": [{"literal":"["}], "postprocess": (data, start) => ({location: {start}, inclusive: true})},
    {"name": "range_open", "symbols": [{"literal":"{"}], "postprocess": (data, start) => ({location: {start}, inclusive: false})},
    {"name": "range_close", "symbols": [{"literal":"]"}], "postprocess": (data, start) => ({location: {start}, inclusive: true})},
    {"name": "range_close", "symbols": [{"literal":"}"}], "postprocess": (data, start) => ({location: {start}, inclusive: false})},
    {"name": "comparison_operator$subexpression$1", "symbols": [{"literal":":"}]},
    {"name": "comparison_operator$subexpression$1$string$1", "symbols": [{"literal":":"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "comparison_operator$subexpression$1", "symbols": ["comparison_operator$subexpression$1$string$1"]},
    {"name": "comparison_operator$subexpression$1$string$2", "symbols": [{"literal":":"}, {"literal":">"}], "postprocess": (d) => d.join('')},
    {"name": "comparison_operator$subexpression$1", "symbols": ["comparison_operator$subexpression$1$string$2"]},
    {"name": "comparison_operator$subexpression$1$string$3", "symbols": [{"literal":":"}, {"literal":"<"}], "postprocess": (d) => d.join('')},
    {"name": "comparison_operator$subexpression$1", "symbols": ["comparison_operator$subexpression$1$string$3"]},
    {"name": "comparison_operator$subexpression$1$string$4", "symbols": [{"literal":":"}, {"literal":">"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "comparison_operator$subexpression$1", "symbols": ["comparison_operator$subexpression$1$string$4"]},
    {"name": "comparison_operator$subexpression$1$string$5", "symbols": [{"literal":":"}, {"literal":"<"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "comparison_operator$subexpression$1", "symbols": ["comparison_operator$subexpression$1$string$5"]},
    {"name": "comparison_operator", "symbols": ["comparison_operator$subexpression$1"], "postprocess": (data, start) => ({location: {start, end: start + data[0][0].length}, type: 'ComparisonOperator', operator: data[0][0]})},
    {"name": "regex", "symbols": ["regex_body", "regex_flags"], "postprocess": d => d.join('')},
    {"name": "regex_body$ebnf$1", "symbols": []},
    {"name": "regex_body$ebnf$1", "symbols": ["regex_body$ebnf$1", "regex_body_char"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "regex_body", "symbols": [{"literal":"/"}, "regex_body$ebnf$1", {"literal":"/"}], "postprocess": (data) => '/' + data[1].join('') + '/'},
    {"name": "regex_body_char", "symbols": [/[^\\]/], "postprocess": id},
    {"name": "regex_body_char", "symbols": [{"literal":"\\"}, /[^\\]/], "postprocess": d => '\\' + d[1]},
    {"name": "regex_flags", "symbols": []},
    {"name": "regex_flags$ebnf$1", "symbols": [/[gmiyusd]/]},
    {"name": "regex_flags$ebnf$1", "symbols": ["regex_flags$ebnf$1", /[gmiyusd]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "regex_flags", "symbols": ["regex_flags$ebnf$1"], "postprocess": d => d[0].join('')},
    {"name": "unquoted_value$ebnf$1", "symbols": []},
    {"name": "unquoted_value$ebnf$1", "symbols": ["unquoted_value$ebnf$1", /[a-zA-Z\.\-_*?@#$]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "unquoted_value", "symbols": [/[a-zA-Z_*?@#$]/, "unquoted_value$ebnf$1"], "postprocess": d => d[0] + d[1].join('')}
  ],
  ParserStart: "main",
};

export default grammar;
