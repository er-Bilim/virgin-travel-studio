"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {useUser} from "@/lib/hooks";


export default function ProtectedLayout({
                                            children,
                                            roles,
                                        }: {
    children: React.ReactNode;
    roles: string[];
}) {
    const router = useRouter();
    const { data: user, isLoading } = useUser();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }

        if (user && !roles.includes(user.role)) {
            router.push("/403");
        }
    }, [user, isLoading, roles, router]);

    if (isLoading || !user) {
        return null;
    }

    if (!roles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}