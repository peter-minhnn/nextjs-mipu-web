import { collection, onSnapshot, orderBy, query } from '@firebase/firestore'
import { useState, useEffect } from 'react'
import Post from './Post'
import { db } from '../firebase'

function Posts() {
    const [posts, setPosts] = useState([]);

    useEffect(
        () =>
            onSnapshot(query(collection(db, 'posts'), orderBy('timestamp', 'desc')), snapshot => {
                setPosts(snapshot.docs);
            })
        , [db]
    );

    return (
        <div>
            {posts.map((post, i) => (
                <Post
                    props={post.data()}
                    key={i}
                />
            ))}
        </div>
    )
}

export default Posts
