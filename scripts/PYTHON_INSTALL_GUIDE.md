# Python Package Installation Guide

## The "Externally-Managed Environment" Error

If you see this error when trying to install langfuse:

```
error: externally-managed-environment
× This environment is externally managed
```

This is a **safety feature** in modern Python installations (Python 3.11+, Debian 12+, Ubuntu 23.04+) to prevent conflicts with system packages.

## Solutions (Ranked by Recommendation)

### Option 1: User Installation (Easiest)

Install for your user only (doesn't affect system):

```bash
python3 -m pip install --user langfuse
```

**Pros:**

- ✅ No sudo required
- ✅ Safe (doesn't affect system)
- ✅ Works immediately

**Cons:**

- ⚠️ Only available to your user

### Option 2: Use pipx (Recommended for Tools)

Install pipx first, then use it to install langfuse:

```bash
# Install pipx
sudo apt install pipx    # Ubuntu/Debian
# or
brew install pipx        # macOS

# Install langfuse
pipx install langfuse
```

**Pros:**

- ✅ Isolated environment per tool
- ✅ Clean and organized
- ✅ Recommended by Python community

**Cons:**

- ⚠️ Requires installing pipx first
- ⚠️ May need PATH configuration

### Option 3: Virtual Environment (Best for Development)

Create a project-specific virtual environment:

```bash
# Create virtual environment
python3 -m venv ~/.venvs/class-one-rapids

# Activate it
source ~/.venvs/class-one-rapids/bin/activate

# Install langfuse
pip install langfuse

# Now run scripts normally (venv is active)
./scripts/feature-to-code-unified.sh "feature"

# Deactivate when done
deactivate
```

**Pros:**

- ✅ Completely isolated
- ✅ Best practice for development
- ✅ Easy to recreate
- ✅ **Script automatically detects and uses venv Python**

**Cons:**

- ⚠️ Must activate before use

**Note:** The workflow script automatically detects if you're in a virtual environment and uses that Python interpreter, so telemetry will work seamlessly once the venv is activated.

### Option 4: Override System Protection (Not Recommended)

Force installation (breaks system protection):

```bash
python3 -m pip install --break-system-packages langfuse
```

**Pros:**

- ✅ Works immediately

**Cons:**

- ❌ Can break system packages
- ❌ Not recommended by Python
- ❌ May cause issues later

### Option 5: Disable Telemetry

Just skip telemetry entirely:

```bash
DISABLE_TELEMETRY=1 ./scripts/feature-to-code-unified.sh "feature"
```

**Pros:**

- ✅ No installation needed
- ✅ Workflow still works

**Cons:**

- ❌ No observability data
- ❌ Can't track costs/performance

## Quick Decision Guide

**Just want it to work?**
→ Use Option 1: `python3 -m pip install --user langfuse`

**Setting up for long-term use?**
→ Use Option 3: Create a virtual environment

**Installing multiple Python tools?**
→ Use Option 2: Install pipx

**Don't need telemetry?**
→ Use Option 5: Disable telemetry

## Automated Installation

The installation script tries these methods automatically:

```bash
./scripts/install-telemetry-deps.sh
```

It will:

1. Try pipx (if available)
2. Try regular pip install
3. Try pip install --user
4. Show manual options if all fail

## Verifying Installation

Check if langfuse is installed:

```bash
python3 -c "import langfuse; print('✓ Langfuse installed')"
```

If using a virtual environment:

```bash
source ~/.venvs/class-one-rapids/bin/activate
python3 -c "import langfuse; print('✓ Langfuse installed')"
```

## Troubleshooting

### "Command not found" after pipx install

Add to PATH:

```bash
pipx ensurepath
# Then restart terminal
```

### Virtual environment activation doesn't work

Make sure you're using the right shell:

```bash
# Bash/Zsh
source ~/.venvs/class-one-rapids/bin/activate

# Fish
source ~/.venvs/class-one-rapids/bin/activate.fish

# Windows
~\.venvs\class-one-rapids\Scripts\activate
```

### Still getting errors

The workflow will work without telemetry:

```bash
DISABLE_TELEMETRY=1 ./scripts/feature-to-code-unified.sh "your feature"
```

## Why This Matters

Modern Python distributions (Debian 12+, Ubuntu 23.04+) use PEP 668 to prevent:

- Conflicts between system packages and pip packages
- Breaking system tools that depend on Python
- Accidental system-wide changes

This is a **good thing** for system stability, even though it adds an extra step for users.

## References

- [PEP 668 - Marking Python base environments as "externally managed"](https://peps.python.org/pep-0668/)
- [Python Virtual Environments Guide](https://docs.python.org/3/tutorial/venv.html)
- [pipx Documentation](https://pypa.github.io/pipx/)
