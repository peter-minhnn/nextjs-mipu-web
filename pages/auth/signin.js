import { signIn as SignInProvider, getProviders, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function signIn({ providers }) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const login_provider = localStorage.getItem('login_provider');
        if (login_provider) {
            setIsLoggedIn(true);
            return router.push('/');
        }
        else setIsLoggedIn(false);
    }, [isLoggedIn]);

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
                                        localStorage.setItem('login_provider', JSON.stringify(provider.id));
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
