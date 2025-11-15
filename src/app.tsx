import React, {useState, useEffect} from 'react';
import {reviewCodeSnippet} from './reviewCode';
import {readFileSync} from 'fs';

const App: React.FC<{filePath: string}> = ({filePath}) => {
	const [feedback, setFeedback] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const runReview = async () => {
			try {
				const code = readFileSync(filePath, 'utf-8');
				const stream = await reviewCodeSnippet(code);

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
	}, [filePath]);

	if (error) return <>{error}</>;
	if (loading) return <>Analyzing code...\n</>;

	return (
		<>
			<h2>AI Code Review</h2>
			<br />
			{feedback.split('\n').map((line, i) => (
				<span key={i}>{line}\n</span>
			))}
		</>
	);
};

export default App;
