import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보취급방침 - West Lafayette Korea',
  description: 'West Lafayette Korea 개인정보취급방침',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보취급방침</h1>
      <p className="text-gray-600 mb-8">시행일: 2025년 10월 1일</p>

      <div className="bg-white border rounded-xl p-6 space-y-6 text-sm text-gray-700 leading-7">
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">1. 수집하는 개인정보 항목</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>회원 가입 시: 이름, 이메일 주소, 비밀번호</li>
            <li>문의·게시판 이용 시: 이름, 이메일, 작성한 내용</li>
            <li>서비스 이용 과정에서 자동 수집 정보: IP 주소, 쿠키, 브라우저 종류, 접속 일시</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">2. 개인정보의 수집 및 이용 목적</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>커뮤니티 운영 및 회원 관리</li>
            <li>문의·요청사항 응대</li>
            <li>정보 제공 및 소통</li>
            <li>서비스 개선 및 보안 관리</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">3. 개인정보의 보관 및 이용 기간</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>회원 탈퇴 시 즉시 삭제</li>
            <li>단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 안전하게 보관</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">4. 개인정보 제3자 제공</h2>
          <p>원칙적으로 제3자에게 제공하지 않음</p>
          <p>다만, 법령에 따른 요구가 있을 경우 예외적으로 제공될 수 있음</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">5. 개인정보 보호 조치</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>암호화된 비밀번호 저장</li>
            <li>접근 권한 제한</li>
            <li>보안 프로그램 설치 및 정기 점검</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">6. 이용자의 권리</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>개인정보 열람, 수정, 삭제, 처리정지 요청 가능</li>
            <li>요청은 이메일(support@wlafayettekorea.org)로 접수 가능</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">7. 개인정보관리 책임자</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>담당자: 웹사이트 운영팀</li>
            <li>이메일: support@wlafayettekorea.org</li>
          </ul>
        </section>

        <section>
          <p className="text-gray-600">본 정책은 2025년 10월 1일부터 시행됩니다.</p>
        </section>
      </div>
    </main>
  );
}
