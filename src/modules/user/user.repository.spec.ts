import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../../core/config/prisma/prisma.service';
import { QueryOptions } from '../../shared/types';

// Define User type locally to avoid import issues
type User = {
  id: number;
  email: string;
  password: string;
};

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: any;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
  };

  const mockUsers: User[] = [
    mockUser,
    {
      id: 2,
      email: 'user2@example.com',
      password: 'hashedpassword2',
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get(PrismaService);
  });

  describe('findWithFilters', () => {
    beforeEach(() => {
      prismaService.user.findMany.mockResolvedValue(mockUsers);
      prismaService.user.count.mockResolvedValue(mockUsers.length);
    });

    it('should return paginated results with default settings', async () => {
      const options: QueryOptions = {};

      const result = await repository.findWithFilters(options);

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalItems).toBe(2);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ id: 'desc' }],
        skip: 0,
        take: 10,
      });
    });

    it('should filter by email', async () => {
      const options: QueryOptions = {
        filters: { email: 'test' },
      };

      await repository.findWithFilters(options);

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { email: { contains: 'test', mode: 'insensitive' } },
        orderBy: [{ id: 'desc' }],
        skip: 0,
        take: 10,
      });
    });

    it('should handle search query', async () => {
      const options: QueryOptions = {
        filters: { search: 'example' },
      };

      await repository.findWithFilters(options);

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { email: { contains: 'example', mode: 'insensitive' } },
        orderBy: [{ id: 'desc' }],
        skip: 0,
        take: 10,
      });
    });
  });

  describe('search', () => {
    it('should search by email field', async () => {
      prismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await repository.search('test', ['email']);

      expect(result).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        orderBy: { id: 'desc' },
      });
    });

    it('should return empty array for invalid fields', async () => {
      const result = await repository.search('test', ['invalidField']);

      expect(result).toEqual([]);
      expect(prismaService.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe('countTotal', () => {
    it('should return total count without filters', async () => {
      prismaService.user.count.mockResolvedValue(10);

      const result = await repository.countTotal();

      expect(result).toBe(10);
      expect(prismaService.user.count).toHaveBeenCalledWith();
    });

    it('should return filtered count with email filter', async () => {
      prismaService.user.count.mockResolvedValue(5);

      const result = await repository.countTotal({ email: 'test' });

      expect(result).toBe(5);
      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { email: { contains: 'test', mode: 'insensitive' } },
      });
    });
  });

  // Test existing methods still work
  describe('existing methods', () => {
    it('should find user by id', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById(1);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should find all users', async () => {
      prismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await repository.findAll();

      expect(result).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledWith();
    });

    it('should create a new user', async () => {
      const createData = { email: 'new@example.com', password: 'newpassword' };
      prismaService.user.create.mockResolvedValue({ ...mockUser, ...createData });

      const result = await repository.create(createData);

      expect(result.email).toBe(createData.email);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('should update a user', async () => {
      const updateData = { email: 'updated@example.com' };
      const updatedUser = { ...mockUser, ...updateData };
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await repository.update(1, updateData);

      expect(result.email).toBe('updated@example.com');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should delete a user', async () => {
      prismaService.user.delete.mockResolvedValue(mockUser);

      await repository.delete(1);

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});