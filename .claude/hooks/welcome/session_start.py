#!/usr/bin/env python3
"""
Session Start Hook - Welcome screen with banner and git info.

Displays:
- Project name banner
- Current git branch and status
- Session mode selection prompt

Customize the BANNER constant for your project's ASCII art.
"""

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path


# Extended color palette with gradient support
class C:
    # Gradient shades (light to dark)
    CYAN1 = "\033[38;5;51m"
    CYAN2 = "\033[38;5;50m"
    CYAN3 = "\033[38;5;44m"
    CYAN4 = "\033[38;5;37m"
    CYAN5 = "\033[38;5;30m"
    CYAN6 = "\033[38;5;23m"
    # Accent colors
    PINK = "\033[38;5;205m"
    BG_PINK = "\033[48;5;205m"
    BLACK = "\033[38;5;0m"
    # Standard colors
    CYAN = "\x1b[36m"
    GREEN = "\x1b[32m"
    YELLOW = "\x1b[33m"
    DIM = "\x1b[2m"
    BOLD = "\x1b[1m"
    RESET = "\x1b[0m"


def get_project_name(cwd: str) -> str:
    """Get project name from directory."""
    return os.path.basename(cwd) if cwd else "Project"


def get_git_branch() -> str:
    """Get current git branch name."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=5
        )
        return result.stdout.strip() if result.returncode == 0 else "unknown"
    except Exception:
        return "unknown"


def get_git_status() -> str:
    """Get brief git status."""
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            count = len([l for l in lines if l.strip()])
            return f"{count} changed" if count > 0 else "clean"
    except Exception:
        pass
    return "unknown"


def build_welcome_message(project_name: str) -> str:
    """Build the welcome screen."""
    branch = get_git_branch()
    status = get_git_status()
    today = datetime.now().strftime("%Y-%m-%d")

    lines = [
        "",
        f"  {C.BOLD}{C.CYAN1}=== {project_name} ==={C.RESET}",
        "",
        f"  {C.GREEN}✓{C.RESET} Branch: {C.CYAN}{branch}{C.RESET}  {C.DIM}({status}){C.RESET}",
        f"  {C.GREEN}✓{C.RESET} Date:   {C.CYAN}{today}{C.RESET}",
        "",
        f"  {C.YELLOW}Session Mode{C.RESET}",
        f"  {C.CYAN}[1]{C.RESET} Quick       {C.DIM}Questions, docs, small fixes{C.RESET}",
        f"  {C.CYAN}[2]{C.RESET} Supervisor  {C.DIM}Roadmap, features, multi-agent{C.RESET}",
        "",
        f"  {C.DIM}Reply with{C.RESET} {C.CYAN}1{C.RESET} {C.DIM}or{C.RESET} {C.CYAN}2{C.RESET}{C.DIM}, or describe your task{C.RESET}",
        "",
    ]

    return "\n".join(lines)


def main():
    """Main entry point."""
    # Read context (for cwd)
    try:
        stdin_data = sys.stdin.read()
        context = json.loads(stdin_data) if stdin_data else {}
    except Exception:
        context = {}

    # Change to working directory
    cwd = context.get("cwd", "")
    if cwd and Path(cwd).exists():
        os.chdir(cwd)

    # Build and output welcome message
    project_name = get_project_name(cwd)
    welcome = build_welcome_message(project_name)

    result = {
        "hookSpecificOutput": {"hookEventName": "SessionStart"},
        "systemMessage": welcome
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
