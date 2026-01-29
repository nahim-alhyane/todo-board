#!/usr/bin/env python3
"""
Claude Code Voice Notification Hook Handler

Cross-platform TTS notifications for tool usage and events.
Supports: macOS (say), Windows (SAPI), Linux (espeak/spd-say)
"""

import json
import sys
import argparse
import logging
import subprocess
import platform
import threading
import shutil
from pathlib import Path

import tempfile
LOG_FILE = Path(tempfile.gettempdir()) / "claude_voice_notifications.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Cross-platform voice mappings
VOICE_MAP_MACOS = {
    "samantha": "Samantha",
    "alfred": "Daniel",
    "jarvis": "Alex",
    "default": "Samantha"
}

VOICE_MAP_WINDOWS = {
    "samantha": "Microsoft Zira Desktop",
    "alfred": "Microsoft David Desktop",
    "jarvis": "Microsoft David Desktop",
    "default": "Microsoft Zira Desktop"
}

# Global lock to prevent overlapping speech
_speak_lock = threading.Lock()


def truncate_for_speech(text: str, max_words: int = 100) -> str:
    """Truncate text to max words for comfortable speech."""
    if not text:
        return ""
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + "... see screen for full question"


def get_sentence(tool_name: str, filename: str = "", command: str = "", event_type: str = "", question: str = "", pattern: str = "", subagent: str = "", task_desc: str = "", message: str = "") -> str:
    """Build sentence based on tool and context."""
    tool = tool_name.lower() if tool_name else ""
    event = event_type.lower() if event_type else ""

    # Handle notification events first - ORDER MATTERS!
    # Check permission BEFORE generic notification (permission_prompt contains "permission")
    if event == "stop" or tool == "stop":
        if command:
            return f"Finished {command}"
        elif filename:
            return f"Finished with {filename}"
        return "Task complete"
    elif "permission" in event or "permission" in tool or "permission" in message.lower():
        # Try to extract tool name from message like "Claude needs your permission to use Bash"
        if message and "permission to use" in message.lower():
            parts = message.split("permission to use")
            if len(parts) > 1:
                perm_tool = parts[1].strip().rstrip(".")
                return f"Permission needed for {perm_tool}"
        if filename:
            return f"Permission for {filename}"
        elif command:
            return f"Permission to run {command}"
        return "Permission requested"
    elif "askuserquestion" in tool:
        if question:
            return truncate_for_speech(question)
        return "Question for you"
    elif event == "notification" or tool == "notification":
        # Generic notification - but check message first
        if message:
            return truncate_for_speech(message, 20)
        return "Notification"

    # Tool-specific sentences
    if tool == "read":
        return f"Reading {filename}" if filename else "Reading file"
    elif tool == "edit":
        return f"Editing {filename}" if filename else "Editing file"
    elif tool == "write":
        return f"Writing {filename}" if filename else "Writing file"
    elif tool == "bash":
        return f"Running {command}" if command else "Running command"
    elif tool == "glob":
        return f"Searching for {pattern}" if pattern else "Searching files"
    elif tool == "grep":
        return f"Searching for {pattern}" if pattern else "Searching code"
    elif tool == "task":
        if subagent and task_desc:
            return f"Starting {subagent}: {task_desc}"
        elif subagent:
            return f"Starting {subagent}"
        elif task_desc:
            return f"Starting agent: {task_desc}"
        return "Starting agent"
    elif tool == "todowrite":
        return "Updating tasks"
    elif tool == "webfetch" or tool == "websearch":
        return "Searching web"
    else:
        # Fallback: humanize the tool/event name
        return tool_name.replace("_", " ") if tool_name else "Notification"


def speak(text: str, voice: str = "samantha") -> bool:
    """
    Cross-platform TTS with lock to prevent overlapping.

    Supports:
    - macOS: 'say' command
    - Windows: PowerShell with System.Speech
    - Linux: espeak or spd-say
    """
    system = platform.system()

    with _speak_lock:
        try:
            if system == "Darwin":
                return _speak_macos(text, voice)
            elif system == "Windows":
                return _speak_windows(text, voice)
            elif system == "Linux":
                return _speak_linux(text)
            else:
                logger.warning(f"Unsupported platform: {system}")
                return False
        except Exception as e:
            logger.error(f"TTS failed: {e}")
            return False


def _speak_macos(text: str, voice: str) -> bool:
    """macOS TTS using 'say' command."""
    macos_voice = VOICE_MAP_MACOS.get(voice, VOICE_MAP_MACOS["default"])
    subprocess.run(
        ["say", "-v", macos_voice, text],
        check=True,
        capture_output=True
    )
    logger.info(f"[macOS] Spoke: {text}")
    return True


