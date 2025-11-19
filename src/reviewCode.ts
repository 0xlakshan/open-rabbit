import {streamText} from 'ai';
import {google} from '@ai-sdk/google';

interface ReviewOptions {
	model?: string;
	detailed?: boolean;
	focus?: string;
}

export async function reviewCodeSnippet(
	code: string,
	options: ReviewOptions = {},
): Promise<AsyncIterable<string>> {
	const {model = 'gemini-2.5-flash', detailed = false, focus = 'all'} = options;

	// Build dynamic system prompt based on options
	const focusAreas = getFocusAreas(focus);
	const wordLimit = detailed ? 300 : 150;

	const systemPrompt = `
You are a senior software engineer performing a ${
		detailed ? 'thorough' : 'concise'
	}, constructive code review.

${focusAreas}

Review Guidelines:
- Be direct, professional, and actionable
- Prioritize issues by severity (critical, important, minor)
- Provide specific line references when possible
- Suggest concrete improvements
- Acknowledge good practices when present

Response Format:
- Use plain text (no markdown formatting)
- Start with a brief overall assessment
- List findings in order of importance
- Keep feedback under ${wordLimit} words
`;

	const result = streamText({
		model: google(model),
		system: systemPrompt,
		prompt: `Review the following code:\n\n\`\`\`\n${code}\n\`\`\``,
		maxTokens: detailed ? 1000 : 500,
		temperature: 0.3, // Lower temperature for more consistent technical reviews
	});

	return result.textStream;
}

function getFocusAreas(focus: string): string {
	const areas: Record<string, string> = {
		security: `
Focus specifically on:
- Input validation and sanitization
- Authentication and authorization issues
- Data exposure and privacy concerns
- Injection vulnerabilities (SQL, XSS, etc.)
- Secure coding practices
`,
		performance: `
Focus specifically on:
- Algorithmic efficiency and time complexity
- Memory usage and potential leaks
- Unnecessary computations or redundant operations
- Database query optimization
- Caching opportunities
`,
		style: `
Focus specifically on:
- Code readability and naming conventions
- Consistent formatting and structure
- Comment quality and documentation
- Code organization and modularity
- Adherence to language idioms and best practices
`,
		all: `
Focus on:
- Code correctness and potential bugs
- Security vulnerabilities
- Performance bottlenecks
- Readability and maintainability
- Adherence to best practices
`,
	};

	return areas[focus] || areas.all;
}
