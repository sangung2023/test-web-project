import prisma from '../config/database.js';

// User Repository 클래스
export class UserRepository {
  // 사용자 생성
  async create(userData) {
    const { name, email, password, birthday } = userData;
    
    return await prisma.user.create({
      data: {
        name,
        email,
        password,
        birthday: new Date(birthday)
      }
    });
  }

  // 이메일로 사용자 찾기
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  // 이름으로 사용자 찾기
  async findByName(name) {
    return await prisma.user.findFirst({
      where: { name }
    });
  }

  // 이메일 또는 이름으로 중복 확인
  async findDuplicate(email, name) {
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
  async findAll() {
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
  async findById(userId) {
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

  // 사용자 정보 수정
  async update(userId, updateData) {
    return await prisma.user.update({
      where: { userId },
      data: updateData
    });
  }

  // 사용자 삭제
  async delete(userId) {
    return await prisma.user.delete({
      where: { userId }
    });
  }

}
