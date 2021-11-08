import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, deleteDoc } from '@firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase'

function Suggestions() {
    const { data: session } = useSession();
    const [suggestions, setSuggestions] = useState([]);
    const [usersFollowing, setUsersFollowing] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => UpdateUsers(), []);

    useEffect(() => {
        onSnapshot(collection(db, 'users', session.user?.uid, 'usersFollowing'), snapshot => {
            setUsersFollowing(snapshot.docs);
        });
    }, [suggestions]);

    useEffect(() => {
        const CheckUserHasFollowed = () => {
            if (usersFollowing.length > 0) {
                var newSuggestions = [];
                suggestions.filter(userSuggestion => {
                    usersFollowing.filter(x => {
                        if (userSuggestion.data().uid != x.data().uid) {
                            newSuggestions.push(userSuggestion);
                        }
                    })
                });
                if (newSuggestions.length > 0)  setSuggestions(newSuggestions);
            }
        }
        CheckUserHasFollowed();
        return () => CheckUserHasFollowed();
    }, [usersFollowing]);

    const UpdateUsers = async () => {
        onSnapshot(query(collection(db, 'users'), orderBy('timestamp', 'desc')), snapshot => {
            setSuggestions(snapshot.docs);
        });
    }

    const AddFollow = async (profile, index) => {
        setIsFollowing(true);
        document.getElementById(`follow-id-${index}`).innerHTML = 'Following';
        if (suggestions && suggestions.length > 0) {
            suggestions.filter(async user => {
                if (user.data().uid == profile.uid) {
                    await setDoc(
                        doc(
                            db,
                            'users',
                            session?.user?.uid,
                            'usersFollowing',
                            session?.user?.uid
                        ),
                        {
                            username: user.data().username,
                            uid: user.data().uid,
                            createdDate: serverTimestamp(),
                            status: 'following'
                        }
                    );
                }
            });
        }
    }

    return (
        <div className="mt-4 ml-10">
            <div className="flex justify-between text-sm mb-5">
                <h3 className="text-sm font-bold text-gray-400">Suggesstions for you</h3>
                <button className="text-gray-600 font-semibold">See All</button>
            </div>
            {suggestions.map((profile, i) => {
                if (i <= 4 && profile.data().uid != session?.user?.uid) {
                    return (
                        <div key={i} className="flex items-center justify-between mt-3">
                            <img
                                className="w-10 h-10 rounded-full border p-[2px]"
                                src={profile.data().userImage}
                                alt=""
                            />

                            <div className="flex-1 ml-4">
                                <h2 className="font-semibold text-sm">{profile.data().username}</h2>
                                <h3 className="text-xs text-gray-400">People you may know</h3>
                            </div>

                            <button className="text-blue-400 text-sm" id={`follow-id-${i}`} onClick={() => AddFollow(profile.data(), i)}>
                                Follow
                            </button>
                        </div>
                    )
                }
            })}
        </div>
    )
}

export default Suggestions
