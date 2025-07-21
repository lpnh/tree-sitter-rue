/**
 * @file Rue grammar for tree-sitter
 * @author lpnh <paniguel.lpnh@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "rue",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
