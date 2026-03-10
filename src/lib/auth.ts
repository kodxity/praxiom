import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username },
                    include: {
                        taughtGroups: { select: { id: true } },
                        groupMemberships: { select: { groupId: true } },
                    },
                });

                if (!user) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                if (!user.isApproved && !user.isAdmin) {
                    throw new Error("Account pending approval.");
                }

                return {
                    id: user.id,
                    username: user.username,
                    name: user.username,
                    isAdmin: user.isAdmin,
                    isTeacher: user.isTeacher,
                    groupIds: [
                        ...user.groupMemberships.map(m => m.groupId),
                        ...user.taughtGroups.map(g => g.id),
                    ],
                };
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.isAdmin = token.isAdmin as boolean;
                session.user.isTeacher = token.isTeacher as boolean;
                session.user.groupIds = (token.groupIds as string[] | undefined) ?? [];
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.isAdmin = user.isAdmin;
                token.isTeacher = user.isTeacher;
                token.groupIds = user.groupIds;
            }
            return token;
        }
    }
};
