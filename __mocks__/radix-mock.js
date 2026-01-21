module.exports = new Proxy(
  {},
  {
    get: () =>
      new Proxy(() => {}, {
        get: () => () => ({}),
      }),
  },
)
