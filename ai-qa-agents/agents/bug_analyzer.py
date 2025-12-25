"""
Bug Analyzer Agent
Analyzes bug reports, suggests severity, finds duplicates, and recommends fixes
"""
import asyncio
from typing import Annotated, Optional, List, Dict
from dataclasses import dataclass
from datetime import datetime
import json

from agent_framework import ChatAgent
from agent_framework.openai import OpenAIChatClient
from openai import AsyncOpenAI

from config import QAConfig, ModelConfig


@dataclass
class BugAnalysis:
    """Bug analysis result"""
    bug_id: str
    severity: str
    priority: str
    category: str
    root_cause_hypothesis: str
    affected_areas: List[str]
    duplicate_candidates: List[str]
    recommended_actions: List[str]
    test_coverage_gaps: List[str]


# Tools for Bug Analyzer Agent
def classify_severity(
    bug_description: Annotated[str, "Description of the bug"],
    user_impact: Annotated[str, "How the bug affects users"]
) -> str:
    """Classify bug severity based on impact analysis."""
    severity_criteria = {
        "Critical": [
            "data loss", "security breach", "system crash", "production down",
            "payment failure", "authentication bypass", "data corruption"
        ],
        "High": [
            "feature broken", "major functionality", "blocks workflow",
            "affects many users", "no workaround", "performance degradation"
        ],
        "Medium": [
            "partial functionality", "workaround available", "affects some users",
            "minor data issue", "ui glitch with impact"
        ],
        "Low": [
            "cosmetic", "typo", "minor ui", "edge case", "rare occurrence",
            "enhancement", "documentation"
        ]
    }
    
    description_lower = (bug_description + " " + user_impact).lower()
    
    for severity, keywords in severity_criteria.items():
        if any(kw in description_lower for kw in keywords):
            return f"Recommended Severity: {severity}\nMatched criteria: {[kw for kw in keywords if kw in description_lower]}"
    
    return "Recommended Severity: Medium\nNo specific criteria matched - defaulting to Medium"


def analyze_stack_trace(
    stack_trace: Annotated[str, "Error stack trace or console logs"]
) -> str:
    """Analyze stack trace to identify error source."""
    lines = stack_trace.split('\n')
    analysis = {
        "error_type": None,
        "source_file": None,
        "line_number": None,
        "key_frames": []
    }
    
    for line in lines:
        line = line.strip()
        if 'Error:' in line or 'Exception:' in line:
            analysis["error_type"] = line
        elif 'at ' in line and ('.ts' in line or '.js' in line or '.py' in line):
            analysis["key_frames"].append(line)
            if analysis["source_file"] is None:
                # Extract file info
                if ':' in line:
                    parts = line.split(':')
                    analysis["source_file"] = parts[0].split('at ')[-1].strip()
                    if len(parts) > 1:
                        analysis["line_number"] = parts[1].split(')')[0]
    
    return f"""
Stack Trace Analysis:
- Error Type: {analysis['error_type'] or 'Unknown'}
- Source File: {analysis['source_file'] or 'Not identified'}
- Line Number: {analysis['line_number'] or 'Not identified'}
- Key Stack Frames: {analysis['key_frames'][:5]}
"""


def find_related_bugs(
    bug_title: Annotated[str, "Title of the bug to check"],
    bug_component: Annotated[str, "Component where bug was found"]
) -> str:
    """Find potentially related or duplicate bugs."""
    # In a real implementation, this would search a bug database
    # For demo, return simulated related bugs
    return f"""
Potentially Related Bugs for "{bug_title}" in {bug_component}:

1. BUG-001: Login timeout after password reset (Similarity: 75%)
   - Component: Authentication
   - Status: Open
   
2. BUG-002: Search XSS vulnerability (Similarity: 30%)
   - Component: Search
   - Status: Resolved
   
3. BUG-003: Cart quantity negative value (Similarity: 15%)
   - Component: Cart
   - Status: In Progress

Recommendation: Review BUG-001 for potential duplicate.
"""


