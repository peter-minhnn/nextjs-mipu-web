import React, { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'

function MiniProfile() {
    const { data: session } = useSession();

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
                onClick={() => {
                    localStorage.removeItem('login_provider');
                    signOut();
                }}
                className="text-blue-400 text-sm font-semibold">Sign out</button>
        </div>
    )
}

export default MiniProfile
