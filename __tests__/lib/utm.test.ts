import { addUtmParams } from "@/lib/utm"

describe("addUtmParams", () => {
  test("adds utm parameters to url without query", () => {
    expect(addUtmParams("https://example.com")).toBe(
      "https://example.com/?utm_source=mi_libro&utm_medium=landing&utm_campaign=renuncio"
    )
  })

  test("merges utm parameters with existing query", () => {
    expect(addUtmParams("https://example.com/path?foo=bar")).toBe(
      "https://example.com/path?foo=bar&utm_source=mi_libro&utm_medium=landing&utm_campaign=renuncio"
    )
  })
})
