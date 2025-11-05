import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';

const authOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Connect to database
          await connectDB();

          // Get email and password from credentials
          const { email, password } = credentials;

          // Find user by email and include password field
          const user = await User.findOne({ email }).select('+password');

          // If no user found, return null
          if (!user) {
            return null;
          }

          // Use the comparePassword method to verify password
          const isPasswordCorrect = await user.comparePassword(password);

          // If password is incorrect, return null
          if (!isPasswordCorrect) {
            return null;
          }

          // Return user object (password will not be serialized)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            basicRefinesRemaining: user.basicRefinesRemaining,
            proRefinesRemaining: user.proRefinesRemaining,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user id to token on sign in
      if (user) {
        token.id = user.id;
        token.basicRefinesRemaining = user.basicRefinesRemaining;
        token.proRefinesRemaining = user.proRefinesRemaining;
      } else if (token.id) {
        // Fetch fresh quota data from database on every request
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).select('basicRefinesRemaining proRefinesRemaining');
          if (dbUser) {
            token.basicRefinesRemaining = dbUser.basicRefinesRemaining;
            token.proRefinesRemaining = dbUser.proRefinesRemaining;
          }
        } catch (error) {
          console.error('Error fetching user quotas:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id from token to session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.basicRefinesRemaining = token.basicRefinesRemaining;
        session.user.proRefinesRemaining = token.proRefinesRemaining;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };
