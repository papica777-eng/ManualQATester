#!/usr/bin/env python3
"""
AI QA Testing Framework - Command Line Interface
Provides easy access to all AI agents and tools
"""
import asyncio
import sys
import os
from pathlib import Path
from typing import Optional

# Rich for beautiful CLI output
try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.markdown import Markdown
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich.prompt import Prompt, Confirm
    from rich.table import Table
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    print("💡 Install 'rich' for better CLI experience: pip install rich")

# Typer for CLI commands
try:
    import typer
    app = typer.Typer(
        name="qa-agent",
        help="🤖 AI-Powered QA Testing Framework",
        add_completion=False
    )
except ImportError:
    app = None
    print("💡 Install 'typer' for CLI commands: pip install typer")


console = Console() if RICH_AVAILABLE else None


def print_banner():
    """Print the application banner."""
    banner = """
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🤖 AI QA Testing Framework                                  ║
║   ─────────────────────────────────────────────────────────   ║
║   Powered by Microsoft Agent Framework & GitHub Models        ║
║                                                               ║
║   Agents:                                                     ║
║   • Test Case Generator    - Generate test cases from specs   ║
║   • Bug Analyzer           - Analyze and triage bugs          ║
║   • Test Execution Helper  - Guide test execution             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"""
    if console:
        console.print(banner, style="bold blue")
    else:
        print(banner)


def check_github_token() -> bool:
    """Check if GitHub token is configured."""
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        if console:
            console.print(
                "[red]❌ GITHUB_TOKEN environment variable not set![/red]\n"
                "[yellow]Set it with: export GITHUB_TOKEN=your_token[/yellow]"
            )
        else:
            print("❌ GITHUB_TOKEN environment variable not set!")
            print("Set it with: export GITHUB_TOKEN=your_token")
        return False
    return True


# ============= Test Case Generator Commands =============

if app:
    @app.command("generate")
    def generate_test_cases(
        requirement: str = typer.Argument(..., help="The requirement or user story"),
        component: str = typer.Option("General", "--component", "-c", help="Component being tested"),
        count: int = typer.Option(5, "--count", "-n", help="Number of test cases to generate"),
        output: Optional[str] = typer.Option(None, "--output", "-o", help="Output file path"),
        no_security: bool = typer.Option(False, "--no-security", help="Skip security tests"),
        no_negative: bool = typer.Option(False, "--no-negative", help="Skip negative tests"),
    ):
        """🧪 Generate test cases from a requirement."""
        if not check_github_token():
            raise typer.Exit(1)
        
        asyncio.run(_generate_test_cases(
            requirement, component, count, output, 
            not no_security, not no_negative
        ))


async def _generate_test_cases(
    requirement: str,
    component: str,
    count: int,
    output: Optional[str],
    include_security: bool,
    include_negative: bool
):
    """Async implementation of test case generation."""
    from agents import TestCaseGeneratorAgent
    from config import ModelConfig
    
    if console:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Generating test cases...", total=None)
            
            agent = TestCaseGeneratorAgent(ModelConfig())
            result = await agent.generate_test_cases(
                requirement=requirement,
                component=component,
                count=count,
                include_security=include_security,
                include_negative=include_negative
            )
            
            progress.remove_task(task)
    else:
        print("Generating test cases...")
        agent = TestCaseGeneratorAgent()
        result = await agent.generate_test_cases(
            requirement=requirement,
            component=component,
            count=count,
            include_security=include_security,
            include_negative=include_negative
        )
    
    # Output result
    if output:
        Path(output).write_text(result)
        if console:
            console.print(f"[green]✅ Test cases saved to {output}[/green]")
        else:
            print(f"✅ Test cases saved to {output}")
    else:
        if console:
            console.print(Markdown(result))
        else:
            print(result)


# ============= Bug Analyzer Commands =============

if app:
    @app.command("analyze-bug")
    def analyze_bug(
        bug_file: str = typer.Argument(..., help="Path to bug report file"),
        output: Optional[str] = typer.Option(None, "--output", "-o", help="Output file path"),
    ):
        """🔍 Analyze a bug report."""
        if not check_github_token():
            raise typer.Exit(1)
        
        if not Path(bug_file).exists():
            if console:
                console.print(f"[red]❌ File not found: {bug_file}[/red]")
            else:
                print(f"❌ File not found: {bug_file}")
            raise typer.Exit(1)
        
        bug_content = Path(bug_file).read_text()
        asyncio.run(_analyze_bug(bug_content, output))


async def _analyze_bug(bug_content: str, output: Optional[str]):
    """Async implementation of bug analysis."""
    from agents import BugAnalyzerAgent
    from config import ModelConfig
    
    if console:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Analyzing bug report...", total=None)
            
            agent = BugAnalyzerAgent(ModelConfig())
            result = await agent.analyze_bug(bug_content)
            
            progress.remove_task(task)
    else:
        print("Analyzing bug report...")
        agent = BugAnalyzerAgent()
        result = await agent.analyze_bug(bug_content)
    
    if output:
        Path(output).write_text(result)
        if console:
            console.print(f"[green]✅ Analysis saved to {output}[/green]")
        else:
            print(f"✅ Analysis saved to {output}")
    else:
        if console:
            console.print(Markdown(result))
        else:
            print(result)


if app:
    @app.command("create-bug")
    def create_bug_report(
        description: str = typer.Argument(..., help="Brief description of the bug"),
        steps: str = typer.Option(..., "--steps", "-s", help="Steps to reproduce"),
        environment: str = typer.Option("Chrome, Windows", "--env", "-e", help="Environment details"),
        output: Optional[str] = typer.Option(None, "--output", "-o", help="Output file path"),
    ):
        """📝 Generate a complete bug report from basic info."""
        if not check_github_token():
            raise typer.Exit(1)
        
        asyncio.run(_create_bug_report(description, steps, environment, output))


