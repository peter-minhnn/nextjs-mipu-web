import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Feed from '../components/Feed'
import Header from '../components/Header'
import Modal from '../components/Modal'

export default function Home() {
  const router = useRouter();

  useEffect(
    () => {
      const login_provider = localStorage.getItem('login_provider');
      if (!login_provider) {
        return router.push('/auth/signin');
      }
    }, []
  )

  return (
    <div className="bg-gray-50 h-screen overflow-y-scroll">
      <Head>
        <title>Mipu 2.0</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Feed />
      {/* Modal */}
      <Modal />
    </div>
  )
}