def suggest_reproduction_steps(
    bug_description: Annotated[str, "Description of the bug"]
) -> str:
    """Suggest systematic reproduction steps based on bug description."""
    return f"""
Suggested Reproduction Steps for: {bug_description[:100]}...

1. **Environment Setup:**
   - Clear browser cache and cookies
   - Use incognito/private browsing mode
   - Document browser version and OS

2. **Pre-conditions:**
   - Ensure clean test data state
   - Log out of all sessions
   - Note current timestamp

3. **Reproduction Sequence:**
   a. Navigate to the affected feature
   b. Perform the triggering action
   c. Observe the behavior
   d. Capture screenshots/video

4. **Verification:**
   - Try on different browsers (Chrome, Firefox, Safari)
   - Test on different devices if applicable
   - Check with different user roles/permissions

5. **Data Collection:**
   - Browser console logs
   - Network tab requests/responses
   - Application state/storage
"""


def estimate_fix_effort(
    bug_category: Annotated[str, "Category of the bug (UI, Backend, Database, etc.)"],
    complexity: Annotated[str, "Estimated complexity (Low, Medium, High)"]
) -> str:
    """Estimate effort required to fix the bug."""
    effort_matrix = {
        ("UI", "Low"): "2-4 hours",
        ("UI", "Medium"): "4-8 hours",
        ("UI", "High"): "1-2 days",
        ("Backend", "Low"): "4-8 hours",
        ("Backend", "Medium"): "1-2 days",
        ("Backend", "High"): "2-5 days",
        ("Database", "Low"): "4-8 hours",
        ("Database", "Medium"): "1-3 days",
        ("Database", "High"): "3-7 days",
        ("Security", "Low"): "1 day",
        ("Security", "Medium"): "2-3 days",
        ("Security", "High"): "1-2 weeks",
    }
    
    estimate = effort_matrix.get((bug_category, complexity), "2-5 days")
    
    return f"""
Fix Effort Estimate:
- Category: {bug_category}
- Complexity: {complexity}
- Estimated Time: {estimate}

Considerations:
- Add 20% buffer for testing and code review
- Security bugs may require additional penetration testing
- Database changes may need migration scripts
"""


class BugAnalyzerAgent:
    """
    AI Agent for analyzing bug reports and providing insights.
    Uses Microsoft Agent Framework with GitHub Models.
    """
    
    SYSTEM_INSTRUCTIONS = """You are an expert Bug Analyst with deep experience in software quality assurance.

Your responsibilities:
1. Analyze bug reports for completeness and clarity
2. Classify bugs by severity and priority
3. Identify potential root causes
4. Find duplicate or related bugs
5. Suggest reproduction steps and test scenarios
6. Recommend fix approaches and estimate effort

Analysis Guidelines:
- Consider user impact when assessing severity
- Look for patterns that might indicate systemic issues
- Check for security implications
- Identify affected test cases that should be updated
- Suggest regression tests to prevent recurrence

Severity Definitions:
- Critical: System down, data loss, security breach
- High: Major feature broken, no workaround
- Medium: Feature impaired, workaround exists
- Low: Minor issue, cosmetic, edge case
"""

    def __init__(self, config: Optional[ModelConfig] = None):
        self.config = config or ModelConfig()
        self._agent = None
        self._client = None
    
    async def _get_agent(self) -> ChatAgent:
        """Get or create the agent instance."""
        if self._agent is None:
            self._client = AsyncOpenAI(
                base_url=self.config.base_url,
                api_key=self.config.api_key,
            )
            
            chat_client = OpenAIChatClient(
                async_client=self._client,
                model_id=self.config.model_id
            )
            
            self._agent = ChatAgent(
                chat_client=chat_client,
                name="BugAnalyzer",
                instructions=self.SYSTEM_INSTRUCTIONS,
                tools=[
                    classify_severity,
                    analyze_stack_trace,
                    find_related_bugs,
                    suggest_reproduction_steps,
                    estimate_fix_effort,
                ]
            )
        
        return self._agent
    
    async def analyze_bug(
        self,
        bug_report: str,
        include_fix_suggestions: bool = True
    ) -> str:
        """
        Analyze a bug report comprehensively.
        
        Args:
            bug_report: The full bug report content
            include_fix_suggestions: Whether to include fix recommendations
            
        Returns:
            Detailed analysis of the bug
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        prompt = f"""Analyze this bug report comprehensively:

{bug_report}

