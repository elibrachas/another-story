import { submitStory, upvoteStory, submitComment } from "@/lib/actions"

// Mock de createServerActionClient
jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createServerActionClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: "test-user-id",
            },
          },
        },
      }),
    },
    from: jest.fn().mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      single: jest.fn().mockResolvedValue({
        data: table === "profiles" ? { username: "TestUser", admin: false } : { id: "new-id" },
        error: null,
      }),
    })),
    rpc: jest.fn(() => ({
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}))

// Mock de next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

describe("Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("submitStory", () => {
    it("should submit a story successfully", async () => {
      const result = await submitStory({
        title: "Test Story",
        content: "This is a test story content",
        industry: "Tecnología",
        isAnonymous: true,
        tags: ["tag1", "tag2"],
        customTags: ["customTag1"],
      })

      expect(result.success).toBe(true)
    })
  })

  describe("upvoteStory", () => {
    it("should upvote a story successfully", async () => {
      const result = await upvoteStory("story-123")

      expect(result.success).toBe(true)
    })
  })

  describe("submitComment", () => {
    it("should submit a comment successfully", async () => {
      const result = await submitComment({
        storyId: "story-123",
        content: "This is a test comment",
        isAnonymous: true,
      })

      expect(result.success).toBe(true)
    })
  })
})
