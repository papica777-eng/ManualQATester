"""
Evaluation Framework for AI QA Agents
Measures quality of generated test cases, bug analyses, and recommendations
"""
import os
import json
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

# Note: For full evaluation, install azure-ai-evaluation
# pip install azure-ai-evaluation


@dataclass
class EvaluationResult:
    """Result of an evaluation run"""
    evaluator_name: str
    score: float
    reasoning: str
    details: Dict[str, Any]


class TestCaseQualityEvaluator:
    """
    Evaluates the quality of generated test cases.
    
    Metrics:
    - Completeness: Are all required sections present?
    - Clarity: Are steps clear and actionable?
    - Coverage: Does it cover positive, negative, and edge cases?
    - Test Data: Is appropriate test data provided?
    """
    
    def __init__(self):
        self.required_sections = [
            "title", "priority", "preconditions", 
            "steps", "expected", "test_data"
        ]
    
    def __call__(
        self,
        *,
        test_case: str,
        requirement: str = "",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Evaluate a test case.
        
        Args:
            test_case: The generated test case content
            requirement: Original requirement (for relevance checking)
            
        Returns:
            Evaluation scores and feedback
        """
        scores = {
            "completeness": self._check_completeness(test_case),
            "clarity": self._check_clarity(test_case),
            "coverage": self._check_coverage(test_case),
            "test_data_quality": self._check_test_data(test_case),
        }
        
        overall_score = sum(scores.values()) / len(scores)
        
        return {
            "test_case_quality": overall_score,
            "completeness_score": scores["completeness"],
            "clarity_score": scores["clarity"],
            "coverage_score": scores["coverage"],
            "test_data_score": scores["test_data_quality"],
            "feedback": self._generate_feedback(scores),
        }
    
    def _check_completeness(self, test_case: str) -> float:
        """Check if all required sections are present."""
        tc_lower = test_case.lower()
        found = sum(1 for section in self.required_sections if section in tc_lower)
        return found / len(self.required_sections)
    
    def _check_clarity(self, test_case: str) -> float:
        """Check if steps are clear and actionable."""
        # Check for action verbs
        action_verbs = ["click", "enter", "verify", "navigate", "select", "check", "wait", "scroll"]
        verb_count = sum(1 for verb in action_verbs if verb in test_case.lower())
        
        # Check for numbered steps
        has_numbered_steps = any(f"{i}." in test_case or f"| {i} |" in test_case for i in range(1, 10))
        
        score = min(1.0, verb_count / 5) * 0.6 + (0.4 if has_numbered_steps else 0)
        return score
    
    def _check_coverage(self, test_case: str) -> float:
        """Check for coverage of different test types."""
        tc_lower = test_case.lower()
        coverage_indicators = {
            "positive": ["valid", "correct", "success", "happy path"],
            "negative": ["invalid", "error", "fail", "incorrect", "wrong"],
            "edge": ["boundary", "edge", "limit", "maximum", "minimum", "empty"],
            "security": ["injection", "xss", "security", "authentication"],
        }
        
        found_types = 0
        for test_type, keywords in coverage_indicators.items():
            if any(kw in tc_lower for kw in keywords):
                found_types += 1
        
        return found_types / len(coverage_indicators)
    
    def _check_test_data(self, test_case: str) -> float:
        """Check if appropriate test data is provided."""
        # Look for specific test data patterns
        has_email = "@" in test_case and ".com" in test_case
        has_specific_values = any(char.isdigit() for char in test_case)
        has_data_table = "|" in test_case and "---" in test_case
        
        score = 0.0
        if has_email:
            score += 0.3
        if has_specific_values:
            score += 0.3
        if has_data_table:
            score += 0.4
        
        return min(1.0, score)
    
    def _generate_feedback(self, scores: Dict[str, float]) -> str:
        """Generate improvement feedback based on scores."""
        feedback = []
        
        if scores["completeness"] < 0.8:
            feedback.append("Add missing sections: preconditions, expected results, or test data")
        
        if scores["clarity"] < 0.7:
            feedback.append("Use more action verbs and numbered steps for clarity")
        
        if scores["coverage"] < 0.5:
            feedback.append("Include negative, edge case, or security scenarios")
        
        if scores["test_data_quality"] < 0.6:
            feedback.append("Provide specific test data values instead of placeholders")
        
        return "; ".join(feedback) if feedback else "Good quality test case!"


class BugReportQualityEvaluator:
    """
    Evaluates the quality of bug reports.
    
    Metrics:
    - Reproducibility: Can the bug be reproduced from the report?
    - Completeness: All required fields present?
    - Clarity: Clear description and steps?
    - Evidence: Screenshots, logs, or other evidence?
    """
    
    def __init__(self):
        self.required_fields = [
            "title", "steps", "expected", "actual",
            "environment", "severity"
        ]
    
    def __call__(
        self,
        *,
        bug_report: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Evaluate a bug report."""
        scores = {
            "reproducibility": self._check_reproducibility(bug_report),
            "completeness": self._check_completeness(bug_report),
            "clarity": self._check_clarity(bug_report),
            "evidence": self._check_evidence(bug_report),
        }
        
        overall_score = sum(scores.values()) / len(scores)
        
        return {
            "bug_report_quality": overall_score,
            "reproducibility_score": scores["reproducibility"],
            "completeness_score": scores["completeness"],
            "clarity_score": scores["clarity"],
            "evidence_score": scores["evidence"],
            "feedback": self._generate_feedback(scores),
        }
    
    def _check_reproducibility(self, bug_report: str) -> float:
        """Check if steps to reproduce are clear."""
        br_lower = bug_report.lower()
        
        has_numbered_steps = any(f"{i}." in bug_report for i in range(1, 10))
        has_url = "http" in br_lower or "url" in br_lower
        has_test_data = "@" in bug_report or "password" in br_lower
        has_specific_actions = any(
            action in br_lower 
            for action in ["click", "enter", "navigate", "select", "submit"]
        )
        
        score = 0.0
        if has_numbered_steps:
            score += 0.3
        if has_url:
            score += 0.2
        if has_test_data:
            score += 0.25
        if has_specific_actions:
            score += 0.25
        
        return score
    
    def _check_completeness(self, bug_report: str) -> float:
        """Check if all required fields are present."""
        br_lower = bug_report.lower()
        found = sum(1 for field in self.required_fields if field in br_lower)
        return found / len(self.required_fields)
    
    def _check_clarity(self, bug_report: str) -> float:
        """Check for clear writing."""
        # Simple heuristics for clarity
        lines = bug_report.strip().split('\n')
        non_empty_lines = [l for l in lines if l.strip()]
        
        has_headers = any(l.startswith('#') or l.startswith('**') for l in lines)
        good_length = 10 < len(non_empty_lines) < 100
        has_expected_actual = "expected" in bug_report.lower() and "actual" in bug_report.lower()
        
        score = 0.0
        if has_headers:
            score += 0.3
        if good_length:
            score += 0.3
        if has_expected_actual:
            score += 0.4
        
        return score
    
    def _check_evidence(self, bug_report: str) -> float:
        """Check for evidence like screenshots or logs."""
        br_lower = bug_report.lower()
        
        has_screenshot_ref = any(
            kw in br_lower 
            for kw in ["screenshot", "image", ".png", ".jpg", "attached"]
        )
        has_logs = any(
            kw in br_lower 
            for kw in ["console", "error:", "stack trace", "log", "```"]
        )
        has_network = "network" in br_lower or "request" in br_lower
        
        score = 0.0
        if has_screenshot_ref:
            score += 0.4
        if has_logs:
            score += 0.4
        if has_network:
            score += 0.2
        
        return score
    
    def _generate_feedback(self, scores: Dict[str, float]) -> str:
        """Generate improvement feedback."""
        feedback = []
        
        if scores["reproducibility"] < 0.7:
            feedback.append("Add more specific reproduction steps with exact data")
        
        if scores["completeness"] < 0.8:
            feedback.append("Include all required fields: severity, environment, expected/actual results")
        
        if scores["clarity"] < 0.7:
            feedback.append("Use headers and clearly separate expected vs actual behavior")
        
        if scores["evidence"] < 0.5:
            feedback.append("Add screenshots, console logs, or network traces")
        
        return "; ".join(feedback) if feedback else "Comprehensive bug report!"


class SeverityAccuracyEvaluator:
    """
    Evaluates if bug severity assessments are accurate.
    Compares AI-suggested severity against ground truth or criteria.
    """
    
    def __init__(self):
        self.severity_weights = {
            "critical": 4,
            "high": 3,
            "medium": 2,
            "low": 1
        }
    
    def __call__(
        self,
        *,
        predicted_severity: str,
        actual_severity: str,
        bug_description: str = "",
        **kwargs
    ) -> Dict[str, Any]:
        """Evaluate severity prediction accuracy."""
        predicted = predicted_severity.lower()
        actual = actual_severity.lower()
        
        pred_weight = self.severity_weights.get(predicted, 2)
        actual_weight = self.severity_weights.get(actual, 2)
        
        # Calculate how far off the prediction is
        diff = abs(pred_weight - actual_weight)
        accuracy = max(0, 1 - (diff / 3))  # Max diff is 3 (critical vs low)
        
        return {
            "severity_accuracy": accuracy,
            "predicted": predicted,
            "actual": actual,
            "off_by_levels": diff,
            "direction": "overestimated" if pred_weight > actual_weight else (
                "underestimated" if pred_weight < actual_weight else "correct"
            )
        }


def run_evaluation(
    data_path: str,
    evaluators: Dict[str, Any],
    output_path: str = "evaluation_results.json"
) -> Dict[str, Any]:
    """
    Run evaluation using multiple evaluators.
    
    Args:
        data_path: Path to JSONL data file
        evaluators: Dictionary of evaluator name -> evaluator instance
        output_path: Where to save results
        
    Returns:
        Evaluation results with metrics
    """
    import jsonlines
    
    results = {
        "row_results": [],
        "aggregate_metrics": {}
    }
    
    # Read data
    with jsonlines.open(data_path) as reader:
        data = list(reader)
    
    # Run evaluators on each row
    for row in data:
        row_result = {"input": row}
        
        for eval_name, evaluator in evaluators.items():
            try:
                eval_result = evaluator(**row)
                row_result[eval_name] = eval_result
            except Exception as e:
                row_result[eval_name] = {"error": str(e)}
        
        results["row_results"].append(row_result)
    
    # Calculate aggregate metrics
    for eval_name in evaluators.keys():
        scores = []
        for row in results["row_results"]:
            if eval_name in row and "error" not in row[eval_name]:
                # Get the main score (first numeric value)
                for key, value in row[eval_name].items():
                    if isinstance(value, (int, float)) and "score" in key.lower():
                        scores.append(value)
                        break
        
        if scores:
            results["aggregate_metrics"][eval_name] = {
                "mean": sum(scores) / len(scores),
                "min": min(scores),
                "max": max(scores),
                "count": len(scores)
            }
    
    # Save results
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    return results


# Example usage and demo
if __name__ == "__main__":
    # Create evaluators
    tc_evaluator = TestCaseQualityEvaluator()
    bug_evaluator = BugReportQualityEvaluator()
    
    # Example test case
    sample_test_case = """
    # TC-001: Valid Login with Correct Credentials
    
    **Priority:** High
    **Type:** Positive
    
    ## Preconditions
    - User account exists: testuser@example.com
    
    ## Test Steps
    | Step | Action | Test Data |
    |------|--------|-----------|
    | 1 | Navigate to login page | https://example.com/login |
    | 2 | Enter valid email | testuser@example.com |
    | 3 | Enter valid password | SecureP@ss123! |
    | 4 | Click Login button | - |
    
    ## Expected Result
    - User is redirected to dashboard
    - Welcome message displayed
    """
    
    # Evaluate
    tc_result = tc_evaluator(test_case=sample_test_case)
    print("Test Case Evaluation:")
    print(json.dumps(tc_result, indent=2))
    
    # Example bug report
    sample_bug = """
    # BUG: Login fails after password reset
    
    **Severity:** High
    
    ## Steps to Reproduce
    1. Navigate to https://example.com/login
    2. Click "Forgot Password"
    3. Enter email: test@example.com
    4. Reset password to: NewP@ss123!
    5. Try to login with new password
    
    ## Expected Result
    User should be able to login
    
    ## Actual Result
    Login fails with "Invalid credentials" error
    
    ## Environment
    - Chrome 120.0
    - Windows 11
    
    ## Console Logs
    ```
    Error: Authentication failed
    ```
    """
    
    bug_result = bug_evaluator(bug_report=sample_bug)
    print("\nBug Report Evaluation:")
    print(json.dumps(bug_result, indent=2))
