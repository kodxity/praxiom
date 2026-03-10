<<<<<<< HEAD
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
=======
import NextAuth from "next-auth"

declare module "next-auth" {
    interface User {
        id: string
        username: string
        isAdmin: boolean
        isTeacher: boolean
        groupId: string | null
    }

    interface Session {
        user: User & {
            id: string
            username: string
            isAdmin: boolean
            isTeacher: boolean
            groupId: string | null
        }
    }
}
>>>>>>> LATESTTHISONE-NEWMODES
