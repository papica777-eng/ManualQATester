"""
Observability and Tracing Setup for AI QA Agents
Using OpenTelemetry with AI Toolkit integration
"""
from typing import Optional
from config import TracingConfig

_observability_initialized = False

def setup_tracing(config: Optional[TracingConfig] = None):
    """
    Initialize OpenTelemetry tracing for AI QA Agents.
    
    Uses AI Toolkit's OTLP endpoint for trace visualization.
    Run VS Code command 'ai-mlstudio.tracing.open' to start trace viewer.
    
    Args:
        config: TracingConfig with endpoint and settings
    """
    global _observability_initialized
    
    if _observability_initialized:
        return
    
    if config is None:
        config = TracingConfig()
    
    try:
        from agent_framework.observability import setup_observability
        
        setup_observability(
            otlp_endpoint=config.otlp_endpoint,
            enable_sensitive_data=config.enable_sensitive_data
        )
        
        _observability_initialized = True
        print(f"✅ Tracing initialized - Endpoint: {config.otlp_endpoint}")
        print("💡 Tip: Run 'AI Toolkit: Open Trace Viewer' in VS Code to view traces")
        
    except ImportError:
        print("⚠️ agent-framework not installed. Tracing disabled.")
    except Exception as e:
        print(f"⚠️ Failed to initialize tracing: {e}")

def get_tracer(name: str = "ai-qa-agents"):
    """Get a tracer instance for manual instrumentation if needed."""
    try:
        from opentelemetry import trace
        return trace.get_tracer(name)
    except ImportError:
        return None
