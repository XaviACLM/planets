"""
Scans the current working directory for .jsonl Claude Code transcripts
and converts each to a readable .txt file (skipped if .txt already exists).
"""

import json, os, sys

def extract_text_from_content(content):
    """Extract readable text from a message's content field."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict):
                if block.get("type") == "text":
                    parts.append(block["text"])
                elif block.get("type") == "tool_use":
                    name = block.get("name", "?")
                    inp = block.get("input", {})
                    # Summarize tool calls compactly
                    if name == "Read":
                        parts.append(f"[Read: {inp.get('file_path', '?')}]")
                    elif name == "Edit":
                        parts.append(f"[Edit: {inp.get('file_path', '?')}]")
                    elif name == "Write":
                        parts.append(f"[Write: {inp.get('file_path', '?')}]")
                    elif name == "Bash":
                        parts.append(f"[Bash: {inp.get('command', '?')[:80]}]")
                    elif name == "Grep":
                        parts.append(f"[Grep: {inp.get('pattern', '?')} in {inp.get('path', '.')}]")
                    elif name == "Glob":
                        parts.append(f"[Glob: {inp.get('pattern', '?')}]")
                    else:
                        parts.append(f"[{name}]")
                elif block.get("type") == "tool_result":
                    pass  # skip tool results to keep it readable
                # skip thinking blocks
        return "\n".join(p for p in parts if p.strip())
    return ""

def convert_file(jsonl_path, txt_path):
    messages = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            msg_type = obj.get("type", "")
            if msg_type not in ("user", "assistant"):
                continue
            msg = obj.get("message", {})
            role = msg.get("role", msg_type)
            content = msg.get("content", "")
            text = extract_text_from_content(content)
            if text.strip():
                messages.append((role, text.strip()))

    # Merge consecutive messages from the same role
    merged = []
    for role, text in messages:
        if merged and merged[-1][0] == role:
            merged[-1] = (role, merged[-1][1] + "\n\n" + text)
        else:
            merged.append((role, text))

    with open(txt_path, "w", encoding="utf-8") as f:
        for role, text in merged:
            header = "### Human" if role == "user" else "### Assistant"
            f.write(f"{header}\n\n{text}\n\n---\n\n")

    print(f"  Converted: {os.path.basename(jsonl_path)} -> {os.path.basename(txt_path)} ({len(merged)} messages)")

def main():
    cwd = os.getcwd()
    jsonl_files = [f for f in os.listdir(cwd) if f.endswith(".jsonl")]
    if not jsonl_files:
        print("No .jsonl files found in current directory.")
        return
    for fname in sorted(jsonl_files):
        txt_name = fname.rsplit(".", 1)[0] + ".txt"
        txt_path = os.path.join(cwd, txt_name)
        if os.path.exists(txt_path):
            print(f"  Skipped: {fname} ({txt_name} already exists)")
            continue
        convert_file(os.path.join(cwd, fname), txt_path)

if __name__ == "__main__":
    main()
