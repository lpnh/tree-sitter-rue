/**
 * @file Rue grammar for tree-sitter
 * @author lpnh <paniguel.lpnh@gmail.com>
 * @license Unlicense
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  function_calls: 4,
  multiplicative: 3,
  additive: 2,
  comparative: 1,
};

module.exports = grammar({
  name: 'rue',

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$._primary_expression, $._type_identifier],
  ],

  rules: {
    source_file: $ => repeat(choice(
      $.struct_item,
      $.function_item
    )),

    // ========== Definitions ==========

    struct_item: $ => seq(
      'struct',
      field('name', $._type_identifier),
      '{',
      field('body', optional($.field_declaration_list)),
      '}'
    ),

    field_declaration_list: $ => seq(
      sepByComma($.field_declaration),
      optional(',')
    ),

    field_declaration: $ => seq(
      field('name', $._field_identifier),
      ':',
      field('type', $._type),
    ),

    function_item: $ => seq(
      'fn',
      field('name', $.identifier),
      field('parameters', $.parameters),
      optional(seq('->', field('return_type', $._type))),
      field('body', $.block)
    ),

    parameters: $ => seq(
      '(',
      optional(sepByComma($.parameter)),
      ')'
    ),

    parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type)
    ),

    // ========== Types ==========

    _type: $ => choice(
      $.tuple_type,
      $.unit_type,
      $.array_type,
      $._type_identifier,
      $.primitive_type
    ),

    primitive_type: $ => choice('i32', 'i64', 'bool'),

    tuple_type: $ => choice(
      seq(
        '(',
        $._type,
        ',',
        ')'
      ),
      seq(
        '(',
        seq(
          $._type,
          repeat1(seq(',', $._type)),
          optional(',')
        ),
        ')'
      )
    ),

    unit_type: $ => seq('(', ')'), // empty tuple

    array_type: $ => seq(
      '[',
      field('element', $._type),
      ';',
      field('length', $.integer_literal), // why not _expression (?)
      ']',
    ),

    // ========== Statements ==========

    block: $ => seq(
      '{',
      repeat($._statement),
      optional($._expression),
      '}'
    ),

    _statement: $ => choice(
      $.let_statement,
      $.assignment_statement,
      $.expression_statement
    ),

    let_statement: $ => seq(
      'let',
      field('name', $.identifier),
      optional(seq(
        ':',
        field('type', $._type),
      )), // is the type really optional (?)
      '=',
      field('value', $._expression),
      ';'
    ),

    assignment_statement: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $._expression),
      ';'
    ),

    expression_statement: $ => seq($._expression, ';'),

    // ========== Expressions ==========

    _expression: $ => choice(
      $.if_expression,
      $.while_expression,
      $.binary_expression,
      $.call_expression,
      $._primary_expression
    ),

    if_expression: $ => prec.right(seq(
      'if',
      field('condition', $._expression),
      field('consequence', $.block),
      optional(field('alternative', $.else_clause)),
    )),

    else_clause: $ => seq(
      'else',
      choice($.block, $.if_expression)),

    while_expression: $ => prec.right(seq(
      'while',
      field('condition', $._expression),
      field('body', $.block)
    )),

    binary_expression: $ => {
      const table = [
        [PREC.multiplicative, choice('*', '/', '%')],
        [PREC.additive, choice('+', '-')],
        [PREC.comparative, choice('==', '!=', '<', '<=', '>', '>=')],
      ];

      // @ts-ignore
      return choice(...table.map(([precedence, operator]) => prec.left(precedence, seq(
        field('left', $._expression),
        // @ts-ignore
        field('operator', operator),
        field('right', $._expression),
      ))));
    },

    call_expression: $ => prec(PREC.function_calls, seq(
      field('function', $.identifier),
      field('arguments', $.arguments)
    )),

    arguments: $ => seq(
      '(',
      optional(sepByComma($._expression)),
      ')'
    ),

    _primary_expression: $ => choice(
      $.identifier,
      $.integer_literal,
      $.boolean_literal,
      $.unit_literal,
      $.parenthesized_expression,
      $.tuple_expression,
      $.array_expression,
      $.struct_expression
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    tuple_expression: $ => choice(
      seq(
        '(',
        $._expression,
        ',',
        ')'
      ),
      seq(
        '(',
        seq(
          $._expression,
          repeat1(seq(',', $._expression)),
          optional(',')
        ),
        ')'
      )
    ),

    unit_expression: _ => seq('(', ')'),

    struct_expression: $ => seq(
      field('name', $._type_identifier),
      '{',
      optional(field('body', $.field_initializer_list)),
      '}'
    ),

    field_initializer_list: $ => seq(
      sepByComma($.field_initializer),
      optional(',')
    ),

    field_initializer: $ => seq(
      field('field', $._field_identifier),
      ':',
      field('value', $._expression)
    ),

    array_expression: $ => seq(
      '[',
      optional(seq(
        sepByComma($._expression),
        optional(','),
      )),
      ']'
    ),

    // ========== Tokens ==========

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    integer_literal: $ => /\d+/,

    boolean_literal: $ => choice('true', 'false'),

    unit_literal: $ => seq('(', ')'),

    line_comment: $ => token(seq('//', /.*/)),

    block_comment: $ => token(seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/'
    )),

    _type_identifier: $ => alias($.identifier, $.type_identifier),
    _field_identifier: $ => alias($.identifier, $.field_identifier),
  }
});

function sepByComma(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
