jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../src/utils/jwtUtils', () => ({
  signAccessToken: jest.fn(() => 'access-token'),
  signRefreshToken: jest.fn(() => 'refresh-token'),
  verifyRefreshToken: jest.fn((token) => {
    if (token !== 'refresh-token') {
      const error = new Error('invalid');
      error.name = 'JsonWebTokenError';
      throw error;
    }
    return { id: 'user-1' };
  }),
  hashToken: jest.fn((token) => `hash:${token}`),
}));

const User = require('../src/models/User');
const authService = require('../src/services/authService');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user and stores a hashed refresh token', async () => {
    User.findOne.mockResolvedValue(null);
    const save = jest.fn().mockResolvedValue(true);
    User.create.mockResolvedValue({ _id: 'user-1', save, refreshToken: null });

    const result = await authService.register({ name: 'Jane', email: 'jane@example.com', password: 'secret123' });

    expect(User.create).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'secret123',
    });
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(save).toHaveBeenCalled();
  });

  it('rejects invalid login credentials', async () => {
    const select = jest.fn().mockResolvedValue({
      comparePassword: jest.fn().mockResolvedValue(false),
    });
    User.findOne.mockReturnValue({ select });

    await expect(authService.login({ email: 'jane@example.com', password: 'wrong' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('rotates refresh tokens on session refresh', async () => {
    const save = jest.fn().mockResolvedValue(true);
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'user-1', refreshToken: 'hash:refresh-token', save }),
    });

    const result = await authService.refreshSession('refresh-token');

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(save).toHaveBeenCalled();
  });
});
