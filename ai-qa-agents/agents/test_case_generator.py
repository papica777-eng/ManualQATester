"""
Test Case Generator Agent
Generates comprehensive test cases from requirements or user stories
"""
import asyncio
from typing import Annotated, Optional, List
from dataclasses import dataclass
from datetime import datetime

from agent_framework import ChatAgent
from agent_framework.openai import OpenAIChatClient
from openai import AsyncOpenAI

from config import QAConfig, ModelConfig


@dataclass
class GeneratedTestCase:
    """Generated test case structure"""
    id: str
    title: str
    priority: str
    type: str
    component: str
    preconditions: List[str]
    steps: List[dict]
    expected_results: List[str]
    notes: List[str]


# Tools for Test Case Generator Agent
def analyze_requirements(
    requirement_text: Annotated[str, "The requirement or user story text to analyze"]
) -> str:
    """Analyze a requirement to identify testable scenarios."""
    return f"""
    Analyzed requirement: {requirement_text[:200]}...
    
    Identified test scenarios:
    1. Happy path - normal flow
    2. Edge cases - boundary conditions
    3. Error handling - invalid inputs
    4. Security - authentication/authorization
    5. Performance - response times
    6. Usability - user experience
    """


def get_test_case_template() -> str:
    """Get the standard test case template format."""
    return """
# TC-{id}: {title}

**Priority:** {priority}  
**Type:** {type}  
**Component:** {component}

## Preconditions
{preconditions}

## Test Steps
| Step | Action | Test Data |
|------|--------|-----------|
{steps}

## Expected Result
{expected_results}

## Notes
{notes}
"""


def suggest_test_data(
    field_type: Annotated[str, "Type of field (email, password, number, text, date)"],
    test_type: Annotated[str, "Type of test (valid, invalid, boundary, empty)"]
) -> str:
    """Suggest appropriate test data based on field type and test scenario."""
    test_data = {
        "email": {
            "valid": ["user@example.com", "test.user+tag@domain.co.uk"],
            "invalid": ["notanemail", "@nodomain.com", "user@.com", "user@domain"],
            "boundary": ["a@b.co", "x" * 250 + "@test.com"],
            "empty": ["", "   ", None]
        },
        "password": {
            "valid": ["SecureP@ss123!", "MyP@ssw0rd2024"],
            "invalid": ["123", "nospecialchar", "NOLOWERCASE1!"],
            "boundary": ["Ab1!", "A" * 128 + "1!a"],
            "empty": ["", "   ", None]
        },
        "number": {
            "valid": ["1", "100", "999999"],
            "invalid": ["abc", "12.34.56", "-1e999"],
            "boundary": ["0", "-2147483648", "2147483647"],
            "empty": ["", None]
        },
        "text": {
            "valid": ["Normal text", "Text with números 123"],
            "invalid": ["<script>alert('xss')</script>", "'; DROP TABLE users;--"],
            "boundary": ["a", "x" * 1000],
            "empty": ["", "   ", None]
        },
        "date": {
            "valid": ["2024-01-15", "2024-12-31"],
            "invalid": ["2024-13-01", "2024-02-30", "not-a-date"],
            "boundary": ["1900-01-01", "2099-12-31"],
            "empty": ["", None]
        }
    }
    
    data = test_data.get(field_type, test_data["text"])
    return f"Suggested {test_type} test data for {field_type}: {data.get(test_type, data['valid'])}"


def categorize_test_case(
    description: Annotated[str, "Test case description"]
) -> str:
    """Categorize a test case by type and priority."""
    categories = {
        "security": ["sql injection", "xss", "authentication", "authorization", "password", "token"],
        "performance": ["load", "response time", "timeout", "concurrent", "stress"],
        "functional": ["login", "submit", "create", "update", "delete", "search"],
        "usability": ["accessibility", "navigation", "responsive", "error message"],
        "integration": ["api", "database", "third-party", "webhook"]
    }
    
    description_lower = description.lower()
    for category, keywords in categories.items():
        if any(kw in description_lower for kw in keywords):
            priority = "High" if category in ["security", "functional"] else "Medium"
            return f"Category: {category.title()}, Suggested Priority: {priority}"
    
    return "Category: Functional, Suggested Priority: Medium"


