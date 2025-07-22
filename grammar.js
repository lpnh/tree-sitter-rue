/**
 * @file Rue grammar for tree-sitter
 * @author lpnh <paniguel.lpnh@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  multiplicative: 3,
  additive: 2,
  comparative: 1,
};

const commaSep = rule => seq(rule, repeat(seq(',', rule)));

module.exports = grammar({
  name: 'rue',

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($.function_item),

    // ========== Definitions ==========

    function_item: $ => seq(
      'fn',
      field('name', $.identifier),
      field('parameters', $.parameters),
      '->',
      field('return_type', $._type),
      field('body', $.block)
    ),

    parameters: $ => seq(
      '(',
      optional(commaSep($.parameter)),
      ')'
    ),

    parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type)
    ),

    // ========== Types ==========

    _type: $ => choice(
      $.primitive_type,
      $.unit_type
    ),

    primitive_type: $ => choice('i32', 'i64', 'bool'),
    
    unit_type: $ => '()',

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
      ':',
      field('type', $._type),
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
      optional(seq('else', field('alternative', $.block)))
    )),

    while_expression: $ => prec.right(seq(
      'while',
      field('condition', $._expression),
      field('body', $.block)
    )),

    binary_expression: $ => choice(
      ...[
        [PREC.comparative, choice('==', '!=', '<', '<=', '>', '>=')],
        [PREC.additive, choice('+', '-')],
        [PREC.multiplicative, choice('*', '/', '%')],
      ].map(([precedence, operator]) => 
        prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression)
        ))
      )
    ),

    call_expression: $ => prec(5, seq(
      field('function', $.identifier),
      field('arguments', $.arguments)
    )),

    arguments: $ => seq(
      '(',
      optional(commaSep($._expression)),
      ')'
    ),

    _primary_expression: $ => choice(
      $.identifier,
      $.integer_literal,
      $.boolean_literal,
      $.unit_literal,
      $.parenthesized_expression
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    // ========== Tokens ==========

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    integer_literal: $ => /\d+/,

    boolean_literal: $ => choice('true', 'false'),

    unit_literal: $ => prec(1, '()'),

    line_comment: $ => token(seq('//', /.*/)),

    block_comment: $ => token(seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/'
    )),
  }
});
