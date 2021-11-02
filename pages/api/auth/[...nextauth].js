import { collection, onSnapshot, orderBy, query, setDoc, doc, serverTimestamp } from "@firebase/firestore";
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from "../../../firebase";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],

  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async session({ session, token, user }) {
      session.user.username = session.user.name.split(' ').join('').toLocaleLowerCase();
      session.user.uid = token.sub;
      var data = null;

      onSnapshot(query(collection(db, 'users'), orderBy('timestamp', 'desc')), snapshot => {
        data = snapshot.docs;
      });

      if (data && data?.length > 0) {
        data.filter(async (profile, i) => {
          if (profile.data().uid != session?.user.uid) {
            await setDoc(doc(db, 'users', session?.user.uid), {
              email: session?.user?.email,
              username: session?.user?.username,
              userImage: session?.user?.image,
              uid: session?.user.uid,
              timestamp: serverTimestamp()
            });
          }
        })
      }
      else {
        await setDoc(doc(db, 'users', session?.user.uid), {
          email: session?.user?.email,
          username: session?.user?.username,
          userImage: session?.user?.image,
          uid: session?.user.uid,
          timestamp: serverTimestamp()
        });
      }

      if (typeof window !== "undefined") {
        localStorage.setItem('login_provider', JSON.stringify(session?.user.uid));
      }

      return session;
    }
  }
})