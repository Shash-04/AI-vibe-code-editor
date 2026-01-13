import SignInFormClient from '@/modules/auth/components/sign-in-form-client'
import Image from 'next/image'
import React from 'react'

const Page = () => {
    return (
        <>
            <div className="min-h-screen overflow-x-hidden px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="w-full max-w-5xl flex flex-col items-center gap-8 lg:flex-row">

                    {/* Image (desktop only, no layout space on mobile) */}
                    <Image
                        src="/login.svg"
                        alt="Login Illustration"
                        width={400}
                        height={400}
                        className="hidden lg:block max-w-full h-auto"
                    />

                    {/* Form */}
                    <div className="w-full max-w-md">
                        <SignInFormClient />
                    </div>

                </div>
            </div>



        </>
    )
}

export default Page