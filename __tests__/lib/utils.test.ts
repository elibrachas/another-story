import { cn } from "@/lib/utils"

describe("cn utility", () => {
  test("combines class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2")
    expect(cn("class1", null, undefined, "class2")).toBe("class1 class2")
    expect(cn("class1", false && "class2", true && "class3")).toBe("class1 class3")
  })
})
