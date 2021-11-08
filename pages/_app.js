import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { RecoilRoot } from 'recoil'
import "nprogress/nprogress.css";
import dynamic from 'next/dynamic';

const TopProgressBar = dynamic(
  () => {
    return import("../components/common/TopProgressBar");
  },
  { ssr: false },
);

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    return (
        <SessionProvider session={session}>
            <RecoilRoot>
                <TopProgressBar />
                <Component {...pageProps} />
            </RecoilRoot>
        </SessionProvider>
    )
}

export default MyApp
