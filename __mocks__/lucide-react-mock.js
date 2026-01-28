module.exports = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (prop === "__esModule") {
        return true
      }
      return () => null
    },
  },
)
