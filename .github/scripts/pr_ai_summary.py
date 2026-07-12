import json
import logging
import os
import re
import sys
import urllib.request
import urllib.error
from contextlib import contextmanager
from typing import Any

import httpx
from openai import (
    APIConnectionError,
    APIStatusError,
    BadRequestError,
    InternalServerError,
    OpenAI,
)

logging.basicConfig(level=logging.INFO, format="[pr-ai] %(message)s", stream=sys.stdout)
logger = logging.getLogger(__name__)

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "pr_ai_config.json")
with open(CONFIG_PATH) as _f:
    CONFIG = json.load(_f)


def gha_warning(message: str) -> None:
    print(f"::warning::{message}", flush=True)


def gha_error(message: str) -> None:
    print(f"::error::{message}", flush=True)


@contextmanager
def gha_group(title: str):
    print(f"::group::{title}", flush=True)
    try:
        yield
    finally:
        print("::endgroup::", flush=True)


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def normalize_base_url(url: str) -> str:
    base = url.rstrip("/")
    if base.endswith("/chat/completions"):
        base = base[: -len("/chat/completions")]
    if not (base.endswith("/api/v1") or base.endswith("/v1")):
        base = base + "/v1"
    return base


def trim_text(value: str, limit: int) -> str:
    if len(value) <= limit:
        return value
    return value[:limit] + "\n\n[truncated]"


def strip_think_blocks(text: str) -> str:
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def extract_message_content(message: Any) -> str:
    content = getattr(message, "content", "")
    if isinstance(content, str):
        return strip_think_blocks(content.strip())
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                text = item.get("text") or item.get("content") or ""
            else:
                text = getattr(item, "text", "") or getattr(item, "content", "") or ""
            if text:
                parts.append(str(text))
        return strip_think_blocks("\n".join(parts).strip())
    return strip_think_blocks(str(content).strip()) if content else ""


def gh_request(url: str, token: str, accept: str) -> str:
    logger.info("GitHub request: %s", url)
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": accept,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "curriculum-v-pr-ai-summary",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode("utf-8", errors="replace")


def gh_request_json(url: str, token: str) -> Any:
    return json.loads(gh_request(url, token=token, accept="application/vnd.github+json"))


def gh_paginated_request_json(url: str, token: str) -> list[Any]:
    page = 1
    results: list[Any] = []
    while True:
        separator = "&" if "?" in url else "?"
        page_url = f"{url}{separator}per_page=100&page={page}"
        page_data = gh_request_json(page_url, token=token)
        if not page_data:
            break
        results.extend(page_data)
        if len(page_data) < 100:
            break
        page += 1
    return results


def make_pr_prompt(diff: str) -> str:
    return (
        "Analyze this full PR diff and produce a polished, concise PR review in "
        "GitHub-flavored markdown. You MUST use this exact structure:\n\n"
        "### 📋 Summary of Changes\n"
        "| File | Change | Purpose |\n"
        "|------|--------|---------|\n"
        "| ... | ... | ... |\n\n"
        "### ⚠️ Risks & Regression Areas\n"
        "(bullet list, one emoji per item indicating severity 🔴🟠🟡⚪)\n\n"
        "### 🚀 Post-Deployment Test Plan\n"
        "How the running app should be verified AFTER it is deployed. Prefer concrete, "
        "actionable checks.\n"
        "| Check | How to verify | Expected result |\n"
        "|-------|---------------|-----------------|\n"
        "| ... | ... | ... |\n\n"
        "Rules: emoji in every heading, use markdown tables, keep it concise. "
        "Do not include any thinking or reasoning preamble — output the markdown directly.\n\n"
        "Full PR diff:\n\n" + diff
    )


def deterministic_fallback_summary(changed_files: list[str], diff: str) -> str:
    files_list = "\n".join(f"- `{path}`" for path in changed_files[:15]) or "- No file list available"
    excerpt = trim_text(diff.strip(), 1500) if diff.strip() else "No diff patch was available."
    return (
        "### 📋 Summary of Changes\n\n"
        "Automatic AI analysis was unavailable, so this is a deterministic fallback "
        "based on the changed files.\n\n"
        f"**Changed files:**\n{files_list}\n\n"
        "### ⚠️ Risks & Regression Areas\n\n"
        "- ⚪ Review the touched files manually; model impact analysis was not produced.\n\n"
        "### 🚀 Post-Deployment Test Plan\n\n"
        "- Exercise the code paths related to the files above and validate any changed "
        "API endpoints or behaviours after deployment.\n\n"
        f"<details><summary>Patch excerpt</summary>\n\n```diff\n{excerpt}\n```\n</details>"
    )


def is_context_size_error(exc: BadRequestError) -> bool:
    try:
        message = str(exc).lower()
        if "context size" in message or "exceeds the available context size" in message:
            return True
        error = exc.body.get("error", {}) if isinstance(exc.body, dict) else {}
        message = str(error.get("message", "")).lower()
        return "context size" in message or "exceeds the available context size" in message
    except Exception:
        return False


def resolve_model_name(client: OpenAI, requested_model: str) -> str:
    try:
        models = client.models.list()
        available = [getattr(item, "id", "") for item in getattr(models, "data", [])]
        available = [name for name in available if name]
    except Exception as exc:
        logger.warning("Could not fetch model list from provider: %s", exc)
        return requested_model

    if not available:
        return requested_model
    logger.info("Available models from provider: %s", ", ".join(available))
    if not requested_model or requested_model not in available:
        logger.info("Auto-selecting model: %s", available[0])
        return available[0]
    return requested_model


