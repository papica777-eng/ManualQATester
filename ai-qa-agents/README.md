# AI QA Testing Framework

🤖 **AI-Powered Quality Assurance Testing Framework**

Comprehensive AI agents built with Microsoft Agent Framework and GitHub Models for automated test case generation, bug analysis, and test execution assistance.

## 🌟 Features

### AI Agents

| Agent | Description | Use Case |
|-------|-------------|----------|
| **Test Case Generator** | Generates comprehensive test cases from requirements | Sprint planning, feature documentation |
| **Bug Analyzer** | Analyzes bugs, suggests severity, finds duplicates | Bug triage, root cause analysis |
| **Test Execution Assistant** | Guides test execution, generates reports | Daily testing, sprint reports |

### Key Capabilities

- 🧪 **Automated Test Case Generation** - From requirements to test cases in seconds
- 🔍 **Intelligent Bug Analysis** - Severity assessment, duplicate detection
- 📊 **Quality Evaluation** - Measure test case and bug report quality
- 🔭 **Observability** - OpenTelemetry tracing integration
- 💬 **Interactive Chat** - Conversational test execution assistance

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ai-qa-agents
pip install -r requirements.txt
```

> **Note:** The `--pre` flag is required for agent-framework as it's in preview:
> ```bash
> pip install agent-framework-azure-ai --pre
> ```

### 2. Configure GitHub Token

```bash
export GITHUB_TOKEN=your_github_personal_access_token
```

Get a token from: https://github.com/settings/tokens

### 3. Run the CLI

```bash
# Check setup
python cli.py setup

# Generate test cases
python cli.py generate "As a user, I want to login with email and password"

# Analyze a bug
python cli.py analyze-bug ../bug-reports/BUG-001-login-timeout-after-password-reset.md

# Start interactive chat
python cli.py chat
```

## 📖 Usage Examples

### Generate Test Cases

```bash
# Basic generation
python cli.py generate "User can search products by name" -c "Search" -n 5

# With specific options
python cli.py generate "Shopping cart checkout flow" \
  --component "Cart" \
  --count 10 \
  --output test-cases/cart-tests.md
```

### Analyze Bugs

```bash
# Analyze existing bug report
python cli.py analyze-bug bug-report.md

# Create new bug report from description
python cli.py create-bug "Login button not responding" \
  --steps "1. Go to login page\n2. Enter credentials\n3. Click login" \
  --env "Chrome 120, macOS"
```

### Test Execution Assistance

```bash
# Get execution guidance
python cli.py guide "Authentication Test Plan" \
  --time "4 hours" \
  --priorities "Security, Login flow"

# Interactive session
python cli.py chat
```

### Run Evaluations

```bash
# Evaluate test case quality
python cli.py evaluate test_data.jsonl --evaluator test-case

# Evaluate bug report quality
python cli.py evaluate bug_data.jsonl --evaluator bug-report
```

## 🏗️ Architecture

```
ai-qa-agents/
├── agents/
│   ├── test_case_generator.py   # Test case generation agent
│   ├── bug_analyzer.py          # Bug analysis agent
│   └── test_execution_assistant.py  # Execution helper agent
├── evaluation/
│   └── evaluators.py            # Quality evaluation metrics
├── config.py                    # Configuration management
├── observability.py             # OpenTelemetry tracing
├── cli.py                       # Command-line interface
└── requirements.txt             # Python dependencies
```

## 🤖 Model Configuration

Default model: `openai/gpt-4.1-mini` (GitHub Models)

Available models for different tasks:

| Task | Recommended Model | Why |
|------|-------------------|-----|
| General | `openai/gpt-4.1-mini` | Best cost/quality balance |
| Complex Analysis | `openai/gpt-4.1` | Higher quality reasoning |
| Fast Responses | `openai/gpt-4.1-nano` | Quick iterations |
| Code Generation | `mistral-ai/codestral-2501` | Optimized for code |
| Deep Reasoning | `openai/o3-mini` | Complex test logic |

## 🔭 Observability

Enable tracing to debug and monitor agent behavior:

```python
from observability import setup_tracing
from config import TracingConfig

# Initialize tracing (AI Toolkit integration)
setup_tracing(TracingConfig())

# Your agent code here...
```

View traces in VS Code:
1. Open Command Palette (Ctrl+Shift+P)
2. Run "AI Toolkit: Open Trace Viewer"

## 📊 Evaluation Metrics

### Test Case Quality
- **Completeness** - All required sections present
- **Clarity** - Clear, actionable steps
- **Coverage** - Positive, negative, edge cases
- **Test Data** - Specific, appropriate data

### Bug Report Quality
- **Reproducibility** - Clear reproduction steps
- **Completeness** - All required fields
- **Clarity** - Well-structured content
- **Evidence** - Screenshots, logs, traces

## 🔧 Programmatic Usage

```python
import asyncio
from agents import TestCaseGeneratorAgent, BugAnalyzerAgent
from config import ModelConfig

async def main():
    # Configure model
    config = ModelConfig(
        model_id="openai/gpt-4.1-mini"
    )
    
    # Generate test cases
    tc_agent = TestCaseGeneratorAgent(config)
    test_cases = await tc_agent.generate_test_cases(
        requirement="User login with 2FA",
        component="Authentication",
        count=5
    )
    print(test_cases)
    
    # Analyze a bug
    bug_agent = BugAnalyzerAgent(config)
    analysis = await bug_agent.analyze_bug(bug_report_content)
    print(analysis)

asyncio.run(main())
```

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run evaluations to ensure quality
5. Submit a pull request

---


