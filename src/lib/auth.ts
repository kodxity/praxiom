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
                // Fresh login — seed the token from the authorize() return value
                token.id = user.id;
                token.username = user.username;
                token.isAdmin = user.isAdmin;
                token.isTeacher = user.isTeacher;
                token.groupIds = user.groupIds;
                token._syncedAt = Date.now();
            } else if (token.id) {
                // Subsequent requests — re-sync from DB at most once per 60 s
                const now = Date.now();
                if (!token._syncedAt || now - (token._syncedAt as number) > 60_000) {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: {
                            isTeacher: true,
                            isAdmin: true,
                            taughtGroups: { select: { id: true } },
                            groupMemberships: { select: { groupId: true } },
                        },
                    });
                    if (dbUser) {
                        token.isTeacher = dbUser.isTeacher;
                        token.isAdmin = dbUser.isAdmin;
                        token.groupIds = [
                            ...dbUser.groupMemberships.map((m: { groupId: string }) => m.groupId),
                            ...dbUser.taughtGroups.map((g: { id: string }) => g.id),
                        ];
                    }
                    token._syncedAt = now;
                }
            }
            return token;
        }
    }
};
