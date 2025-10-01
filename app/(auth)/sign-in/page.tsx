'use client'
import React from "react";
import InputField from "@/components/forms/inputField";
import { useForm } from "react-hook-form";
import FooterLink from "@/components/forms/footerLink";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signInWithEmail } from "@/lib/actions/authactions";
const SignIn = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur'
    });
    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await  signInWithEmail(data);
            if(result.success)router.push('/');
            
        }catch(e) {
            console.log(e);
            toast.error(`Sign In failed`, {
                description: e instanceof Error ? e.message : 'failed to Sign in'
            })
        }
    }
    return (
        <>
            <h1 className="form-title">Log In Your Account</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label="Email"
                    placeholder="Enter your email"
                    register={register}
                    error={errors.email}
                    validation={{ required: "Proper email is required", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email is needed' }}
                />
                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: "Password is required", minLength: 8 }}
                />
                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting? 'Sigining up' : 'Sign In'}
                </Button>
                <FooterLink text="Dont have an account" linkText="Sign up" href="/sign-up" />
            </form>
        </>
    )
}

export default SignIn;
