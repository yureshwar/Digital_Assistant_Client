export const gptPrompt = {
    getResponseFromGPT: async (prompt: string) => {
        try {
            console.log(prompt);
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer sk-rAfjtbKCBPc8wpdVZept93BJlrIFqFienFCVnQ4veDT3BlbkFJhA2TsahKgU4rcpQ4_BkEWD6QbWLwG1uh1Rmw3QELIA' // Replace with your actual API key
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{
                        role: "system",
                        content: "Do not include any other text except what asked for. Return the response as a json"
                    }, {role: "user", content: prompt}],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from GPT-4');
                return false;
            }
        } catch (e) {
            return false;
        }
    }
}