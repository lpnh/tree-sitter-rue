import XCTest
import SwiftTreeSitter
import TreeSitterRue

final class TreeSitterRueTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_rue())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Rue grammar")
    }
}