def generate_markdown(client: OpenAI, prompt: str, changed_files: list[str], diff: str, model: str) -> str:
    system_prompt = CONFIG["system_prompt"]
    retry_system_prompt = CONFIG["retry_system_prompt"]
    attempt_limits = CONFIG["prompt_attempt_limits"]

    prompt_attempts: list[str] = []
    for limit in attempt_limits:
        candidate = trim_text(prompt, limit) + "\n\nRespond with concise markdown only."
        if candidate not in prompt_attempts:
            prompt_attempts.append(candidate)

    for index, candidate_prompt in enumerate(prompt_attempts):
        logger.info("LLM attempt %d/%d (prompt length %d)", index + 1, len(prompt_attempts), len(candidate_prompt))
        try:
            llm_response = client.chat.completions.create(
                model=model,
                temperature=CONFIG["temperature"],
                messages=[
                    {"role": "system", "content": system_prompt if index == 0 else retry_system_prompt},
                    {"role": "user", "content": candidate_prompt},
                ],
            )
        except BadRequestError as exc:
            if is_context_size_error(exc):
                gha_warning(f"Context too large on attempt {index + 1}; retrying smaller.")
                continue
            raise

        content = extract_message_content(llm_response.choices[0].message)
        if content:
            logger.info("LLM generation succeeded (%d chars)", len(content))
            return content
        gha_warning(f"LLM returned empty content on attempt {index + 1}.")

    gha_warning("Using deterministic fallback summary.")
    return deterministic_fallback_summary(changed_files, diff)


def write_output(text: str) -> None:
    output_file = os.environ.get("OUTPUT_FILE", "report/ai.md").strip() or "report/ai.md"
    os.makedirs(os.path.dirname(output_file) or ".", exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as fh:
        fh.write(text.rstrip() + "\n")
    logger.info("Wrote AI fragment to %s (%d chars)", output_file, len(text))


def main() -> None:
    github_token = require_env("GITHUB_TOKEN")
    repo = require_env("REPOSITORY")
    pr_number = require_env("PR_NUMBER")
    ai_url = os.environ.get("VLLM_URL", "").strip()
    if not ai_url:
        gha_warning("VLLM_URL not set — AI review skipped (service unavailable)")
        write_output(
            "### ⚠️ AI Analysis Unavailable\n\n"
            "The VLLM service URL (`VLLM_URL`) is not configured. "
            "AI-powered PR review was skipped for this run.\n"
        )
        return

    ai_url = normalize_base_url(ai_url)
    ai_key = os.environ.get("VLLM_API_KEY", "").strip() or "no-key"
    verify_ssl = os.environ.get("VLLM_VERIFY_SSL", "true").strip().lower() not in {"0", "false", "no", "off"}
    ai_model = os.environ.get("VLLM_MODEL", "").strip() or CONFIG.get("model", "").strip()

    logger.info("Generating AI review fragment for %s PR #%s", repo, pr_number)

    try:
        with gha_group("Fetch GitHub PR data"):
            full_diff = gh_request(
                f"https://api.github.com/repos/{repo}/pulls/{pr_number}",
                token=github_token,
                accept="application/vnd.github.v3.diff",
            )
            pr_files_data = gh_paginated_request_json(
                f"https://api.github.com/repos/{repo}/pulls/{pr_number}/files",
                token=github_token,
            )
    except urllib.error.URLError as exc:
        gha_error(f"GitHub API unavailable for AI summary: {type(exc).__name__}: {exc}")
        write_output(
            "### ⚠️ AI Analysis Unavailable\n\n"
            "GitHub PR metadata could not be fetched by the AI summary job. "
            "The workflow is continuing without AI detail for this run.\n"
        )
        return

    pr_files = [file_info.get("filename", "unknown") for file_info in pr_files_data]
    logger.info("PR touches %d file(s); diff is %d chars", len(pr_files), len(full_diff))

    try:
        client = OpenAI(
            base_url=ai_url,
            api_key=ai_key,
            http_client=httpx.Client(verify=verify_ssl, timeout=float(CONFIG["http_timeout_seconds"])),
        )
        ai_model = resolve_model_name(client, ai_model)

        with gha_group("Generate PR summary"):
            summary = generate_markdown(
                client,
                make_pr_prompt(trim_text(full_diff, CONFIG["max_pr_diff_chars"])),
                changed_files=pr_files,
                diff=full_diff,
                model=ai_model,
            )
        write_output(summary)
        logger.info("AI fragment generation completed successfully")

    except (APIConnectionError, InternalServerError, APIStatusError, OSError, httpx.ConnectError, httpx.TimeoutException) as exc:
        gha_error(f"AI service unavailable: {type(exc).__name__}: {exc}")
        write_output(
            "### ⚠️ AI Analysis Unavailable\n\n"
            f"The AI service (`{ai_url}`) could not be reached during this run "
            f"(`{type(exc).__name__}`). The summary below is a deterministic fallback.\n\n"
            + deterministic_fallback_summary(pr_files, full_diff)
        )


if __name__ == "__main__":
    main()
