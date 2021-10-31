import { useEffect, useState } from 'react'
import {
    DotsCircleHorizontalIcon,
    HeartIcon,
    ChatIcon,
    PaperAirplaneIcon,
    BookmarkIcon,
    EmojiHappyIcon,
} from '@heroicons/react/outline'
import {
    HeartIcon as HeartIconFilled
} from '@heroicons/react/solid'
import { useSession } from 'next-auth/react'
import { 
    addDoc, 
    collection, 
    deleteDoc, 
    doc, 
    onSnapshot, 
    orderBy, 
    query, 
    serverTimestamp, 
    setDoc 
} from '@firebase/firestore'
import Moment from 'react-moment'
import { db } from '../firebase'

function Post({ props }) {
    const { data: session } = useSession();
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState([]);
    const [hasLiked, setHasLiked] = useState(false);
    
    useEffect(
        () =>
            onSnapshot(
                query(
                    collection(db, 'posts', props.id, 'comments'),
                    orderBy('timestamp', 'desc')
                ),
                snapshot => {
                    setComments(snapshot.docs);
                })
        , [db, props.id]
    );

    useEffect(
        () =>
            onSnapshot(
                collection(db, 'posts', props.id, 'likes'),
                snapshot => {
                    setLikes(snapshot.docs);
                })
        , [db, props.id]
    );

    useEffect(() => 
        setHasLiked(likes.findIndex(like => like.id === session.user.uid) !== -1), 
        [likes]
    );
    
    const likePost = async () => {
        if (hasLiked) {
            await deleteDoc(doc(db, 'posts', props.id, 'likes', session.user.uid));
        }
        else {
            await setDoc(doc(db, 'posts', props.id, 'likes', session.user.uid), {
                username: session.user.username
            });
        }
    }

    const sendComment = async (e) => {
        e.preventDefault();
        const commentToSend = comment;
        setComment('');

        await addDoc(collection(db, 'posts', props.id, 'comments'), {
            id: props.id,
            comment: commentToSend,
            username: session.user.username,
            userImage: session.user.image,
            timestamp: serverTimestamp()
        })
    }

    return (
        <div className="bg-white my-7 border rounded-sm">
            <div className="flex items-center p-5">
                {/* Header */}
                <img
                    className="rounded-full h-12 w-12 object-cover border p-1 mr-3"
                    src={props.profileImg}
                    alt={`header-post-id-${props.id}`}
                />
                <p className="flex-1 font-bold">{props.username}</p>
                <DotsCircleHorizontalIcon className="h-5" />
            </div>

            {/* Img */}
            <div>
                <img className="object-cover w-full" src={props.image} alt={`img-id-${props.id}`} />
            </div>

            {/* Button */}
            {session && (
                <div className="flex justify-between px-4 pt-4">
                    <div className="flex space-x-1">
                        {hasLiked ? (
                            <HeartIconFilled onClick={likePost} className="post-btn text-red-700" />
                        ) : (
                            <HeartIcon onClick={likePost} className="post-btn" />
                        )}
                        
                        <ChatIcon className="post-btn" />
                        <PaperAirplaneIcon className="post-btn" />
                    </div>

                    <BookmarkIcon className="post-btn" />
                </div>
            )}

            {/* Caption */}
            <p className="p-5 truncate">
                {likes.length > 0 && (
                    <p className="font-bold mb-1">{likes.length} {likes.length > 1 ? 'likes' : 'like'}</p>
                )}
                <span className="font-bold mr-1">{props.username}</span>
                {props.caption}
            </p>
            {/* Comments */}
            {comments.length > 0 && (
                <div className="ml-10 h-20 overflow-y-scroll scrollbar-thumb-black scrollbar-thin">
                    {comments.map((comment, i) => (
                        <div key={comment.id} className="flex items-center space-x-2 mb-3">
                            <img src={comment.data().userImage} className="h-7 rounded-full" alt="" />
                            <p className="text-sm flex-1">
                                <span className="font-bold pr-2">{comment.data().username}</span>
                                {comment.data().comment}
                            </p>
                            <Moment fromNow className="pr-5 text-xs">
                                {comment.data().timestamp?.toDate()}
                            </Moment>
                        </div>
                    ))}
                </div>
            )}
            {/* Input Box */}
            {session && (
                <form className="flex items-center p-4">
                    <EmojiHappyIcon className="h-7" />
                    <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        type="text"
                        placeholder="Add a comment..."
                        className="border-none flex-1 focus:ring-0 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!comment.trim()}
                        onClick={sendComment}
                        className="font-semibold text-blue-400"
                    >
                        Post
                    </button>
                </form>
            )}
        </div>
    )
}

export default Post
