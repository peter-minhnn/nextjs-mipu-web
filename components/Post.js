import { useEffect, useRef, useState, Fragment, useCallback } from 'react'
import {
    DotsHorizontalIcon,
    HeartIcon,
    ChatIcon,
    PaperAirplaneIcon,
    BookmarkIcon,
    EmojiHappyIcon,
} from '@heroicons/react/outline'
import {
    HeartIcon as HeartIconFilled,
    ChevronDownIcon
} from '@heroicons/react/solid'
import { useSession } from 'next-auth/react'
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    where
} from '@firebase/firestore'
import Moment from 'react-moment'
import { db } from '../firebase'
import { Menu, Transition } from '@headlessui/react'
import { deleteObject, getStorage, ref } from '@firebase/storage'
import dynamic from 'next/dynamic'
import { ModalConfirmState, ModalConfirmButtonState } from '../atoms/modalAtom'
import { useRecoilState } from 'recoil'
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

function Post({ props }) {
    const { data: session } = useSession();
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState([]);
    const [hasLiked, setHasLiked] = useState(false);
    const [openEmoji, setOpenEmoji] = useState(false);
    const [users, setUsers] = useState([]);
    const [openDialogConfirm, setOpenDialogConfirm] = useRecoilState(ModalConfirmState);
    const [confirmButton, setConfirmButton] = useRecoilState(ModalConfirmButtonState);
    const commentRef = useRef(null);

    //Get comments by posts
    useEffect(
        () => {
            if (props?.id) {
                onSnapshot(
                    query(
                        collection(db, 'posts', props.id, 'comments'),
                        orderBy('timestamp', 'desc')
                    ),
                    snapshot => {
                        setComments(snapshot.docs);
                    }
                )

                onSnapshot(collection(db, 'posts', props.id, 'likes'), snapshot => {
                    setLikes(snapshot.docs);
                });

                onSnapshot(query(collection(db, 'users'), orderBy('timestamp', 'desc')), snapshot => {
                    setUsers(snapshot.docs);
                });
            }
        }
        , [db, props.id]
    );

    //Get user's post has liked
    useEffect(() => setHasLiked(likes.findIndex(like => like.id === session?.user?.uid) !== -1), [likes])

    //Initialize liked by users
    useEffect(() => GetLikes(), [likes, users]);

    // useEffect(() => {
    //     if (confirmButton) DeletePost();
    // }, [db, props.id, confirmButton]);

    //Function get user's like
    const GetLikes = () => {
        if (likes.length > 0 && users.length > 0) {
            var html = '', imageHtml = '';
            if (likes.length === 1) {
                imageHtml = '';
                document.getElementById(`image-list_${props.id}`).innerHTML = '';
                likes.map((like, i) => {
                    users.map((user, i) => {
                        if (user.data().uid === like.data().uid) {
                            html = `<img src="${user.data().userImage}" class="h-5 w-5 rounded-full" alt="user-image" crossOrigin="Anonymous"/>
                            <p class="pl-2">Liked by <strong>
                                   <a href="javascript:void(0);" class="no-underline">${like.data().username}</a></strong>
                            </p>`
                            document.getElementById(`likes_${props.id}`).innerHTML = html;
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
                            imageHtml += `<img src="${like.data().userImage}" class="h-6 w-6 rounded-full absolute left-0 z-10 border border-white" alt="user-image" crossOrigin="Anonymous"/>`;
                        }
                        if (user.data().uid === like.data().uid && like.data().uid !== session?.user.uid) {
                            countImages++
                            if (countImages < 2) imageHtml += `<img src="${like.data().userImage}" class="h-6 w-6 rounded-full absolute left-[15px] z-0 border border-white" alt="user-image" crossOrigin="Anonymous"/>`;
                        }
                        if (like.data().username === session?.user.username) {
                            html = '';
                            html = `<p class="pl-11">Liked by <strong>
                                    <a href="javascript:void(0);" class="no-underline">${like.data().username}</a></strong>
                                </p>`;
                        }
                    });
                });

                likes.map((like, i) => {
                    users.map((user) => {
                        if (user.data().uid === like.data().uid && like.data().uid !== session?.user.uid) {
                            if (i == 0) {
                                imageHtml += `<img src="${like.data().userImage}" class="h-6 w-6 rounded-full absolute left-0 z-0 border border-white" alt="user-image" crossOrigin="Anonymous"/>`;
                            }
                            if (i == 1) {
                                imageHtml += `<img src="${like.data().userImage}" class="h-6 w-6 rounded-full absolute left-[15px] z-0 border border-white" alt="user-image" crossOrigin="Anonymous"/>`;
                            }
                        }

                        if (like.data().username !== session?.user.username) {
                            if (!html) {
                                html = `<p class="pl-11">Liked by <strong>
                                            <a href="javascript:void(0);" class="no-underline">${like.data().username}</a></strong>
                                        </p>`;
                            }
                        }
                    });
                });

                html += `<p class="pl-2">and <strong>
                            <a href="javascript:void(0);" class="no-underline">${(likes.length - 1) > 1 ? `${(likes.length - 1)} others` : `${(likes.length - 1)} other`}</a></strong>
                        </p>`;
                document.getElementById(`image-list_${props.id}`).innerHTML = imageHtml;
                document.getElementById(`likes_${props.id}`).innerHTML = html;
            }
        }
    }

    //Save or delete like button
    const likePost = async () => {
        if (hasLiked) {
            await deleteDoc(doc(db, 'posts', props.id, 'likes', session?.user?.uid));
        }
        else {
            await setDoc(doc(db, 'posts', props.id, 'likes', session?.user?.uid), {
                username: session.user.username,
                userImage: session.user.image,
                uid: session?.user?.uid,
                postId: props.id
            });
        }
    }

    //Save comment to firestore
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

    //Open emoji comment
    const OnEmojiClick = (event, emojiObject) => {
        commentRef.current.value += emojiObject.emoji;
        setComment(commentRef.current.value);
        setOpenEmoji(false);
    };

    // Delete post by user
    const DeletePost = async () => {
        await deleteDoc(doc(db, 'posts', props.id)).then(async res => {
            console.log('Deleted Post Successfully', res);
            const storage = getStorage();
            //Delete likes 
            if (likes.length > 0) await deleteDoc(doc(db, `posts/${props.id}/likes`, props.uid));
            //Delete comments 
            if (comments.length > 0) await deleteDoc(doc(db, `posts/${props.id}/comments`, props.uid));
            
            // Create a reference to the file to delete
            const imageRef = ref(storage, `posts/${props.id}/image`);

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
        <div className="bg-white my-7 border rounded-sm">
            <div className="flex items-center p-5">
                {/* Header */}
                <img
                    className="rounded-full h-12 w-12 object-cover border p-1 mr-3"
                    src={props.profileImg}
                    alt={`header-post-id-${props.id}`}
                />
                <p className="flex-1 font-bold">{props.username}</p>
                <Menu as="div" className="relative">
                    <Menu.Button className="bg-transparent text-black">
                        <DotsHorizontalIcon className="h-5 cursor-pointer" aria-hidden="true" />
                    </Menu.Button>
                    {(props.uid == session?.user?.uid) && (
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
                                                className={`${active ? 'bg-gray-100 text-black' : 'text-gray-900'
                                                    } group flex rounded-md justify-center items-center w-full px-2 py-2 text-sm`}
                                            >
                                                Go to post
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    )}
                    {MenuPost(props.uid)}
                </Menu>
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
            <div className="p-5 truncate">
                {likes.length > 0 && (
                    <div className="flex flex-row items-center pb-2 relative">
                        <div id={`image-list_${props.id}`} className="flex items-center flex-row-reverse"></div>
                        <div id={`likes_${props.id}`} className="flex items-center"></div>
                    </div>
                )}
                <span className="font-bold mr-1">{props.username}</span>
                {props.caption}
            </div>
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

            {/* Created post time */}
            <div className="pl-5 pb-2">
                <Moment fromNow className="text-sm text-gray-500">
                    {props.timestamp?.toDate()}
                </Moment>
            </div>

            {/* Input Box */}
            {session && (
                <form className="relative flex items-center p-4">
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
