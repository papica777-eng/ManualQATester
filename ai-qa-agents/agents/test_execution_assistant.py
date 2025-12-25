"""
Test Execution Assistant Agent
Helps manage and track manual test execution, generates reports
"""
import asyncio
from typing import Annotated, Optional, List, Dict
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

from agent_framework import ChatAgent
from agent_framework.openai import OpenAIChatClient
from openai import AsyncOpenAI

from config import ModelConfig


class TestStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    FAILED = "failed"
    BLOCKED = "blocked"
    SKIPPED = "skipped"


@dataclass
class TestExecution:
    """Test execution record"""
    test_case_id: str
    status: TestStatus
    executed_by: str
    executed_at: datetime
    duration_minutes: int
    notes: str
    defects_found: List[str] = field(default_factory=list)


# Tools for Test Execution Assistant
def get_test_execution_status(
    test_plan_id: Annotated[str, "ID of the test plan to check"]
) -> str:
    """Get current execution status of a test plan."""
    # Simulated data - in real implementation would query database
    return f"""
Test Plan: {test_plan_id}
Execution Status Summary:
- Total Test Cases: 25
- Passed: 18 (72%)
- Failed: 3 (12%)
- Blocked: 2 (8%)
- Not Started: 2 (8%)

Failed Tests:
- TC-002: Invalid credentials handling
- TC-007: Advanced filters not working
- TC-015: Checkout timeout

Blocked Tests:
- TC-020: Requires VPN access
- TC-021: Depends on TC-020

Priority for Today:
1. Investigate TC-002 failure
2. Resolve blocker for TC-020
3. Complete remaining tests
"""


def calculate_test_coverage(
    feature: Annotated[str, "Feature or module to analyze"]
) -> str:
    """Calculate test coverage for a feature."""
    return f"""
Test Coverage Analysis for: {feature}

Coverage Metrics:
- Requirements Coverage: 85%
- Code Path Coverage: 72%
- Edge Case Coverage: 60%
- Security Test Coverage: 45%

Coverage Gaps Identified:
1. Missing negative tests for input validation
2. No performance tests for concurrent users
3. Limited mobile device testing
4. Missing accessibility tests

Recommendations:
- Add 5 negative test cases for input fields
- Create load test with 100 concurrent users
- Add Safari and mobile Chrome tests
- Include WCAG 2.1 compliance checks
"""


def suggest_next_test(
    current_progress: Annotated[str, "Current testing progress description"],
    priorities: Annotated[str, "Current priority areas"]
) -> str:
    """Suggest which test to execute next based on priority and dependencies."""
    return f"""
Based on current progress: {current_progress[:100]}...
And priorities: {priorities[:100]}...

Recommended Next Tests (in order):

1. **TC-003: Password Reset Flow** (High Priority)
   - Reason: Security-critical functionality
   - Estimated time: 15 minutes
   - No blockers

2. **TC-008: Empty Search Results** (Medium Priority)
   - Reason: Unblocks UX testing
   - Estimated time: 10 minutes
   - No blockers

3. **TC-005: SQL Injection Attempt** (High Priority)
   - Reason: Security test pending
   - Estimated time: 20 minutes
   - No blockers

Tip: Complete security tests before end of sprint!
"""


def generate_test_summary(
    results: Annotated[str, "Test execution results data"]
) -> str:
    """Generate an executive summary of test results."""
    return f"""
# Test Execution Summary Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Executive Summary
Testing completed for Sprint 24 with overall **PASS** status.
System is ready for UAT with minor issues noted.

## Key Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Pass Rate | 85% | 80% | ✅ |
| Critical Bugs | 0 | 0 | ✅ |
| High Bugs | 2 | <3 | ✅ |
| Test Coverage | 78% | 75% | ✅ |

## Risk Assessment
- **Low Risk**: Core functionality stable
- **Medium Risk**: Performance under load not fully tested
- **Action Required**: Address 2 high-priority bugs before release

## Recommendations
1. Fix login timeout issue (BUG-001) before UAT
2. Enhance search filter tests
3. Schedule performance test for next sprint
"""


def track_defect(
    test_case_id: Annotated[str, "Test case that found the defect"],
    defect_description: Annotated[str, "Description of the defect found"]
) -> str:
    """Track a new defect found during test execution."""
    bug_id = f"BUG-{datetime.now().strftime('%Y%m%d%H%M')}"
    return f"""
Defect Tracked Successfully!

Bug ID: {bug_id}
Found In: {test_case_id}
Description: {defect_description}

Auto-generated bug report created at: bug-reports/{bug_id}.md

Next Steps:
1. Review auto-generated bug report
2. Add screenshots if available
3. Assign to development team
4. Link to test case {test_case_id}

Tip: Run Bug Analyzer agent for severity assessment
"""


