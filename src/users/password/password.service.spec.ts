
import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test hash() but without testing bcrypt itself (that is slow)
  // make sure bcrypt was called with the password and rounds
  // use mocks and spies
  // mock could be used as spies aas well but with an alternativ implementation of what is spied

  it('should hash password', async () => {
    const mockHash = 'hashed_password';
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

    const password = 'password123';
    const result = await service.hash(password);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(result).toBe(mockHash);
  });

  it('should correctly verify password', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await service.verify('password123', 'hashed password');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed password');
    expect(result).toBeTruthy();
  });

  it('should fail on incorrect password', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const result = await service.verify('password123', 'hashed password');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed password');
    expect(result).toBeFalsy();
  });

});
