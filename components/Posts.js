import { collection, onSnapshot, orderBy, query } from '@firebase/firestore'
import { useState, useEffect } from 'react'
import Post from './Post'
import { db } from '../firebase'
import { useSession } from 'next-auth/react';

function Posts() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState([]);
    const [usersFollowing, setUsersFollowing] = useState([]);

    useEffect(
        () => {
            onSnapshot(query(collection(db, 'posts'), orderBy('timestamp', 'desc')), snapshot => {
                setPosts(snapshot.docs);
            });
        }, [db]
    );

    useEffect(
        () => {
            onSnapshot(collection(db, 'users', session?.user?.uid, 'usersFollowing'), snapshot => {
                setUsersFollowing(snapshot.docs);
            });
        }, [db, posts]
    );

    useEffect(() => {
        const CheckUserHasFollowed = () => {
            if (usersFollowing.length > 0) {
                var newPostsData = [];
                posts.filter(post => {
                    let chekIdx = newPostsData.findIndex(x => x.data().id === post.data().id);
                    usersFollowing.filter(x => {
                        if (post.data().uid == x.data().uid && chekIdx == -1) {
                            newPostsData.push(post);
                        }
                        if (post.data().uid == session?.user?.uid && chekIdx == -1) {
                            newPostsData.push(post);
                        }
                    });
                });
                if (newPostsData.length > 0) setPosts(newPostsData);
            }
            else setPosts([]);
        }
        CheckUserHasFollowed();
        return () => CheckUserHasFollowed();
    }, [usersFollowing]);

    return (
        <div>
            {posts.length > 0 && posts.map((post, i) => (
                <Post
                    props={post.data()}
                    key={i}
                />
            ))}
        </div>
    )
}

export default Posts
