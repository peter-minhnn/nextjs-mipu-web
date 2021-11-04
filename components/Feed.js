import React from 'react'
import MiniProfile from './MiniProfile'
import Posts from './Posts'
import Stories from './Stories'
import Suggestions from './Suggestions'
import { useSession } from 'next-auth/react'

function Feed() {
    const { data: session } = useSession();
    return (
        <main className={`grid grid-cols-1 md:grid-cols-2 md:max-w-3xl lg:grid-cols-3 lg:max-w-5xl mx-auto overflow-auto ${!session && "!grid-cols-1 !max-w-3xl"}`}>
            {/* Section */}
            <section className="col-span-2">
                {/* <Stories /> */}
                <Posts />
            </section>

            {/* Section */}
            {session && (
                <section className="hidden xl:inline-grid md:col-span-1">
                    <div className="fixed top-20">
                        <MiniProfile />
                        <Suggestions />
                    </div>
                </section>
            )}
        </main>
    )
}

export default Feed
