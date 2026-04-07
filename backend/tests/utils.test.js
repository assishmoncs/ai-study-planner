const { sendSuccess, sendError } = require('../src/utils/responseHelper');
const { signAccessToken, verifyToken } = require('../src/utils/jwtUtils');

// Mock JWT_SECRET for tests
process.env.JWT_SECRET = 'test-secret-key';

describe('responseHelper', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('sendSuccess sends correct shape', () => {
    const res = mockRes();
    sendSuccess(res, { statusCode: 201, message: 'Created', data: { id: 1 } });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Created',
      data: { id: 1 },
    });
  });

  it('sendError sends correct shape', () => {
    const res = mockRes();
    sendError(res, { statusCode: 400, message: 'Bad Request' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Bad Request' });
  });
});

describe('jwtUtils', () => {
  const userId = '64a1b2c3d4e5f6a7b8c9d0e1';

  it('signs and verifies a token', () => {
    const token = signAccessToken(userId);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(userId);
  });

  it('throws on invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });
});
