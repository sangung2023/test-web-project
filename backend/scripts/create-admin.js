#!/usr/bin/env node

/**
 * 관리자 계정 생성 스크립트
 * 
 * 사용법:
 *   npm run create-admin
 *   또는
 *   node scripts/create-admin.js "이름" "이메일" "비밀번호" "생년월일"
 * 
 * 예시:
 *   node scripts/create-admin.js "관리자" "admin@example.com" "password123" "1990-01-01"
 */

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 로드
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔍 관리자 계정 확인 중...');
    
    // 이미 관리자 계정이 있는지 확인
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('❌ 관리자 계정이 이미 존재합니다.');
      console.log(`   이메일: ${existingAdmin.email}`);
      console.log(`   이름: ${existingAdmin.name}`);
      console.log('   관리자 계정은 하나만 생성할 수 있습니다.');
      process.exit(1);
    }

    // 명령줄 인자에서 정보 가져오기
    const args = process.argv.slice(2);
    
    let name, email, password, birthday;

    if (args.length >= 4) {
      // 명령줄 인자로 제공된 경우
      name = args[0];
      email = args[1];
      password = args[2];
      birthday = args[3];
    } else {
      // 대화형 모드
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const question = (query) => new Promise((resolve) => rl.question(query, resolve));

      console.log('\n📝 관리자 계정 정보를 입력하세요:\n');
      
      name = await question('이름: ');
      email = await question('이메일: ');
      password = await question('비밀번호 (6자 이상): ');
      birthday = await question('생년월일 (YYYY-MM-DD): ');

      rl.close();
    }

    // 입력 검증
    if (!name || !name.trim()) {
      throw new Error('이름을 입력해주세요.');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('유효한 이메일을 입력해주세요.');
    }

    if (!password || password.length < 6) {
      throw new Error('비밀번호는 6자 이상이어야 합니다.');
    }

    if (!birthday) {
      throw new Error('생년월일을 입력해주세요.');
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 관리자 계정 생성
    const admin = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        birthday: new Date(birthday),
        role: 'ADMIN'
      }
    });

    console.log('\n✅ 관리자 계정이 성공적으로 생성되었습니다!');
    console.log(`   이름: ${admin.name}`);
    console.log(`   이메일: ${admin.email}`);
    console.log(`   생년월일: ${admin.birthday.toISOString().split('T')[0]}`);
    console.log(`   역할: ${admin.role}`);
    console.log(`   사용자 ID: ${admin.userId}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
createAdmin();

