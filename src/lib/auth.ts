import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// 관리자 이메일 목록 (환경변수로 설정, 쉼표로 구분)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

const KakaoProvider = {
  id: 'kakao',
  name: '카카오',
  type: 'oauth' as const,
  authorization: {
    url: 'https://kauth.kakao.com/oauth/authorize',
    params: { scope: 'profile_nickname profile_image account_email' },
  },
  token: 'https://kauth.kakao.com/oauth/token',
  userinfo: 'https://kapi.kakao.com/v2/user/me',
  clientId: process.env.KAKAO_CLIENT_ID!,
  clientSecret: process.env.KAKAO_CLIENT_SECRET!,
  profile(profile: {
    id: number;
    kakao_account?: {
      email?: string;
      profile?: { nickname?: string; profile_image_url?: string };
    };
  }) {
    return {
      id: String(profile.id),
      name: profile.kakao_account?.profile?.nickname ?? '카카오 사용자',
      email: profile.kakao_account?.email ?? `kakao_${profile.id}@kakao.local`,
      image: profile.kakao_account?.profile?.profile_image_url ?? null,
    };
  },
};

const providers: any[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: '이메일', type: 'email' },
      password: { label: '비밀번호', type: 'password' },
    },
    async authorize(credentials) {
      console.log('Credentials authorize called:', { 
        email: credentials?.email, 
        hasPassword: !!credentials?.password 
      });

      if (!credentials?.email || !credentials?.password) {
        console.log('Missing credentials');
        return null;
      }

      try {
        console.log('Looking for user:', credentials.email);
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        console.log('User found:', !!user);
        if (!user) {
          console.log('User not found in database');
          return null;
        }

        console.log('Comparing password...');
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log('Password valid:', isValid);
        if (!isValid) {
          console.log('Password comparison failed');
          return null;
        }

        const result = {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: user.role,
        };
        
        console.log('Authentication successful for:', result.email);
        return result;
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
  }),
];

// Kakao 제공업체는 환경 변수가 설정된 경우에만 추가
if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  providers.push(KakaoProvider);
}

// NEXTAUTH_URL 정리 함수
const getAuthUrl = () => {
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (!nextAuthUrl) {
    // 개발 환경에서는 기본값 사용
    return 'http://localhost:3000';
  }
  
  // NEXTAUTH_URL="https://wlk-deploy-gyd3wpr50-junsus-projects-f2597ce7.vercel.app/" 형태 처리
  const cleanUrl = nextAuthUrl.replace(/^NEXTAUTH_URL=/, '').replace(/\/$/, '');
  return cleanUrl;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? 'fallback-secret-for-development-only',
  trustHost: true,
  debug: true, // 디버깅 모드 활성화
  providers,
  // 정리된 URL 사용
  ...(getAuthUrl() && { url: getAuthUrl() }),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'kakao') {
        if (!user.email) return false;
        const isAdminEmail = ADMIN_EMAILS.includes(user.email);
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email,
              displayName: user.name ?? user.email.split('@')[0],
              password: '',
              firstName: user.name?.split(' ')[0] ?? '',
              lastName: user.name?.split(' ').slice(1).join(' ') ?? '',
              role: isAdminEmail ? 'ADMIN' : 'USER',
            },
          });
        } else if (isAdminEmail && existing.role !== 'ADMIN') {
          // 관리자 이메일이지만 ADMIN이 아닌 경우 업데이트
          await prisma.user.update({
            where: { email: user.email },
            data: { role: 'ADMIN' },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'USER';
      }
      if (token.email && !token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      // 어드민 이메일 체크하여 role 강제 업데이트
      if (token.email && ADMIN_EMAILS.includes(token.email as string)) {
        token.role = 'ADMIN';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
