import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from '@firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase'

function Suggestions() {
    const { data: session } = useSession();
    const [docRefId, setDocRefId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        return UpdateUsers();
    }, []);

    const UpdateUsers = async () => {
        //localStorage.setItem('login_provider', JSON.stringify(session?.user.uid));

        onSnapshot(query(collection(db, 'users'), orderBy('timestamp', 'desc')), snapshot => {
            setSuggestions(snapshot.docs);
        });

        // if (suggestions.length > 0) {
        //     suggestions.filter(async (profile, i) => {
        //         if (profile.data().uid != session?.user.uid) {
        //             await setDoc(doc(db, 'users', session?.user.uid), {
        //                 email: session?.user?.email,
        //                 username: session?.user?.username,
        //                 userImage: session?.user?.image,
        //                 uid: session?.user.uid,
        //                 timestamp: serverTimestamp()
        //             });
        //         }              
        //     })
        // }
        // else {
        //     await setDoc(doc(db, 'users', session?.user.uid), {
        //         email: session?.user?.email,
        //         username: session?.user?.username,
        //         userImage: session?.user?.image,
        //         uid: session?.user.uid,
        //         timestamp: serverTimestamp()
        //     });
        // }
    }

    return (
        <div className="mt-4 ml-10">
            <div className="flex justify-between text-sm mb-5">
                <h3 className="text-sm font-bold text-gray-400">Suggesstions for you</h3>
                <button className="text-gray-600 font-semibold">See All</button>
            </div>
            {suggestions.map((profile, i) => {
                if (i <= 5 && profile.data().uid != session?.user?.uid) {
                    return (
                        <div key={i} className="flex items-center justify-between mt-3">
                            <img
                                className="w-10 h-10 rounded-full border p-[2px]"
                                src={profile.data().userImage}
                                alt=""
                            />

                            <div className="flex-1 ml-4">
                                <h2 className="font-semibold text-sm">{profile.data().username}</h2>
                                {/* <h3 className="text-xs text-gray-400">Work at {profile.company.name}</h3> */}
                            </div>

                            <button className="text-blue-400 text-sm">Follow</button>
                        </div>
                    )
                }
            })}
        </div>
    )
}

export default Suggestions
