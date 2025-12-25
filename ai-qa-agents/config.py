"""
Configuration for AI QA Testing Framework
Using GitHub Models with Microsoft Agent Framework
"""
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class ModelConfig:
    """Configuration for AI Model"""
    base_url: str = "https://models.github.ai/inference"
    model_id: str = "openai/gpt-4.1-mini"  # Cost-effective, high quality
    api_key: Optional[str] = None
    
    def __post_init__(self):
        if self.api_key is None:
            self.api_key = os.environ.get("GITHUB_TOKEN")
            if not self.api_key:
                raise ValueError(
                    "GitHub Token not found. Set GITHUB_TOKEN environment variable "
                    "or pass api_key to ModelConfig"
                )

@dataclass  
class TracingConfig:
    """Configuration for OpenTelemetry Tracing"""
    otlp_endpoint: str = "http://localhost:4317"  # AI Toolkit gRPC endpoint
    enable_sensitive_data: bool = True
    service_name: str = "ai-qa-agents"

@dataclass
class QAConfig:
    """Main QA Framework Configuration"""
    model: ModelConfig = None
    tracing: TracingConfig = None
    
    # Paths
    test_cases_dir: str = "test-cases"
    bug_reports_dir: str = "bug-reports"
    playwright_dir: str = "playwright-demo"
    output_dir: str = "ai-qa-agents/outputs"
    
    # Templates
    test_case_template: str = "templates/test-case.md.j2"
    bug_report_template: str = "templates/bug-report.md.j2"
    
    def __post_init__(self):
        if self.model is None:
            self.model = ModelConfig()
        if self.tracing is None:
            self.tracing = TracingConfig()

# Available GitHub Models for QA Tasks
RECOMMENDED_MODELS = {
    "default": "openai/gpt-4.1-mini",          # Best balance of cost/quality
    "advanced": "openai/gpt-4.1",               # Higher quality analysis
    "fast": "openai/gpt-4.1-nano",              # Quick responses
    "reasoning": "openai/o3-mini",              # Complex test logic
    "coding": "mistral-ai/codestral-2501",      # Code generation
}