def _speak_windows(text: str, voice: str) -> bool:
    """Windows TTS using PowerShell and System.Speech."""
    # Escape quotes for PowerShell
    escaped_text = text.replace("'", "''").replace('"', '`"')

    # PowerShell script using .NET System.Speech
    ps_script = f'''
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Speak("{escaped_text}")
'''
    subprocess.run(
        ["powershell", "-NoProfile", "-Command", ps_script],
        check=True,
        capture_output=True,
        creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0
    )
    logger.info(f"[Windows] Spoke: {text}")
    return True


def _speak_linux(text: str) -> bool:
    """Linux TTS using espeak or spd-say."""
    # Try espeak first (most common)
    if shutil.which("espeak"):
        subprocess.run(
            ["espeak", text],
            check=True,
            capture_output=True
        )
        logger.info(f"[Linux/espeak] Spoke: {text}")
        return True

    # Fallback to spd-say (speech-dispatcher)
    if shutil.which("spd-say"):
        subprocess.run(
            ["spd-say", "--wait", text],
            check=True,
            capture_output=True
        )
        logger.info(f"[Linux/spd-say] Spoke: {text}")
        return True

    # Try festival as last resort
    if shutil.which("festival"):
        subprocess.run(
            ["festival", "--tts"],
            input=text.encode(),
            check=True,
            capture_output=True
        )
        logger.info(f"[Linux/festival] Spoke: {text}")
        return True

    logger.warning("No TTS engine found. Install espeak: sudo apt install espeak")
    return False


def extract_command_name(command: str) -> str:
    """Extract command with subcommand for common tools."""
    if not command:
        return ""
    parts = command.strip().split()
    if not parts:
        return ""

    cmd = Path(parts[0]).name

    # Include subcommand for these tools
    if cmd in ("git", "npm", "docker", "kubectl", "dotnet", "cargo", "pip", "brew"):
        if len(parts) > 1:
            return f"{cmd} {parts[1]}"

    return cmd


def main():
    parser = argparse.ArgumentParser(description="Claude Code Voice Notifications")
    parser.add_argument("--voice", default="samantha",
                        choices=["alfred", "jarvis", "samantha", "default"])
    parser.add_argument("--hook-type", default="Notification")
    parser.add_argument("--tool-name")
    parser.add_argument("--file-path")
    parser.add_argument("--speak", help="Speak text directly")

    args = parser.parse_args()

    if args.speak:
        sys.exit(0 if speak(args.speak, args.voice) else 1)

    # Parse stdin from Claude Code
    tool_name = args.tool_name
    file_path = args.file_path
    command = ""
    event_type = args.hook_type
    question = ""
    pattern = ""
    subagent = ""
    task_desc = ""
    message = ""

    try:
        if not sys.stdin.isatty():
            stdin_data = sys.stdin.read()
            if stdin_data.strip():
                data = json.loads(stdin_data)

                # Debug: log the full data structure
                logger.info(f"Received data: {json.dumps(data, indent=2)}")

                if not tool_name:
                    tool_name = data.get("tool_name") or data.get("toolName")

                # Get event type from various possible fields
                event_type = (
                    data.get("event_type") or
                    data.get("eventType") or
                    data.get("type") or
                    data.get("hook_type") or
                    event_type
                )

                tool_input = data.get("tool_input") or data.get("toolInput") or {}

                if not file_path:
                    file_path = (
                        tool_input.get("file_path") or
                        tool_input.get("filePath") or
                        tool_input.get("path")
                    )

                if tool_name == "Bash":
                    command = tool_input.get("command", "")

                # Extract pattern for Glob/Grep
                if tool_name in ("Glob", "Grep"):
                    pattern = tool_input.get("pattern", "")

                # Extract subagent info for Task
                if tool_name == "Task":
                    subagent = tool_input.get("subagent_type", "")
                    task_desc = tool_input.get("description", "")

                # Extract question text for AskUserQuestion
                if tool_name and "askuserquestion" in tool_name.lower():
                    questions = tool_input.get("questions", [])
                    if questions and len(questions) > 0:
                        question = questions[0].get("question", "")

                # Extract message for notifications
                message = data.get("message", "")

                # For Notification hook, try to extract more context
                if not tool_name and args.hook_type == "Notification":
                    # Try common notification fields
                    notification_type = (
                        data.get("notification_type") or
                        data.get("notificationType") or
                        data.get("type") or
                        data.get("title") or
                        ""
                    )
                    if notification_type:
                        tool_name = notification_type

    except Exception as e:
        logger.warning(f"Error parsing stdin: {e}")

    # Build and speak the sentence
    filename = Path(file_path).name if file_path else ""
    cmd_name = extract_command_name(command)

    sentence = get_sentence(tool_name or args.hook_type, filename, cmd_name, event_type, question, pattern, subagent, task_desc, message)
    success = speak(sentence, args.voice)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
