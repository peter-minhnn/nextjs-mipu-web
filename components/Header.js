// lib
import Image from 'next/image'
// icons
import {
    BellIcon, ChatAltIcon, PlusCircleIcon, SearchIcon, UserGroupIcon,
    UserCircleIcon, BookmarkIcon, CogIcon, SwitchHorizontalIcon, LogoutIcon
} from '@heroicons/react/outline'
import { HomeIcon, MenuIcon } from '@heroicons/react/solid'
// images
import mipuLogo from '../public/assets/images/mipu-logo.png'
import iconLogoInstagram from '../public/assets/images/insta-logo-icon.png'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import { ModalState } from '../atoms/modalAtom'
import { useState } from 'react'

function Header() {
    const { data: session } = useSession();
    const [open, setOpen] = useRecoilState(ModalState);
    const [isOpenProfile, setIsOpenProfile] = useState(false);
    const router = useRouter();

    const openProfileMenu = () => {
        setIsOpenProfile(isOpenProfile ? false : true);
    }

    return (
        <div className="shadow-sm border-b bg-white sticky top-0 z-50">
            <div className="flex justify-between max-w-5xl xl:mx-auto">
                {/* Left */}
                <div onClick={() => router.push('/')} className="relative hidden lg:inline-grid lg:w-24 cursor-pointer">
                    <Image
                        src={mipuLogo}
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
                <div onClick={() => router.push('/')} className="relative w-20 lg:hidden flex-shrink-0 cursor-pointer">
                    <Image
                        src={mipuLogo}
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
                {/* Middle - Search input field */}
                <div className="max-w-xs">
                    <div className="relative mt-1 p-3 rounded-md w-64 ml-20">
                        <div className="absolute inset-y-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <input className="bg-gray-50 block w-full pl-10 sm:text-sm border-gray-300 focus:ring-black focus:border-black rounded-md" type="text" placeholder="Search" />
                    </div>
                </div>
                {/* Right */}
                {session ? (
                    <>
                        <div className="flex items-center justify-end space-x-5">
                            <HomeIcon onClick={() => router.push('/')} className="nav-groups-button" />
                            <MenuIcon className="h-6 w-10 md:hidden cursor-pointer" />
                            <ChatAltIcon className="nav-groups-button" />
                            <PlusCircleIcon onClick={() => setOpen(true)} className="nav-groups-button" />
                            <UserGroupIcon className="nav-groups-button" />
                            <div className="relative nav-groups-button">
                                <BellIcon className="nav-groups-button" />
                                <div className="absolute -top-2 -right-1 text-[0.85rem] w-5 h-5 bg-red-500 rounded-full flex justify-center animate-pulse text-white">3</div>
                            </div>
                            <div className="relative">
                                <img
                                    src={session?.user?.image ? session.user?.image : `/assets/images/user-icon.jpg`}
                                    alt="mipu-love"
                                    className={`h-10 w-10 rounded-full cursor-pointer p-1 border border-white ${isOpenProfile && 'border-black'}`}
                                    onClick={openProfileMenu}
                                />
                                {isOpenProfile && (
                                    <div className="profile-dropdown flex flex-col justify-items-start">
                                        <div className="menu-icon-dropdown">
                                            <UserCircleIcon className="h-5 w-5" />
                                            <span className="pl-2">Profile</span>
                                        </div>
                                        <div className="menu-icon-dropdown">
                                            <BookmarkIcon className="h-5 w-5" />
                                            <span className="pl-2">Saved</span>
                                        </div>
                                        <div className="menu-icon-dropdown">
                                            <CogIcon className="h-5 w-5" />
                                            <span className="pl-2">Settings</span>
                                        </div>
                                        <div className="menu-icon-dropdown">
                                            <SwitchHorizontalIcon className="h-5 w-5" />
                                            <span className="pl-2">Switch Accounts</span>
                                        </div>
                                        <div className="menu-icon-dropdown">
                                            <LogoutIcon className="h-5 w-5" />
                                            <span className="pl-2">Log Out</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </>
                ) : (
                    <button onClick={signIn}>Sign In</button>
                )}
            </div>
        </div>
    )
}

export default Header;
