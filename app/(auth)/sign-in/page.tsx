'use client'
import React from "react";
import InputField from "@/components/forms/inputField";
import { useForm } from "react-hook-form";
import FooterLink from "@/components/forms/footerLink";
import { Button } from "@/components/ui/button";
const SignIn = () => {
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
            console.log(data);

        } catch (e) {
            console.log(e);
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
                    validation={{ required: "Proper email is required", pattern: /^\w+@\w\.\w+$/, message: 'Email is needed' }}
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
