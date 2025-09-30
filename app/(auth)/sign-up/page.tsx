'use client'
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import SelectField from "@/components/forms/selectField";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";
import { CountrySelectField } from "@/components/forms/countryField";
import FooterLink from "@/components/forms/footerLink";
const SignUp = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            country: 'IN',
            investmentGoals: 'Growth',
            riskTolerance: 'medium',
            preferredIndustry: 'texhnology'
        },
        mode: 'onBlur'
    });
    const onSubmit =  async (data: SignUpFormData) => {
        try {
            console.log(data);
            
        }catch(e) {
            console.log(e);
        }
    }
    return (
        <>
            <h1 className="form-title">Sign Up & Personalize</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField 
                    name="fullName"
                    label="Full Name"
                    placeholder="Ryan Gomes"
                    register={register}
                    error={errors.fullName}
                    validation={{ required: "Full name is required", minLength: 2}}
                />
                <InputField 
                    name="email"
                    label="email"
                    placeholder="xyz@gmail.com"
                    register={register}
                    error={errors.email}
                    validation={{ required: "Proper email is required", pattern: /^\w+@\w\.\w+$/, message: 'Email is needed'}}
                />
                <InputField 
                    name="password"
                    label="Password"
                    placeholder="Enter password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: "Password is required", minLength: 8}}
                />
                <CountrySelectField 
                    name="country"
                    label="Country"
                    control={control}
                    error={errors.country}
                    required

                />

                <SelectField 
                    name="InvestmentGoals"
                    label="Investment Goals"
                    placeholder="Select your Investment Goal"
                    options={INVESTMENT_GOALS}
                    control={control}
                    error={errors.investmentGoals}
                />
                <SelectField 
                    name="riskTolenrace"
                    label="Risk Tolerance"
                    placeholder="Select your Risk Level"
                    options={RISK_TOLERANCE_OPTIONS}
                    control={control}
                    error={errors.riskTolerance}
                />
                <SelectField 
                    name="preferredIndustry"
                    label="Preferred Industry"
                    placeholder="Select your Preferred Industry"
                    options={PREFERRED_INDUSTRIES}
                    control={control}
                    error={errors.investmentGoals}
                />
                
                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting? 'Creating account' : 'Start your journey'}
                </Button>
                <FooterLink text="Already have an account" linkText="Sign in" href="/sign-in" />
            </form>
        </>
    )
}

export default SignUp;
