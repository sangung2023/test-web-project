import bcrypt from 'bcrypt';
import prisma from '../config/database.js';

// Prisma를 사용한 User 서비스 클래스
class UserService {
  // 사용자 생성
  static async create(userData) {
    const { name, email, password, birthday } = userData;
    
    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    return await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        birthday: new Date(birthday)
      }
    });
  }

  // 이메일로 사용자 찾기
  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  // 이름으로 사용자 찾기
  static async findByName(name) {
    return await prisma.user.findFirst({
      where: { name }
    });
  }

  // 이메일 또는 이름으로 중복 확인
  static async findDuplicate(email, name) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { name }
        ]
      }
    });
  }

  // 모든 사용자 조회 (비밀번호 제외)
  static async findAll() {
    return await prisma.user.findMany({
      select: {
        userId: true,
        name: true,
        email: true,
        birthday: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // ID로 사용자 조회
  static async findById(userId) {
    return await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        email: true,
        birthday: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // 비밀번호 확인
  static async checkPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // 사용자 정보에서 비밀번호 제거
  static sanitizeUser(user) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 사용자와 관련된 게시물 조회
  static async getUserWithBoards(userId) {
    return await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        email: true,
        birthday: true,
        createdAt: true,
        updatedAt: true,
        boards: {
          select: {
            boardId: true,
            title: true,
            content: true,
            image: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
  }

  // 사용자와 관련된 문의 조회
  static async getUserWithSupports(userId) {
    return await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        email: true,
        birthday: true,
        createdAt: true,
        updatedAt: true,
        supports: {
          select: {
            supportId: true,
            title: true,
            category: true,
            content: true,
            file: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
  }

  // 사용자와 모든 관련 데이터 조회
  static async getUserWithAllData(userId) {
    return await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        email: true,
        birthday: true,
        createdAt: true,
        updatedAt: true,
        boards: {
          select: {
            boardId: true,
            title: true,
            content: true,
            image: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        supports: {
          select: {
            supportId: true,
            title: true,
            category: true,
            content: true,
            file: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
  }
}

export default UserService;
