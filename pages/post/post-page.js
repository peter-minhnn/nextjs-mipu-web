import { collection, onSnapshot, orderBy, query, doc, addDoc, deleteDoc, serverTimestamp, setDoc, updateDoc } from '@firebase/firestore'
import { Menu, Transition } from '@headlessui/react'
import { BookmarkIcon, ChatIcon, DotsHorizontalIcon, EmojiHappyIcon, HeartIcon, PaperAirplaneIcon } from '@heroicons/react/outline'
import { HeartIcon as HeartIconFilled } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useRef, useState, useMemo } from 'react'
import Moment from 'react-moment'
import Header from '../../components/Header'
import { db } from '../../firebase'
import { deleteObject, getStorage, ref } from '@firebase/storage'
import router from 'next/router'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { useRecoilState, useRecoilTransactionObserver_UNSTABLE } from 'recoil'
import { PostPageState } from '../../atoms/modalAtom'
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

function PostPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState([]);
    const [likesComment, setLikesComment] = useState([]);
    const [hasLiked, setHasLiked] = useState(false);
    const [hasLikedComment, setHasLikedComment] = useState(false);
    const [openEmoji, setOpenEmoji] = useState(false);
    const [users, setUsers] = useState([]);
    const [postPageData, setPostPageData] = useRecoilState(PostPageState);
    const commentRef = useRef(null);

    //Get comments by posts
    useEffect(
        () => {
            if (Object.keys(postPageData).length == 0) {
                var id = localStorage.getItem('post-id');
                if (localStorage.getItem(`post-${id}`)) {
                    setPostPageData(JSON.parse(localStorage.getItem(`post-${id.toString()}`)))
                }
            }
            if (postPageData?.id) {
                onSnapshot(
                    query(
                        collection(db, 'posts', postPageData.id, 'comments'),
                        orderBy('timestamp', 'asc')
                    ),
                    snapshot => {
                        setComments(snapshot.docs);
                        //GetLikesComment();
                    }
                )

                onSnapshot(collection(db, 'posts', postPageData.id, 'likes'), snapshot => {
                    setLikes(snapshot.docs);
                    if (likes.length > 0) setHasLiked(likes.findIndex(like => like.id === session?.user?.uid) !== -1)
                });

                onSnapshot(query(collection(db, 'users'), orderBy('timestamp', 'desc')), snapshot => {
                    setUsers(snapshot.docs);
                });
            }
        }
        , [db, postPageData?.id, session]
    );

    //Get user's post has liked
    // useEffect(() => setHasLiked(likes.findIndex(like => like.id === session?.user?.uid) !== -1), [likes])

    //Initialize liked by users
    useEffect(() => GetLikes(), [likes, users]);

    // useEffect(() => {
    //     const GetLikesComment = () => {
    //         if (comments.length > 0) {
    //             comments.map(comment => {
    //                 onSnapshot(collection(db, 'posts', postPageData.id, 'comments', comment.data().commentId, 'likesComment'), snapshot => {
    //                     setLikesComment(snapshot.docs);
    //                 });
    //             })
    //         }
    //     }
    //     GetLikesComment();
    //     return () => GetLikesComment();
    // }, [db, postPageData.id, comments]);

    useEffect(() => likesComment.length > 0 && setHasLikedComment(likesComment.findIndex(likeComment => likeComment.id === session?.user?.uid) !== -1), [likesComment])
    const GetLikesComment = () => {
        if (comments.length > 0) {
            comments.map(comment => {
                onSnapshot(collection(db, 'posts', postPageData.id, 'comments', comment.data().commentId, 'likesComment'), snapshot => {
                    setLikesComment(snapshot.docs);
                    if (likesComment.length > 0) setHasLikedComment(likesComment.findIndex(likeComment => likeComment.id === session?.user?.uid) !== -1)
                });
            })
        }
    }
    //Save or delete like button
    const LikePost = async () => {
        if (hasLiked) {
            await deleteDoc(doc(db, 'posts', postPageData.id, 'likes', session?.user?.uid));
        }
        else {
            await setDoc(doc(db, 'posts', postPageData.id, 'likes', session?.user?.uid), {
                username: session.user.username,
                userImage: session.user.image,
                uid: session?.user?.uid,
                postId: postPageData.id
            });
        }
    }

    //Save comment to firestore
    const SendComment = async (e) => {
        e.preventDefault();
        const commentToSend = comment;
        setComment('');

        const docRef = await addDoc(collection(db, 'posts', postPageData.id, 'comments'), {
            id: postPageData.id,
            comment: commentToSend,
            username: session.user.username,
            userImage: session.user.image,
            timestamp: serverTimestamp()
        })
        await updateDoc(doc(db, 'posts', postPageData.id, 'comments', docRef.id), {
            commentId: docRef.id
        });
    }

    //Open emoji comment
    const OnEmojiClick = (event, emojiObject) => {
        commentRef.current.value += emojiObject.emoji;
        setComment(commentRef.current.value);
        setOpenEmoji(false);
    };

    // Delete post by user
    const DeletePost = async () => {
        await deleteDoc(doc(db, 'posts', postPageData.id)).then(async res => {
            console.log('Deleted Post Successfully', res);
            const storage = getStorage();
            //Delete likes 
            if (likes.length > 0) await deleteDoc(doc(db, `posts/${postPageData.id}/likes`, postPageData.uid));
            //Delete comments 
            if (comments.length > 0) await deleteDoc(doc(db, `posts/${postPageData.id}/comments`, postPageData.uid));

            // Create a reference to the file to delete
            const imageRef = ref(storage, `posts/${postPageData.id}/image`);

            // Delete the file
            await deleteObject(imageRef).then(() => {
                // File deleted successfully
                console.log('Deleted Image Storage Successfully', res);
            }).catch((error) => {
                // Uh-oh, an error occurred!
                console.log('Deleted Image Storage Failed: ', error.message);
            });
        }).catch(error => {
            console.log('Deleted Post Failed: ', error.message);
        });
    }

    const LikeComment = async (comment) => {
        if (hasLikedComment) {
            await deleteDoc(doc(db, 'posts', postPageData.id, 'comments', comment.data().commentId, 'likesComment', session?.user?.uid));
        }
        else {
            await setDoc(
                doc(
                    db,
                    'posts',
                    postPageData.id,
                    'comments',
                    comment.data().commentId,
                    'likesComment',
                    session?.user?.uid
                ),
                {
                    username: session.user.username,
                    userImage: session.user.image,
                    uid: session?.user?.uid,
                    postId: postPageData.id,
                    commentId: comment.data().commentId
                }
            );
        }
    }

    const ReplyComment = () => {

    }

    //Function get user's like
    const GetLikes = () => {
        if (likes.length > 0 && users.length > 0) {
            var html = '', imageHtml = '';
            if (likes.length === 1) {
                imageHtml = '';
                document.getElementById(`image-list_${postPageData.id}`).innerHTML = '';
                likes.map((like, i) => {
                    users.map((user, i) => {
                        if (user.data().uid === like.data().uid) {
                            html = `<img src="${user.data().userImage}" class="h-5 w-5 rounded-full" alt="user-image" />
                            <p class="pl-2">Liked by <strong>
                                   <a href="javascript:void(0);" class="no-underline">${like.data().username}</a></strong>
                            </p>`
                            document.getElementById(`likes_${postPageData.id}`).innerHTML = html;
                        }
                    })
                });
            }
            else {
                html = '';
                let sessionIdx = 0;
                let countImages = 0;
                likes.map((like, i) => {
                    users.map((user) => {
                        if (like.data().uid === session?.user.uid) {
                            sessionIdx++;
                            countImages++;
                            imageHtml += `<img src="${like.data().userImage}" class="h-6 w-6 rounded-full absolute left-0 z-10 border border-white" alt="user-image" />`;
                        }
                        if (user.data().uid === like.data().uid && like.data().uid !== session?.user.uid) {
                            countImages++
                            if (countImages < 2) imageHtml += `<img src="${like.data().userImage}" class="h-6 w-6 rounded-full absolute left-[15px] z-0 border border-white" alt="user-image" />`;
                        }
                        if (like.data().username === session?.user.username) {
                            html = '';
                            html = `<p class="pl-11 text-xs">Liked by <strong>
                                    <a href="javascript:void(0);" class="no-underline text-xs">${like.data().username}</a></strong>
                                </p>`;
                        }
                    });
                });

                likes.map((like, i) => {
                    users.map((user) => {
                        if (user.data().uid === like.data().uid && like.data().uid !== session?.user.uid) {
                            if (i == 0) {
                                imageHtml += `<img src="${like.data().userImage}" class="h-6 w-6 rounded-full absolute left-0 z-0 border border-white" alt="user-image" />`;
                            }
                            if (i == 1) {
                                imageHtml += `<img src="${like.data().userImage}" class="h-6 w-6 rounded-full absolute left-[15px] z-0 border border-white" alt="user-image" />`;
                            }
                        }

                        if (like.data().username !== session?.user.username) {
                            if (!html) {
                                html = `<p class="pl-11 text-xs">Liked by <strong>
                                            <a href="javascript:void(0);" class="no-underline">${like.data().username}</a></strong>
                                        </p>`;
                            }
                        }
                    });
                });

                html += `<p class="pl-2 text-xs">and <strong>
                            <a href="javascript:void(0);" class="no-underline text-xs">${(likes.length - 1) > 1 ? `${(likes.length - 1)} others` : `${(likes.length - 1)} other`}</a></strong>
                        </p>`;
                document.getElementById(`image-list_${postPageData.id}`).innerHTML = imageHtml;
                document.getElementById(`likes_${postPageData.id}`).innerHTML = html;
            }
        }
    }

    //Menu function of post
    const MenuPost = (id) => {
        return (
            <>
                {(id != session?.user?.uid) && (
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-1 py-1 ">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            className={`${active ? 'bg-gray-100 text-black' : 'text-red-600'
                                                } group flex rounded-md justify-center items-center w-full px-2 py-2 text-sm`}
                                        >
                                            Unfollow
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                            <div className="px-1 py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            className={`${active ? 'bg-gray-100 text-black' : 'text-gray-900'
                                                } group flex rounded-md justify-center items-center w-full px-2 py-2 text-sm`}
                                        >
                                            Go to post
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                            <div className="px-1 py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            className={`${active ? 'bg-gray-100 text-black' : 'text-gray-900'
                                                } group flex rounded-md justify-center items-center w-full px-2 py-2 text-sm`}
                                        >
                                            Copy link
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                )}
            </>
        )
    }

    return (
        <>
            <Header />
            <main className="max-w-3xl mx-auto m-5 h-[82vh] lg:overflow-hidden">
                <section className="flex flex-row h-full border border-gray-300 post-page overflow-hidden">
                    <div className="w-full h-auto bg-black flex items-center">
                        <img className="object-contain" src={postPageData.image} alt="" style={{ height: 'inherit' }} />
                    </div>

                    <div className="w-[79%] h-full relative post-page__left">
                        <div className="flex items-center p-2 post-page__left--header">
                            <img
                                className="rounded-full w-12 object-cover border p-1 mr-3"
                                src={postPageData.profileImg}
                                alt={`header-post-id-${postPageData.id}`}
                            />
                            <p className="flex-1 font-bold">{postPageData.username}</p>
                            <Menu as="div" className="relative flex items-center">
                                <Menu.Button className="bg-transparent text-black">
                                    <DotsHorizontalIcon className="h-5 cursor-pointer pr-2" aria-hidden="true" />
                                </Menu.Button>
                                {(postPageData.uid == session?.user?.uid) && (
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 w-56 mt-32 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="px-1 py-1 ">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            type="button"
                                                            className={`${active ? 'bg-gray-100 text-black' : 'text-gray-900'} group flex rounded-md justify-center items-center w-full px-2 py-2 text-sm`}
                                                            onClick={DeletePost}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                            <div className="px-1 py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            type="button"
                                                            className={`${active ? 'bg-gray-100 text-black' : 'text-gray-900'} group flex rounded-md justify-center items-center w-full px-2 py-2 text-sm`}

                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                )}
                                {MenuPost(postPageData.uid)}
                            </Menu>
                        </div>

                        {/* Comments */}
                        {comments.length == 0 && (
                            <div className="post-page__comments pl-5 pt-5 overflow-auto scrollbar-thumb-white scrollbar-thin scrollbar-hide">
                                {/* Caption */}
                                <div className="flex flex-col pb-5 truncate">
                                    <div className="flex">
                                        <img src={postPageData.profileImg} className="h-7 w-7 rounded-full" alt="" />
                                        <span className="font-bold mr-1 pl-4">{postPageData.username}</span>
                                        {postPageData.caption}
                                    </div>
                                    <div className="flex pl-12 items-center pt-4 w-full">
                                        {postPageData.id && (
                                            <Moment fromNow className="text-sm text-gray-500">
                                                {postPageData.timestamp}
                                            </Moment>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {comments.length > 0 && (
                            <div className="post-page__comments pl-5 pt-5 overflow-auto scrollbar-thumb-white scrollbar-thin scrollbar-hide">
                                {/* Caption */}
                                <div className="flex flex-col pb-5 truncate">
                                    <div className="flex">
                                        <img src={postPageData.profileImg} className="h-7 w-7 rounded-full" alt="" />
                                        <span className="font-bold mr-1 pl-4">{postPageData.username}</span>
                                        {postPageData.caption}
                                    </div>
                                    <div className="flex pl-12 items-center pt-4 w-full">
                                        {postPageData.id && (
                                            <Moment fromNow className="text-sm text-gray-500">
                                                {postPageData.timestamp}
                                            </Moment>
                                        )}
                                    </div>
                                </div>
                                {comments.map((comment, i) => (
                                    <div key={comment.id} className="flex flex-col mb-5">
                                        <div className="flex items-center space-x-5">
                                            <img src={comment.data().userImage} className="h-7 rounded-full" alt="" />
                                            <p className="text-sm flex-1">
                                                <span className="font-bold pr-2">{comment.data().username}</span>
                                                {comment.data().comment}
                                            </p>
                                            {hasLikedComment ? (
                                                <HeartIconFilled onClick={() => { LikeComment(comment); }} className="like-comment-heart text-red-700" />
                                            ) : (
                                                <HeartIcon onClick={() => { LikeComment(comment); }} className="like-comment-heart" />
                                            )}
                                        </div>
                                        <div className="flex pl-12 items-center pt-4 w-full">
                                            <Moment fromNow className="text-xs post-page__comments--controls">
                                                {comment.data().timestamp?.toDate()}
                                            </Moment>
                                            <span className="post-page__comments--controls pl-4 cursor-pointer">
                                                {likesComment.length > 0 ? `${likesComment.length == 1 ? `${likesComment.length} Like` : `${likesComment.length} Likes`}` : 'Like'}
                                            </span>
                                            <span className="post-page__comments--controls pl-2 cursor-pointer" onClick={ReplyComment}>Reply</span>
                                            <div className="flex items-center pl-2 cursor-pointer hover-dot-trigger w-6 h-3"><DotsHorizontalIcon className="w-4 h-4 hover-dot-target" /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="absolute bottom-0 w-full post-page__bottom bg-white">
                            {/* Button */}
                            {session && (
                                <div className="flex justify-between px-4 pt-3">
                                    <div className="flex space-x-1">
                                        {hasLiked ? (
                                            <HeartIconFilled onClick={LikePost} className="post-btn text-red-700" />
                                        ) : (
                                            <HeartIcon onClick={LikePost} className="post-btn" />
                                        )}

                                        <ChatIcon className="post-btn" />
                                        <PaperAirplaneIcon className="post-btn" />
                                    </div>

                                    <BookmarkIcon className="post-btn" />
                                </div>
                            )}
                            {/* Likes */}
                            <div className="pl-5 pb-1 pt-3 truncate">
                                {likes.length > 0 && (
                                    <div className="flex flex-row items-center pb-2 relative">
                                        <div id={`image-list_${postPageData.id}`} className="flex items-center flex-row-reverse"></div>
                                        <div id={`likes_${postPageData.id}`} className="flex items-center"></div>
                                    </div>
                                )}

                            </div>
                            {/* Created post time */}
                            <div className="pl-5 pb-2">
                                {postPageData.id && (
                                    <Moment fromNow className="text-sm text-gray-500">
                                        {postPageData.timestamp}
                                    </Moment>
                                )}
                            </div>

                            {/* Input Box */}
                            {session && (
                                <form className="relative flex items-center p-2 post-page__comments--input">
                                    <div className={`${(!openEmoji && `hidden`)} absolute -top-80 z-20 select-none`}>
                                        <Picker
                                            onEmojiClick={OnEmojiClick}
                                            disableAutoFocus={true}
                                            groupNames={{ smileys_people: "PEOPLE" }}
                                            native
                                        />
                                    </div>
                                    <EmojiHappyIcon className="h-7 cursor-pointer hover:scale-110" onClick={() => setOpenEmoji(openEmoji ? false : true)} />
                                    <input
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        type="text"
                                        placeholder="Add a comment..."
                                        className="border-none flex-1 focus:ring-0 outline-none"
                                        ref={commentRef}
                                        onFocus={() => setOpenEmoji(false)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!comment}
                                        onClick={SendComment}
                                        className="font-semibold text-blue-400"
                                    >
                                        Post
                                    </button>
                                </form>
                            )}
                        </div>

                    </div>
                </section>
            </main>
        </>
    )
}

export default PostPage
