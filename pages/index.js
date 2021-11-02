import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Feed from '../components/Feed'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { collection, onSnapshot, orderBy, query } from '@firebase/firestore'
import { db } from '../firebase'

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(
    () => {
      const login_provider = localStorage.getItem('login_provider');

      onSnapshot(query(collection(db, 'users'), orderBy('timestamp', 'desc')), snapshot => {
        setUsers(snapshot.docs);
      });

      // if (users.length > 0 && login_provider) {
      //   const uid = JSON.parse(login_provider);
      //   users.map((user, i) => {
      //     if (user.data().uid === uid) setIsLoggedIn(true)
      //   });

      //   if (!isLoggedIn) return router.push('/auth/signin');
      // }
      // else {
      //   return router.push('/auth/signin');
      // }
      
      if (!login_provider) {
        return router.push('/auth/signin');
      } else setIsLoggedIn(true);
    }, []
  )

  return (
    <div className="bg-gray-50 h-screen overflow-y-scroll">
      <Head>
        <title>Mipu 2.0</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isLoggedIn && (
        <>
          <Header />
          <Feed />
          {/* Modal */}
          <Modal />
        </>
      )}
    </div>
  )
}
