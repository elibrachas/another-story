const { jest } = require('@jest/globals')

module.exports = {
  createServerActionClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id' },
          },
        },
      }),
      getUser: jest.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
    rpc: jest.fn(() => ({
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}