class TestExecutionAssistant:
    """
    AI Agent for assisting with test execution and reporting.
    Uses Microsoft Agent Framework with GitHub Models.
    """
    
    SYSTEM_INSTRUCTIONS = """You are a Test Execution Assistant helping QA teams manage their testing activities.

Your responsibilities:
1. Track test execution progress
2. Suggest which tests to run next based on priorities
3. Generate test execution reports
4. Help document defects found during testing
5. Calculate and report test coverage
6. Provide recommendations for improving test quality

Communication Style:
- Be concise but thorough
- Use bullet points for clarity
- Highlight critical issues prominently
- Provide actionable recommendations
- Use emojis sparingly for visual clarity (✅, ⚠️, ❌)

Testing Best Practices to Encourage:
- Execute high-priority tests first
- Document all defects immediately
- Take screenshots for failures
- Note environment details
- Track execution time for planning
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
                name="TestExecutionAssistant",
                instructions=self.SYSTEM_INSTRUCTIONS,
                tools=[
                    get_test_execution_status,
                    calculate_test_coverage,
                    suggest_next_test,
                    generate_test_summary,
                    track_defect,
                ]
            )
        
        return self._agent
    
    async def get_execution_guidance(
        self,
        test_plan: str,
        time_available: str,
        priorities: str
    ) -> str:
        """
        Get guidance on test execution based on constraints.
        
        Args:
            test_plan: Test plan identifier or description
            time_available: How much time is available for testing
            priorities: Current priority areas
            
        Returns:
            Recommended execution approach
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        prompt = f"""Help me plan my test execution session:

**Test Plan:** {test_plan}
**Time Available:** {time_available}
**Priorities:** {priorities}

Please provide:
1. Recommended test execution order
2. Time estimates for each test
3. Risk-based prioritization
4. What to skip if time runs short
5. Key areas that must be covered
"""
        
        result = []
        async for chunk in agent.run_stream(prompt, thread=thread):
            if chunk.text:
                result.append(chunk.text)
        
        return "".join(result)
    
    async def generate_daily_report(
        self,
        tests_executed: List[dict],
        defects_found: List[str],
        blockers: List[str]
    ) -> str:
        """
        Generate a daily test execution report.
        
        Args:
            tests_executed: List of tests run today with results
            defects_found: List of defects found
            blockers: List of blocking issues
            
        Returns:
            Formatted daily report
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        prompt = f"""Generate a daily test execution report:

**Tests Executed Today:**
{tests_executed}

**Defects Found:**
{defects_found}

**Blockers:**
{blockers}

Please create a comprehensive daily report including:
1. Executive summary
2. Test execution statistics
3. Defect summary with severity
4. Blocker status and resolution plans
5. Tomorrow's priorities
6. Risks and recommendations
"""
        
        result = []
        async for chunk in agent.run_stream(prompt, thread=thread):
            if chunk.text:
                result.append(chunk.text)
        
        return "".join(result)
    
    async def analyze_failure(
        self,
        test_case: str,
        expected_result: str,
        actual_result: str,
        error_logs: str = ""
    ) -> str:
        """
        Analyze a test failure and suggest next steps.
        
        Args:
            test_case: The test case that failed
            expected_result: What was expected
            actual_result: What actually happened
            error_logs: Any error messages or logs
            
        Returns:
            Analysis and recommended actions
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        prompt = f"""Analyze this test failure:

**Test Case:** {test_case}

**Expected Result:**
{expected_result}

**Actual Result:**
{actual_result}

**Error Logs:**
{error_logs if error_logs else "No error logs provided"}

Please provide:
1. Root cause analysis
2. Is this a bug or test environment issue?
3. Severity assessment if it's a bug
4. Recommended next steps
5. Should this block the release?
6. Suggested workaround if any
"""
        
        result = []
        async for chunk in agent.run_stream(prompt, thread=thread):
            if chunk.text:
                result.append(chunk.text)
        
        return "".join(result)
    
    async def interactive_session(self):
        """
        Start an interactive test execution session.
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        print("\n🧪 Test Execution Assistant")
        print("=" * 50)
        print("I'll help you manage your testing session.")
        print("Type 'quit' to exit.\n")
        
        # Initial greeting
        greeting = []
        async for chunk in agent.run_stream(
            "Hello! I'm starting a new testing session. What test plan are we working on today?",
            thread=thread
        ):
            if chunk.text:
                greeting.append(chunk.text)
        print(f"Assistant: {''.join(greeting)}\n")
        
        while True:
            user_input = input("You: ").strip()
            
            if user_input.lower() == 'quit':
                print("\n👋 Session ended. Good testing!")
                break
            
            if not user_input:
                continue
            
            response = []
            print("Assistant: ", end="", flush=True)
            async for chunk in agent.run_stream(user_input, thread=thread):
                if chunk.text:
                    print(chunk.text, end="", flush=True)
                    response.append(chunk.text)
            print("\n")


async def main():
    """Demo the Test Execution Assistant."""
    from observability import setup_tracing
    from config import TracingConfig
    
    setup_tracing(TracingConfig())
    
    agent = TestExecutionAssistant()
    
    # Example: Get execution guidance
    guidance = await agent.get_execution_guidance(
        test_plan="Authentication Test Plan v1.0",
        time_available="4 hours",
        priorities="Security tests, Login functionality, Password reset"
    )
    
    print("📋 Test Execution Guidance:\n")
    print(guidance)


if __name__ == "__main__":
    asyncio.run(main())
