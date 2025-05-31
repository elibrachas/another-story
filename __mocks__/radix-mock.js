const React = require("react")

/**
 * Creates a very simple mock component that renders a basic DOM element
 * preserving props and children. Radix UI components are heavily styled and
 * rely on complex behaviours which we don't need during tests. Rendering them
 * as plain <div> elements keeps the DOM structure predictable while avoiding
 * implementation details.
 */
const createMockComponent = (element = "div") =>
  React.forwardRef(({ children, ...props }, ref) =>
    React.createElement(element, { ref, ...props }, children),
  )

module.exports = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (prop === "__esModule") return true
      return createMockComponent()
    },
  },
)
