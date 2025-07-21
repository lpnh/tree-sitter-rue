package tree_sitter_rue_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_rue "github.com/lpnh/tree-sitter-rue/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_rue.Language())
	if language == nil {
		t.Errorf("Error loading Rue grammar")
	}
}