Please provide:
1. **Severity Assessment** - With justification
2. **Priority Recommendation** - Business impact based
3. **Category Classification** - (Security, Functional, Performance, UI, etc.)
4. **Root Cause Hypothesis** - What might be causing this
5. **Affected Areas** - Other features that might be impacted
6. **Reproduction Reliability** - How consistently can this be reproduced
{"7. **Fix Suggestions** - Approaches to resolve this issue" if include_fix_suggestions else ""}
8. **Test Coverage Gaps** - What tests should be added
9. **Related Bugs** - Check for potential duplicates
"""
        
        result = []
        async for chunk in agent.run_stream(prompt, thread=thread):
            if chunk.text:
                result.append(chunk.text)
        
        return "".join(result)
    
    async def compare_bugs(
        self,
        bug1: str,
        bug2: str
    ) -> str:
        """
        Compare two bug reports to check if they're duplicates.
        
        Args:
            bug1: First bug report
            bug2: Second bug report
            
        Returns:
            Comparison analysis and duplicate probability
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        prompt = f"""Compare these two bug reports and determine if they might be duplicates:

**Bug Report 1:**
{bug1}

**Bug Report 2:**
{bug2}

Please analyze:
1. Similarity percentage (0-100%)
2. Common symptoms
3. Differences in manifestation
4. Shared root cause likelihood
5. Recommendation: Duplicate / Related / Distinct
6. If related, should they be linked or merged?
"""
        
        result = []
        async for chunk in agent.run_stream(prompt, thread=thread):
            if chunk.text:
                result.append(chunk.text)
        
        return "".join(result)
    
    async def generate_bug_report(
        self,
        description: str,
        steps_to_reproduce: str,
        environment: str
    ) -> str:
        """
        Generate a complete bug report from basic information.
        
        Args:
            description: Brief description of the issue
            steps_to_reproduce: How to reproduce the bug
            environment: Browser/OS/device information
            
        Returns:
            Formatted bug report ready for submission
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        prompt = f"""Generate a complete, professional bug report from this information:

**Description:** {description}

**Steps to Reproduce:** {steps_to_reproduce}

**Environment:** {environment}

Please create a detailed bug report following best practices including:
- Clear title
- Severity and priority assessment
- Detailed reproduction steps
- Expected vs actual behavior
- Environment details
- Suggested test data
- Screenshots/evidence placeholders
- Related test cases
"""
        
        result = []
        async for chunk in agent.run_stream(prompt, thread=thread):
            if chunk.text:
                result.append(chunk.text)
        
        return "".join(result)
    
    async def prioritize_bugs(
        self,
        bugs: List[str]
    ) -> str:
        """
        Prioritize a list of bugs for the development team.
        
        Args:
            bugs: List of bug descriptions or reports
            
        Returns:
            Prioritized list with justification
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        bugs_formatted = "\n\n".join([f"**Bug {i+1}:**\n{bug}" for i, bug in enumerate(bugs)])
        
        prompt = f"""Prioritize these bugs for the development team:

{bugs_formatted}

Please provide:
1. Prioritized list (highest to lowest priority)
2. Severity rating for each
3. Business impact assessment
4. Recommended sprint allocation
5. Dependencies between bugs (if any)
6. Quick wins that could be fixed first
"""
        
        result = []
        async for chunk in agent.run_stream(prompt, thread=thread):
            if chunk.text:
                result.append(chunk.text)
        
        return "".join(result)


async def main():
    """Demo the Bug Analyzer Agent."""
    from observability import setup_tracing
    from config import TracingConfig
    
    setup_tracing(TracingConfig())
    
    agent = BugAnalyzerAgent()
    
    # Example bug report
    bug_report = """
    # BUG: Login fails after password reset
    
    **Reported By:** QA Tester
    **Date:** 2024-12-25
    
    ## Description
    After resetting password using the forgot password flow, user cannot login
    with the new password. The error message shows "Invalid credentials" even
    though the password was just successfully reset.
    
    ## Steps to Reproduce
    1. Go to login page
    2. Click "Forgot Password"
    3. Enter email: test@example.com
    4. Check email and click reset link
    5. Set new password: NewP@ss123!
    6. Try to login with email and new password
    
    ## Expected Result
    User should be able to login with the new password
    
    ## Actual Result
    Login fails with "Invalid credentials" error
    
    ## Environment
    - Browser: Chrome 120.0
    - OS: Windows 11
    - URL: https://staging.example.com
    """
    
    print("🔍 Analyzing bug report...\n")
    analysis = await agent.analyze_bug(bug_report)
    print(analysis)


if __name__ == "__main__":
    asyncio.run(main())
