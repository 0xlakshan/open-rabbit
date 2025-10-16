# Open Rabbit 🐇
Local AI code reviewer open source

### How It Works
- You link an LLM (via API key or local endpoint) in `config.yaml`.
- On each PR or git diff, OpenRabbit:
  - Extracts changed lines and surrounding context
  - Sends the diff + file context to your configured LLM
  - Parses the LLM’s response into actionable review comments
- Results are shown in terminal or posted as PR comments (GitHub/GitLab).
- Core Features
  - Bring your own LLM: OpenRouter, Ollama, OpenAI, Anthropic, or local LLMs
  - Diff-aware reviews: Only analyzes changed code + relevant context
  - No data leaves your machine (unless using cloud APIs you provide)
  - Lightweight: No heavy agents or background services
  -  Git-native: Works with git diff, PRs, or CI hooks

### Vision
An open, transparent alternative to closed AI reviewers—giving developers full control over how and where their code is analyzed, while keeping feedback fast, relevant, and change-focused.**
