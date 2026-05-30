import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.RESEND_FROM || 'noreply@wlkorea.com';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// 이메일 인증 메일 발송
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  await getResend().emails.send({
    from: `West Lafayette Korea <${FROM_EMAIL}>`,
    to: email,
    subject: '[West Lafayette Korea] 이메일 인증을 완료해주세요',
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1a3a6b; font-size: 24px; margin-bottom: 20px;">이메일 인증</h1>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          West Lafayette Korea 회원가입을 환영합니다!<br>
          아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
        </p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; background: #1a3a6b; color: white; padding: 15px 40px; 
                    text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500;">
            이메일 인증하기
          </a>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 30px;">
          버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
          <a href="${verificationUrl}" style="color: #1a3a6b; word-break: break-all;">${verificationUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          이 메일은 자동으로 발송되었습니다. 문의: support@wlkorea.com
        </p>
      </div>
    `,
  });
}

// 비밀번호 재설정 메일 발송
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await getResend().emails.send({
    from: `West Lafayette Korea <${FROM_EMAIL}>`,
    to: email,
    subject: '[West Lafayette Korea] 비밀번호 재설정',
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1a3a6b; font-size: 24px; margin-bottom: 20px;">비밀번호 재설정</h1>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          비밀번호 재설정을 요청하셨습니다.<br>
          아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
        </p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: #1a3a6b; color: white; padding: 15px 40px; 
                    text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500;">
            비밀번호 재설정하기
          </a>
        </div>
        <p style="color: #e74c3c; font-size: 14px; line-height: 1.5; margin-top: 20px;">
          <strong>주의:</strong> 이 링크는 1시간 후에 만료됩니다.
        </p>
        <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 30px;">
          비밀번호 재설정을 요청하지 않으셨다면, 이 메일을 무시하셔도 됩니다.<br>
          버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
          <a href="${resetUrl}" style="color: #1a3a6b; word-break: break-all;">${resetUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          이 메일은 자동으로 발송되었습니다. 문의: support@wlkorea.com
        </p>
      </div>
    `,
  });
}