class TestCaseGeneratorAgent:
    """
    AI Agent for generating comprehensive test cases.
    Uses Microsoft Agent Framework with GitHub Models.
    """
    
    SYSTEM_INSTRUCTIONS = """You are an expert QA Test Engineer specializing in creating comprehensive test cases.

Your responsibilities:
1. Analyze requirements and user stories to identify all testable scenarios
2. Generate detailed test cases with clear steps and expected results
3. Include positive, negative, edge cases, and security scenarios
4. Suggest appropriate test data for different scenarios
5. Prioritize test cases based on risk and business impact

Test Case Format Guidelines:
- Use clear, action-oriented language
- Each step should be atomic and verifiable
- Include specific test data values
- Expected results should be measurable
- Add relevant notes about browser compatibility, prerequisites, etc.

Categories to consider:
- Happy Path (normal flow)
- Error Handling (invalid inputs, system errors)
- Edge Cases (boundaries, limits)
- Security (XSS, SQL injection, authentication)
- Performance (timeouts, concurrent users)
- Usability (accessibility, responsive design)
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
                name="TestCaseGenerator",
                instructions=self.SYSTEM_INSTRUCTIONS,
                tools=[
                    analyze_requirements,
                    get_test_case_template,
                    suggest_test_data,
                    categorize_test_case,
                ]
            )
        
        return self._agent
    
    async def generate_test_cases(
        self,
        requirement: str,
        component: str = "General",
        count: int = 5,
        include_negative: bool = True,
        include_security: bool = True
    ) -> str:
        """
        Generate test cases from a requirement.
        
        Args:
            requirement: The requirement or user story text
            component: Component/module being tested
            count: Number of test cases to generate
            include_negative: Include negative test cases
            include_security: Include security test cases
            
        Returns:
            Generated test cases in markdown format
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        prompt = f"""Generate {count} comprehensive test cases for the following requirement:

**Component:** {component}
**Requirement:** {requirement}

Requirements:
- Include positive/happy path test cases
{"- Include negative/error handling test cases" if include_negative else ""}
{"- Include security-focused test cases" if include_security else ""}
- Use the standard test case template format
- Suggest specific test data values
- Prioritize by risk level

Please generate the test cases in markdown format, ready to save as individual files.
"""
        
        result = []
        async for chunk in agent.run_stream(prompt, thread=thread):
            if chunk.text:
                result.append(chunk.text)
        
        return "".join(result)
    
    async def enhance_test_case(
        self,
        existing_test_case: str,
        enhancement_type: str = "all"
    ) -> str:
        """
        Enhance an existing test case with additional scenarios.
        
        Args:
            existing_test_case: The current test case content
            enhancement_type: Type of enhancement (edge_cases, security, performance, all)
            
        Returns:
            Enhanced test case or additional related test cases
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        prompt = f"""Review and enhance this existing test case:

{existing_test_case}

Enhancement focus: {enhancement_type}

Please:
1. Identify any gaps in the current test case
2. Suggest additional test steps or scenarios
3. Add edge cases that might be missing
4. Recommend additional test data variations
5. Generate complementary test cases if appropriate
"""
        
        result = []
        async for chunk in agent.run_stream(prompt, thread=thread):
            if chunk.text:
                result.append(chunk.text)
        
        return "".join(result)
    
    async def generate_from_code(
        self,
        code_snippet: str,
        language: str = "typescript"
    ) -> str:
        """
        Generate test cases by analyzing code.
        
        Args:
            code_snippet: Source code to analyze
            language: Programming language
            
        Returns:
            Generated test cases based on code analysis
        """
        agent = await self._get_agent()
        thread = agent.get_new_thread()
        
        prompt = f"""Analyze this {language} code and generate test cases:

```{language}
{code_snippet}
```

Please:
1. Identify all functions/methods that need testing
2. Generate test cases for each public method
3. Include boundary testing for any parameters
4. Add error handling scenarios
5. Consider any async/promise handling if applicable
"""
        
        result = []
        async for chunk in agent.run_stream(prompt, thread=thread):
            if chunk.text:
                result.append(chunk.text)
        
        return "".join(result)


async def main():
    """Demo the Test Case Generator Agent."""
    from observability import setup_tracing
    from config import TracingConfig
    
    # Setup tracing (optional - for debugging)
    setup_tracing(TracingConfig())
    
    agent = TestCaseGeneratorAgent()
    
    # Example: Generate test cases for a login feature
    requirement = """
    As a user, I want to log in to my account using email and password,
    so that I can access my personalized dashboard.
    
    Acceptance Criteria:
    - User can enter email and password
    - System validates credentials against database
    - Successful login redirects to dashboard
    - Failed login shows error message
    - After 5 failed attempts, account is locked for 30 minutes
    - Password field should be masked
    """
    
    print("🧪 Generating test cases...\n")
    test_cases = await agent.generate_test_cases(
        requirement=requirement,
        component="Authentication - Login",
        count=5,
        include_negative=True,
        include_security=True
    )
    
    print(test_cases)


if __name__ == "__main__":
    asyncio.run(main())
