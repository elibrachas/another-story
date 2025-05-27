// Simple mock for the `class-variance-authority` library used in tests.
// The real library exports a `cva` function that returns a function which
// generates class names based on variants. For our test environment we only
// need a minimal implementation that avoids errors when components call it.

// Export an object with a `cva` named export that mimics the behaviour by
// returning a stub function.
module.exports = {
  cva: () => () => "",
}
