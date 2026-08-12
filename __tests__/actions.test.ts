import { registerUser } from '@/app/actions';
import { prisma } from '@/lib/prisma';

// 1. Mock the Prisma Client Module
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// 2. Mock bcrypt so we don't actually spend time hashing passwords
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
}));

describe('Server Action: registerUser', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make the FIRST registered user an ADMIN and ACTIVE', async () => {
    // Setup: Mock database to say "there are 0 users currently"
    (prisma.user.count as jest.Mock).mockResolvedValue(0);

    // Act: Try to register
    const formData = new FormData();
    formData.append('email', 'admin@test.com');
    formData.append('password', 'password123');
    formData.append('name', 'Admin User');

    await registerUser(formData);

    // Assert: Check if prisma.create was called with ADMIN role
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'admin@test.com',
          role: 'ADMIN',    // <--- Crucial Check
          isActive: true,   // <--- Crucial Check
        }),
      })
    );
  });

  it('should make the SECOND registered user an EDITOR and INACTIVE', async () => {
    // Setup: Mock database to say "there is already 1 user"
    (prisma.user.count as jest.Mock).mockResolvedValue(1);

    // Act: Try to register user 2
    const formData = new FormData();
    formData.append('email', 'user@test.com');
    formData.append('password', 'password123');
    formData.append('name', 'Regular User');

    await registerUser(formData);

    // Assert: Check if prisma.create was called with EDITOR role
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'user@test.com',
          role: 'EDITOR',   // <--- Crucial Check
          isActive: false,  // <--- Crucial Check
        }),
      })
    );
  });
});