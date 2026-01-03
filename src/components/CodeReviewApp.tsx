import React, {useEffect, useState} from 'react';
import {Box, Text, Newline} from 'ink';
import Spinner from 'ink-spinner';
import {readFileSync, statSync} from 'fs';
import {basename} from 'path';
import {reviewCodeSnippet} from './reviewCode.js';

export interface CodeReviewAppProps {
	filePath: string;
	model?: string;
	detailed?: boolean;
	focus?: string;
}

const CodeReviewApp: React.FC<CodeReviewAppProps> = ({
	filePath,
	model = 'gemini-2.5-flash',
	detailed = false,
	focus = 'all',
}) => {
	const [feedback, setFeedback] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [fileInfo, setFileInfo] = useState<{
		name: string;
		size: number;
		lines: number;
	} | null>(null);

	useEffect(() => {
		let cancelled = false;

		const runReview = async () => {
			try {
				const code = readFileSync(filePath, 'utf-8');
				const stats = statSync(filePath);
				const lines = code.split('\n').length;

				if (cancelled) return;

				setFileInfo({
					name: basename(filePath),
					size: stats.size,
					lines,
				});

				if (stats.size > 50_000) {
					setError(
						'File is too large (>50KB). Please review smaller code snippets.',
					);
					return;
				}

				const stream = await reviewCodeSnippet(code, {
					model,
					detailed,
					focus,
				});

				for await (const chunk of stream) {
					if (cancelled) break;
					setFeedback(prev => prev + chunk);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						`Failed to review code: ${
							err instanceof Error ? err.message : 'Unknown error'
						}`,
					);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		runReview();

		return () => {
			cancelled = true;
		};
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

export default CodeReviewApp;
