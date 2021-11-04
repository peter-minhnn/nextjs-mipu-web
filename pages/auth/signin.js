import { collection, doc, getDoc, onSnapshot, query } from '@firebase/firestore';
import { signIn as SignInProvider, getProviders } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil';
import { LoginState } from '../../atoms/modalAtom';
import { db } from '../../firebase';

function signIn({ providers }) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useRecoilState(LoginState);

    useEffect(
        () => {
            let checkSwitchLogIn = localStorage.getItem('switch-accounts');
            if (checkSwitchLogIn) {
                Object.values(providers).map((provider) => {
                    if (provider.name == 'Google') {
                        SignInProvider(provider.id, { callbackUrl: '/' });
                    }
                })
            }
            else CheckUserLogin();
        }, [isLoggedIn, db]
    )

    const CheckUserLogin = async () => {
        const docRef = doc(db, "tokens", 'login');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            if (docSnap.data().token && !isLoggedIn) {
                setIsLoggedIn(true);
                localStorage.removeItem('switch-accounts');
                router.push('/');
            }
        }
        else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            router.push('/auth/signin');
        }
    }

    return (
        <>
            {!isLoggedIn && (
                <div className="flex flex-col items-center justify-center min-h-screen py-2 px-14 text-center lg:-mt-20 md:-mt-2">
                    <Head>
                        <title>Mipu 2.0</title>
                        <link rel="icon" href="/favicon.ico" />
                    </Head>
                    <img className="w-60 object-contain" src="/assets/images/mipu-logo.png" alt="" />
                    <p className="font-xs italic">Choose OPTIONS for Sign In our website</p>
                    <div className="mt-24 w-80">
                        {Object.values(providers).map((provider) => (
                            <div key={provider.name}>
                                <button
                                    className="flex flex-row justify-center items-center p-2 w-full bg-white rounded-lg text-black border"
                                    onClick={() => {
                                        SignInProvider(provider.id, { callbackUrl: '/' })
                                    }}
                                >
                                    <img className="h-10 w-10 object-contain pr-2" src="https://developers.google.com/identity/images/g-logo.png" alt="google-signin-img" />
                                    Sign in with {provider.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export async function getServerSideProps() {
    const providers = await getProviders();

    return {
        props: {
            providers
        }
    }
}

export default signIn