async def _create_bug_report(
    description: str,
    steps: str,
    environment: str,
    output: Optional[str]
):
    """Async implementation of bug report creation."""
    from agents import BugAnalyzerAgent
    from config import ModelConfig
    
    agent = BugAnalyzerAgent(ModelConfig())
    result = await agent.generate_bug_report(description, steps, environment)
    
    if output:
        Path(output).write_text(result)
        if console:
            console.print(f"[green]✅ Bug report saved to {output}[/green]")
    else:
        if console:
            console.print(Markdown(result))
        else:
            print(result)


# ============= Test Execution Commands =============

if app:
    @app.command("guide")
    def execution_guide(
        test_plan: str = typer.Argument(..., help="Test plan name or description"),
        time: str = typer.Option("4 hours", "--time", "-t", help="Available testing time"),
        priorities: str = typer.Option("", "--priorities", "-p", help="Priority areas"),
    ):
        """📋 Get test execution guidance."""
        if not check_github_token():
            raise typer.Exit(1)
        
        asyncio.run(_execution_guide(test_plan, time, priorities))


async def _execution_guide(test_plan: str, time: str, priorities: str):
    """Async implementation of execution guide."""
    from agents import TestExecutionAssistant
    from config import ModelConfig
    
    agent = TestExecutionAssistant(ModelConfig())
    result = await agent.get_execution_guidance(test_plan, time, priorities)
    
    if console:
        console.print(Markdown(result))
    else:
        print(result)


if app:
    @app.command("chat")
    def interactive_chat():
        """💬 Start interactive testing assistant chat."""
        if not check_github_token():
            raise typer.Exit(1)
        
        asyncio.run(_interactive_chat())


async def _interactive_chat():
    """Start interactive chat session."""
    from agents import TestExecutionAssistant
    from config import ModelConfig
    
    agent = TestExecutionAssistant(ModelConfig())
    await agent.interactive_session()


# ============= Evaluation Commands =============

if app:
    @app.command("evaluate")
    def run_evaluation_cmd(
        data_file: str = typer.Argument(..., help="Path to JSONL data file"),
        evaluator: str = typer.Option("test-case", "--evaluator", "-e", 
                                       help="Evaluator to use: test-case, bug-report"),
        output: str = typer.Option("evaluation_results.json", "--output", "-o",
                                   help="Output file path"),
    ):
        """📊 Run evaluation on test data."""
        from evaluation import TestCaseQualityEvaluator, BugReportQualityEvaluator, run_evaluation
        
        evaluators = {
            "test-case": TestCaseQualityEvaluator(),
            "bug-report": BugReportQualityEvaluator(),
        }
        
        if evaluator not in evaluators:
            if console:
                console.print(f"[red]Unknown evaluator: {evaluator}[/red]")
            raise typer.Exit(1)
        
        results = run_evaluation(
            data_file,
            {evaluator: evaluators[evaluator]},
            output
        )
        
        if console:
            table = Table(title="Evaluation Results")
            table.add_column("Metric")
            table.add_column("Value")
            
            for metric, stats in results.get("aggregate_metrics", {}).items():
                table.add_row(f"{metric} (mean)", f"{stats['mean']:.2%}")
                table.add_row(f"{metric} (min)", f"{stats['min']:.2%}")
                table.add_row(f"{metric} (max)", f"{stats['max']:.2%}")
            
            console.print(table)
            console.print(f"[green]✅ Full results saved to {output}[/green]")
        else:
            print(f"Results saved to {output}")


# ============= Utility Commands =============

if app:
    @app.command("setup")
    def setup():
        """⚙️ Setup and verify the framework configuration."""
        print_banner()
        
        if console:
            console.print("\n[bold]Checking configuration...[/bold]\n")
        
        # Check GitHub token
        token = os.environ.get("GITHUB_TOKEN")
        if token:
            if console:
                console.print("[green]✅ GITHUB_TOKEN is set[/green]")
            else:
                print("✅ GITHUB_TOKEN is set")
        else:
            if console:
                console.print("[red]❌ GITHUB_TOKEN is not set[/red]")
                console.print("[yellow]   Get a token from: https://github.com/settings/tokens[/yellow]")
            else:
                print("❌ GITHUB_TOKEN is not set")
        
        # Check dependencies
        deps = [
            ("agent_framework", "agent-framework-azure-ai"),
            ("openai", "openai"),
            ("rich", "rich"),
            ("typer", "typer"),
        ]
        
        if console:
            console.print("\n[bold]Checking dependencies...[/bold]\n")
        
        for module, package in deps:
            try:
                __import__(module)
                if console:
                    console.print(f"[green]✅ {package}[/green]")
                else:
                    print(f"✅ {package}")
            except ImportError:
                if console:
                    console.print(f"[red]❌ {package} - pip install {package}[/red]")
                else:
                    print(f"❌ {package} - pip install {package}")
        
        if console:
            console.print("\n[bold green]Setup complete![/bold green]")
            console.print("\nGet started with:")
            console.print("  qa-agent generate 'Your requirement here'")
            console.print("  qa-agent analyze-bug bug-report.md")
            console.print("  qa-agent chat")


# ============= Main Entry Point =============

def main():
    """Main entry point."""
    if app is None:
        print_banner()
        print("\n⚠️ Typer not installed. Install with: pip install typer rich")
        print("\nAlternatively, you can import and use the agents directly:")
        print("  from agents import TestCaseGeneratorAgent, BugAnalyzerAgent")
        sys.exit(1)
    
    app()


if __name__ == "__main__":
    main()
