import { signOut, useSession } from 'next-auth/react'
import { doc, deleteDoc } from "@firebase/firestore";
import { db } from "../firebase";
import { useRecoilState } from 'recoil';
import { LoginState } from '../atoms/modalAtom';

function MiniProfile() {
    const { data: session } = useSession();
    const [isLoggedIn, setIsLoggedIn] = useRecoilState(LoginState);

    const SignOut = async () => {
        await deleteDoc(doc(db, 'tokens', 'login')).then(async res => {
            setIsLoggedIn(false);
            await signOut()
        });
    }

    return (
        <div className="flex items-center justify-between mt-14 ml-10">
            <img
                className="w-16 h-16 rounded-full border p-[2px]"
                src={session?.user?.image}
                alt="mini-profile-img"
            />
            <div className="flex-1 mx-4">
                <h2 className="font-bold">{session?.user?.username}</h2>
                <h3 className="text-sm text-gray-400">Welcome to Mipu Social</h3>
            </div>
            <button
                onClick={SignOut}
                className="text-blue-400 text-sm font-semibold">Sign out</button>
        </div>
    )
}

export default MiniProfile
