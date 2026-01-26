import NextAuth from "next-auth"

declare module "next-auth" {
    interface User {
        id: string
        username: string
        isAdmin: boolean
    }

    interface Session {
        user: User & {
            id: string
            username: string
            isAdmin: boolean
        }
    }
}
