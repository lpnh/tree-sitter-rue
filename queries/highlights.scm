[
  "fn"
  "let"
  "if"
  "else"
  "while"
] @keyword

(primitive_type) @type.builtin
(unit_type) @type.builtin

(function_item
  name: (identifier) @function)

(call_expression
  function: (identifier) @function)

(parameter
  name: (identifier) @variable.parameter)

(let_statement
  name: (identifier) @variable)

(assignment_statement
  name: (identifier) @variable)

(identifier) @variable

(integer_literal) @number
(boolean_literal) @boolean
(unit_literal) @constant.builtin

(line_comment) @comment
(block_comment) @comment

(binary_expression
  operator: _ @operator)

[
  "="
  "->"
  ":"
] @operator

[
  "("
  ")"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  ";"
] @punctuation.delimiter
