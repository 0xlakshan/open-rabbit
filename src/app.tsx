import React, {useState, useEffect} from 'react';
import {Text, Box, Newline} from 'ink';
import Spinner from 'ink-spinner';
import {reviewCodeSnippet} from './reviewCode.js';
import {readFileSync, statSync} from 'fs';
import {basename} from 'path';

interface AppProps {
	filePath: string;
	model?: string;
	detailed?: boolean;
	focus?: string;
}

const App: React.FC<AppProps> = ({
	filePath,
	model = 'gemini-2.5-flash',
	detailed = false,
	focus = 'all',
}) => {
	const [feedback, setFeedback] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [fileInfo, setFileInfo] = useState<{
		name: string;
		size: number;
		lines: number;
	} | null>(null);

	useEffect(() => {
		const runReview = async () => {
			try {
				const code = readFileSync(filePath, 'utf-8');
				const stats = statSync(filePath);
				const lines = code.split('\n').length;

				setFileInfo({
					name: basename(filePath),
					size: stats.size,
					lines,
				});

				// Check file size (warn if > 50KB)
				if (stats.size > 50000) {
					setError(
						'File is too large (>50KB). Please review smaller code snippets.',
					);
					setLoading(false);
					return;
				}

				const stream = await reviewCodeSnippet(code, {
					model,
					detailed,
					focus,
				});

				for await (const chunk of stream) {
					setFeedback(prev => prev + chunk);
				}
			} catch (err) {
				setError(
					`Failed to review code: ${
						err instanceof Error ? err.message : 'Unknown error'
					}`,
				);
			} finally {
				setLoading(false);
			}
		};

		runReview();
	}, [filePath, model, detailed, focus]);

	if (error) {
		return (
			<Box flexDirection="column" paddingX={1}>
				<Text color="red" bold>
					❌ Error
				</Text>
				<Text>{error}</Text>
			</Box>
		);
	}

	if (loading) {
		return (
			<Box flexDirection="column" paddingX={1}>
				<Box marginBottom={1}>
					<Text color="cyan" bold>
						🔍 Analyzing Code
					</Text>
				</Box>
				{fileInfo && (
					<Box flexDirection="column" marginBottom={1}>
						<Text dimColor>File: {fileInfo.name}</Text>
						<Text dimColor>
							Size: {(fileInfo.size / 1024).toFixed(2)} KB | Lines:{' '}
							{fileInfo.lines}
						</Text>
						<Text dimColor>Model: {model}</Text>
						{detailed && <Text dimColor>Mode: Detailed Review</Text>}
						{focus !== 'all' && <Text dimColor>Focus: {focus}</Text>}
					</Box>
				)}
				<Box>
					<Text color="green">
						<Spinner type="dots" />
					</Text>
					<Text> Please wait...</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingX={1}>
			<Box marginBottom={1}>
				<Text color="green" bold>
					Code Review Complete
				</Text>
			</Box>

			{fileInfo && (
				<Box marginBottom={1}>
					<Text dimColor>
						Reviewed {fileInfo.name} ({fileInfo.lines} lines)
					</Text>
				</Box>
			)}

			<Box borderStyle="round" borderColor="cyan" padding={1}>
				<Text>{feedback || 'No feedback generated.'}</Text>
			</Box>

			<Newline />
			<Box marginTop={1}>
				<Text dimColor italic>
					Tip: Use --detailed for more comprehensive feedback
				</Text>
			</Box>
		</Box>
	);
};

export default App;
