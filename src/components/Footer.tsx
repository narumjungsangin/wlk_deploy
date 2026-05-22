import Link from 'next/link';
import LogoImage from '@/components/LogoImage';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="mb-3">
              <LogoImage width={140} height={44} className="h-10 w-auto" invert />
            </div>
            <p className="text-xs leading-relaxed">
              인디애나주 웨스트 라파예트 한인 커뮤니티 사이트입니다.
            </p>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3">게시판</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/info" className="hover:text-white transition-colors">
                  정보나눔터
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-white transition-colors">
                  직거래마당
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  Job &amp; Work
                </Link>
              </li>
              <li>
                <Link href="/housing" className="hover:text-white transition-colors">
                  Housing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3">사이트 정보</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-xs text-center">
          © {new Date().getFullYear()} West Lafayette Korea. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
