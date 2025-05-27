// Simple mock for class-variance-authority's `cva` helper.
// It returns a function that joins the passed classes so that
// components relying on it can render without errors in tests.
const cva = () => () => ""

module.exports = {
  __esModule: true,
  cva,
  default: cva,
  variants: () => ({}),
}
