import {streamText} from 'ai';
import {google} from '@ai-sdk/google';

export async function reviewCodeSnippet(
	code: string,
): Promise<AsyncIterable<string>> {
	const systemPrompt = `
		You are a senior software engineer performing a concise, constructive code review.
		Focus on:
		- Code correctness and potential bugs
		- Security vulnerabilities
		- Readability and maintainability
		- Adherence to best practices
		Respond in plain text (no markdown). Be direct, professional, and keep feedback under 150 words.
`;

	const result = streamText({
		model: google('gemini-2.5-flash'),
		system: systemPrompt,
		prompt: `Review the following code:\n\n\`\`\`\n${code}\n\`\`\``,
	});

	return result.textStream;
}
