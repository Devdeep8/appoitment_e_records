import { useRouter, useSearchParams } from "next/navigation";

import { useCallback } from "react";



export function useUrlState <T extends string>(key: string, defaultValue?: T) {
    const router = useRouter()
    const searchParams = useSearchParams()


    const value = (searchParams.get(key) as T) || defaultValue

    const setValue = useCallback (
        (newValue : T | undefined) => {
            const params = new URLSearchParams(searchParams.toString());
            if (newValue === undefined || newValue === defaultValue) {
                params.delete(key)
            }
            else{
                params.set(key, newValue)
            }
            router.push(`?${params.toString()}`)
        },
        [router , searchParams , key , defaultValue]
    )

    return [value , setValue] as const;
}