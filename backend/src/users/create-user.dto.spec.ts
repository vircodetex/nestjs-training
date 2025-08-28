import { validate } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

describe('CreateUserDto', () => {
    let dto = new CreateUserDto();
    beforeAll(() => {
        dto = new CreateUserDto();
        dto.email = 'test@test.com';
        dto.name = 'testUser';
        dto.password = '123456A#';
    });

    it('should validate complete valid data', async () => {
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail on invalid email', async () => {
        dto.email = 'test';

        const errors = await validate(dto);
        expect(errors.length).toBe(1);
        expect(errors[0].property).toBe('email');
        expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    const testPassword = async (password: string, expectedMessages: string[]) => {
        dto.password = password;

        const errors = await validate(dto)
        const passwordError = errors.find((error) => error.property === 'password');
        expect(passwordError).toBeDefined();

        const messages = Object.values(passwordError?.constraints ?? {});
        expectedMessages.forEach((msg) => expect(messages).toContain(msg));

    };

    it('should fail without at least 1 uppercase letter', async () => {
        await testPassword('123456', ['must contain at least 1 uppercase letter']);
    });
    it('should fail without at least 1 number', async () => {
        await testPassword('abcdefA#', ['must contain at least 1 number']);
    });
    it('should fail without at least 1 special character', async () => {
        await testPassword('abcdefA2', ['must contain at least 1 special character']);
    });
});
