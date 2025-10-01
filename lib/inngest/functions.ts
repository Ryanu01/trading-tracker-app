import { getAllUsersForNewsEmail } from "../actions/user.action";
import { sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created' },
    async ({ event, step }: { event: any, step: any }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmenGoals}
            - Risk Tolerance: ${event.data.riskTolerance}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile);

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ]
            }
        })

        await step.run('send-welcome-email', async() => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introtext = (part && 'text' in part ? part.text : null) || 'Thanks for joining' 

            const { data : {email, name}} = event;
            return await sendWelcomeEmail({
                email, name, intro: introtext
            })
        })

        return {
            success: true,
            message: 'Welcome email sent succesfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    {id: 'daily-news-summary' },
    [ { event: 'app/send.daily.news' }, { cron: '0 12 * * *'} ],
    async ({ step }) => {
        const users = await step.run('get-all-users', getAllUsersForNewsEmail)
        
        if(!users || users.length === 0) return {success: false, message: 'No users found for email'};

        //fetch personalized use for each user

        //summarize this news via ai
        
        //send the email
    }
)