'use server';
import {auth} from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { inngest } from '../inngest/client';
export const signUpWithEmail = async({email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry}: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({
            body: { email: email, password: password, name: fullName}
        })

        if(response) {
            await inngest.send({
                name: 'app/user.created', 
                data: {
                    email: email,
                    name: fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry
                }
            })
        }

        return { success: true, data: response}
    } catch (error) {
        console.log('Sign Up Faied', error);
        return { success: false, message: "Sign up failed"}
        
    }
}

export const signInWithEmail = async({email, password}: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({
            body: { email, password}
        })

        return { success: true, data: response}
    } catch (error) {
        console.log('Sign In Faied', error);
        return { success: false, message: "Sign up failed"}
        
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers()})
    } catch (error) {
        console.log('Sign out failed', error);

    }return { success: false, error: 'Sign out failed'}
}