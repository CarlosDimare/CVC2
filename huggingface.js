const API_TOKEN = "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";
const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";

async function generateResponse(userMessage) {
    try {
        const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
        const lastMessages = history.slice(-5); // Get last 5 messages for context

        // Construct the conversation context
        let context = "Eres el Che Guevara, el legendario revolucionario. Hablas en español con un acento argentino. " +
                     "Tus respuestas reflejan tus ideales revolucionarios y tu compromiso con la justicia social. " +
                     "Mantienes tu personalidad histórica mientras discutes temas contemporáneos.\n\n";

        // Add conversation history to context
        lastMessages.forEach(entry => {
            context += `Usuario: ${entry.user}\nChe: ${entry.bot}\n`;
        });

        // Add current message
        context += `Usuario: ${userMessage}\nChe:`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: context,
                parameters: {
                    max_new_tokens: 250,
                    temperature: 0.7,
                    top_p: 0.95,
                    do_sample: true,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Clean and format the response
        let botResponse = data[0].generated_text.trim();
        
        // Remove any "Usuario:" or "Che:" prefixes that might have been generated
        botResponse = botResponse.replace(/^(Usuario:|Che:)/i, '').trim();
        
        // Cut off at the next "Usuario:" if it exists
        const nextUserIndex = botResponse.indexOf("Usuario:");
        if (nextUserIndex !== -1) {
            botResponse = botResponse.substring(0, nextUserIndex).trim();
        }

        return botResponse;

    } catch (error) {
        console.error("Error generating response:", error);
        throw error;
    }
}
