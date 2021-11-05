import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Feed from '../components/Feed'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { collection, doc, getDoc, onSnapshot, query } from '@firebase/firestore'
import { db } from '../firebase'
import { LoginState } from '../atoms/modalAtom'
import { useRecoilState } from 'recoil'
import Loading from '../components/common/Loading'
import ConfirmDialog from '../components/common/ConfirmDialog'

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(LoginState);
  const [users, setUsers] = useState([]);

  useEffect(
    () => setTimeout(() => {
      CheckUserLogin()
    }, 1000), [isLoggedIn, db]
  )

  const CheckUserLogin = async () => {
    const docRef = doc(db, "tokens", 'login');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        if (docSnap.data().token && !isLoggedIn) setIsLoggedIn(true);
        // if (!isLoggedIn) router.push('/auth/signin');
      }
      else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        router.push('/auth/signin');
      }
  }

  return (
    <div className="bg-gray-50 h-screen overflow-y-scroll">
      {/* <Head>
        <title>Mipu 2.0</title>
        <link rel="icon" href="/favicon.ico" />
      </Head> */}
      {isLoggedIn && (
        <>
          <Header />
          <Feed />
          {/* Modal */}
          <Modal />
          
          <ConfirmDialog
                title="Confirm"
                content="Are you sure you want to delete this post?"
                textCancel="Cancel"
                textOk="Yes"
          />
        </>
      )}

      {!isLoggedIn && (<Loading />)}
    </div>
  )
}
