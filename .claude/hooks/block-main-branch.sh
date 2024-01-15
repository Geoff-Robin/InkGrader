#!/usr/bin/env bash
# Blocks any Bash command that would push or merge directly onto main/master.
input=$(cat)
command=$(printf '%s' "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input', {}).get('command', ''))" 2>/dev/null)
cmd_lower=$(printf '%s' "$command" | tr '[:upper:]' '[:lower:]')

block() { echo "$1" >&2; exit 2; }

# git push with an explicit main/master target anywhere in the command
if printf '%s' "$cmd_lower" | grep -Eq '\bgit\s+push\b' \
   && printf '%s' "$cmd_lower" | grep -Eq 'push[^;&|]*\b(origin|upstream)?/?(main|master)(:\S+)?\b'; then
  block "Blocked: direct 'git push' to main/master isn't allowed. Push a feature branch and open a PR instead."
fi

# bare 'git push' while checked out on main/master
if printf '%s' "$cmd_lower" | grep -Eq '\bgit\s+push\b' \
   && ! printf '%s' "$cmd_lower" | grep -Eq 'push\s+\S+\s+\S+'; then
  current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    block "Blocked: 'git push' while on '$current_branch' isn't allowed. Switch to a feature branch first."
  fi
fi

# any merge while checked out on main/master
if printf '%s' "$cmd_lower" | grep -Eq '\bgit\s+merge\b'; then
  current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    block "Blocked: merging directly into '$current_branch' isn't allowed. Open a PR instead."
  fi
fi

exit 0