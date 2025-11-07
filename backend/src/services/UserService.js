import { UserRepository } from '../repositories/UserRepository.js';
import { CreateUserDTO, UpdateUserDTO, LoginDTO, CreateAdminDTO } from '../dtos/UserDTO.js';
import { AppError, ValidationError, AuthenticationError, NotFoundError } from '../exceptions/AppError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  // 사용자 생성
  async createUser(userData) {
    try {
      const createUserDTO = new CreateUserDTO(userData);
      const validationErrors = createUserDTO.validate();
      
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors.join(', '));
      }

      // 이메일 중복 확인
      const existingUser = await this.userRepository.findByEmail(createUserDTO.email);
      if (existingUser) {
        throw new ValidationError('이미 존재하는 이메일입니다.');
      }

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(createUserDTO.password, 12);

      const user = await this.userRepository.create({
        name: createUserDTO.name,
        email: createUserDTO.email,
        password: hashedPassword,
        birthday: createUserDTO.birthday
      });

      return {
        success: true,
        data: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          birthday: user.birthday
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('사용자 생성 중 오류가 발생했습니다.', 500);
    }
  }

  // 사용자 로그인
  async loginUser(loginData) {
    try {
      const loginDTO = new LoginDTO(loginData);
      const validationErrors = loginDTO.validate();
      
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors.join(', '));
      }

      // 사용자 조회
      const user = await this.userRepository.findByEmail(loginDTO.email);
      if (!user) {
        throw new AuthenticationError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }

      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(loginDTO.password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user.userId, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return {
        success: true,
        message: '로그인에 성공했습니다.',
        accessToken: token,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          birthday: user.birthday,
          role: user.role
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('로그인 중 오류가 발생했습니다.', 500);
    }
  }

  // 사용자 조회
  async getUserById(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      }

      return {
        success: true,
        data: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          birthday: user.birthday,
          role: user.role,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('사용자 조회 중 오류가 발생했습니다.', 500);
    }
  }

  // 사용자 정보 수정
  async updateUser(userId, updateData) {
    try {
      const updateUserDTO = new UpdateUserDTO(updateData);
      const validationErrors = updateUserDTO.validate();
      
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors.join(', '));
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      }

      const updatedUser = await this.userRepository.update(userId, updateUserDTO);

      return {
        success: true,
        data: {
          userId: updatedUser.userId,
          name: updatedUser.name,
          email: updatedUser.email,
          birthday: updatedUser.birthday,
          role: updatedUser.role,
          updatedAt: updatedUser.updatedAt
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('사용자 정보 수정 중 오류가 발생했습니다.', 500);
    }
  }

  // 사용자 삭제
  async deleteUser(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      }

      await this.userRepository.delete(userId);

      return {
        success: true,
        message: '사용자가 성공적으로 삭제되었습니다.'
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('사용자 삭제 중 오류가 발생했습니다.', 500);
    }
  }

  // 관리자 계정 생성 (하나만 생성 가능)
  async createAdmin(adminData) {
    try {
      // 이미 관리자 계정이 존재하는지 확인
      const existingAdmin = await this.userRepository.findAdmin();
      if (existingAdmin) {
        throw new ValidationError('관리자 계정은 이미 존재합니다. 관리자 계정은 하나만 생성할 수 있습니다.');
      }

      const createAdminDTO = new CreateAdminDTO(adminData);
      const validationErrors = createAdminDTO.validate();
      
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors.join(', '));
      }

      // 이메일 중복 확인
      const existingUser = await this.userRepository.findByEmail(createAdminDTO.email);
      if (existingUser) {
        throw new ValidationError('이미 존재하는 이메일입니다.');
      }

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(createAdminDTO.password, 12);

      const admin = await this.userRepository.create({
        name: createAdminDTO.name,
        email: createAdminDTO.email,
        password: hashedPassword,
        birthday: createAdminDTO.birthday,
        role: 'ADMIN'
      });

      return {
        success: true,
        message: '관리자 계정이 성공적으로 생성되었습니다.',
        data: {
          userId: admin.userId,
          name: admin.name,
          email: admin.email,
          birthday: admin.birthday,
          role: admin.role
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('관리자 계정 생성 중 오류가 발생했습니다.', 500);
    }
  }
}
