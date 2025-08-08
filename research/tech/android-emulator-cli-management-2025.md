# Comprehensive CLI Guide for Android Emulator Management (2024-2025)

## 1. Android SDK Command-Line Tools Overview

### Core Tools for Emulator Management
- **`sdkmanager`**: Downloads and manages SDK packages, system images, and components
- **`avdmanager`**: Creates and manages Android Virtual Devices (AVDs)
- **`emulator`**: Runs and controls emulator instances
- **`adb`**: Android Debug Bridge for device communication

## 2. Complete Setup Workflow from Scratch

### Step 1: Install Essential SDK Components
```bash
# Install core platform tools and emulator
sdkmanager "platform-tools" "emulator"

# Install build tools for specific API level
sdkmanager "build-tools;35.0.0"

# Install platform and system images
sdkmanager "platforms;android-35"
sdkmanager "system-images;android-35;google_apis;x86_64"

# For multiple API levels
sdkmanager "platforms;android-30" "platforms;android-33" "platforms;android-35"
sdkmanager "system-images;android-30;google_apis;x86_64"
sdkmanager "system-images;android-33;google_apis;x86_64"
sdkmanager "system-images;android-35;google_apis;x86_64"
```

### Step 2: List Available System Images
```bash
# View all available system images
sdkmanager --list | grep system-images

# View only installed packages
sdkmanager --list_installed
```

## 3. AVD Management with avdmanager

### Creating AVDs
```bash
# Basic AVD creation
avdmanager create avd -n "MyEmulator" -k "system-images;android-35;google_apis;x86_64"

# Advanced AVD creation with specific device profile
avdmanager create avd \
  --name "pixel_5_api35" \
  --package "system-images;android-35;google_apis;x86_64" \
  --device "pixel_5" \
  --tag "google_apis" \
  --abi "x86_64"

# Create AVD with custom hardware profile
avdmanager create avd \
  --name "custom_emulator" \
  --package "system-images;android-35;google_apis;x86_64" \
  --device "pixel_4" \
  --sdcard 512M \
  --force
```

### Listing and Managing AVDs
```bash
# List all AVDs
avdmanager list avd

# List available device definitions
avdmanager list device

# Delete an AVD
avdmanager delete avd -n "MyEmulator"

# Move AVD to different location
avdmanager move avd -n "MyEmulator" -p /new/path -r /old/path
```

## 4. Emulator Command-Line Parameters

### Basic Emulator Launch
```bash
# Start emulator by name
emulator @MyEmulator

# Start with specific port
emulator @MyEmulator -port 5556

# List running emulators
emulator -list-avds
```

### Performance Optimization Parameters
```bash
# Optimized emulator for development
emulator @MyEmulator \
  -cores 4 \
  -memory 4096 \
  -gpu host \
  -skin 1080x1920 \
  -netdelay none \
  -netspeed full \
  -no-snapshot-save \
  -wipe-data

# Hardware acceleration options
emulator @MyEmulator -accel on -gpu host
```

### Headless and CI/CD Options
```bash
# Headless mode (no GUI)
emulator @MyEmulator -no-window

# CI/CD optimized settings
emulator @MyEmulator \
  -no-window \
  -no-audio \
  -cores 2 \
  -memory 2048 \
  -read-only \
  -no-snapshot-save \
  -gpu swiftshader_indirect \
  -camera-back none \
  -camera-front none

# Quick boot with snapshot
emulator @MyEmulator -no-window -no-boot-anim -quick-boot-choice no
```

## 5. Hardware Acceleration Setup (2024 Update)

### Current Acceleration Technologies
**Note**: Intel HAXM is deprecated as of 2024. Use these alternatives:

#### For Intel Processors:
```bash
# Install Android Emulator Hypervisor Driver (AEHD)
sdkmanager "extras;intel;Hardware_Accelerated_Execution_Manager"
# Or through SDK Manager: Android Emulator Hypervisor Driver for Intel processors
```

#### For AMD Processors:
```bash
# Install AMD Hypervisor Driver
sdkmanager "extras;google;Android_Emulator_Hypervisor_Driver"
```

#### Linux KVM Setup:
```bash
# Install KVM packages
sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils

# Add user to KVM group
sudo usermod -aG kvm $USER
sudo usermod -aG libvirt $USER

# Verify KVM acceleration
emulator -accel-check
```

## 6. Network Configuration and Port Forwarding

### Basic Network Setup
```bash
# Access host machine from emulator
# Use IP: 10.0.2.2 to reach host localhost

# ADB port forwarding (TCP only)
adb forward tcp:8080 tcp:8080

# List port forwards
adb forward --list

# Remove specific forward
adb forward --remove tcp:8080

# Remove all forwards
adb forward --remove-all
```

### Console-based Port Redirection
```bash
# Connect to emulator console
telnet localhost 5554

# Authenticate (find auth token in ~/.emulator_console_auth_token)
auth <token>

# Add TCP redirection
redir add tcp:5000:6000

# Add UDP redirection
redir add udp:5001:6001

# List redirections
redir list

# Remove redirection
redir del tcp:5000
```

## 7. Snapshot and State Management

### Snapshot Operations
```bash
# Start emulator with snapshot support
emulator @MyEmulator -snapshot snapshot_name

# Save current state as snapshot
emulator @MyEmulator -snapshot-save

# Load from specific snapshot
emulator @MyEmulator -snapshot-load snapshot_name

# Start without loading snapshots
emulator @MyEmulator -no-snapshot-load

# Disable snapshot saving
emulator @MyEmulator -no-snapshot-save
```

### Quick Boot Configuration
```bash
# Enable quick boot
emulator @MyEmulator -feature QuickBoot

# Disable quick boot
emulator @MyEmulator -no-quick-boot

# Choose quick boot behavior
emulator @MyEmulator -quick-boot-choice yes
```

## 8. Screen Resolution and Density Settings

### Display Configuration
```bash
# Set custom screen resolution
emulator @MyEmulator -skin 1440x2560

# Set screen density
emulator @MyEmulator -dpi-device 480

# Use predefined skin
emulator @MyEmulator -skin pixel_4

# Scale display
emulator @MyEmulator -scale 0.8

# Force landscape orientation
emulator @MyEmulator -landscape
```

## 9. CI/CD Integration Examples

### Docker-based Emulator Setup
```dockerfile
# Dockerfile for Android CI/CD
FROM circleci/android:api-35

# Install emulator
RUN sdkmanager "emulator" "system-images;android-35;google_apis;x86_64"

# Create AVD
RUN echo "no" | avdmanager create avd -n test -k "system-images;android-35;google_apis;x86_64"

# Start emulator in background
CMD emulator @test -no-window -no-audio &
```

### CircleCI Configuration
```yaml
version: 2.1
orbs:
  android: circleci/android@2.1.2

jobs:
  test:
    executor:
      name: android/android_machine
      resource_class: large
      tag: 2024.11.1
    steps:
      - checkout
      - android/start_emulator_and_run_tests:
          system_image: system-images;android-35;google_apis;x86_64
          test_command: ./gradlew connectedAndroidTest
```

### GitHub Actions Workflow
```yaml
name: Android CI
on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
    
    - name: Run emulator tests
      uses: reactivecircus/android-emulator-runner@v2
      with:
        api-level: 35
        target: google_apis
        arch: x86_64
        script: ./gradlew connectedAndroidTest
```

## 10. Troubleshooting Common Issues

### Performance Issues
```bash
# Check hardware acceleration
emulator -accel-check

# Monitor emulator resources
emulator @MyEmulator -show-kernel -verbose

# Enable hardware keyboard
emulator @MyEmulator -hw-keyboard

# Increase heap size
emulator @MyEmulator -memory 4096 -vm-heap 256
```

### Network Connectivity Issues
```bash
# Reset network settings
emulator @MyEmulator -netdelay none -netspeed full

# Use custom DNS
emulator @MyEmulator -dns-server 8.8.8.8,8.8.4.4

# Enable Wi-Fi simulation
emulator @MyEmulator -feature Wifi
```

### Audio and Graphics Issues
```bash
# Disable audio completely
emulator @MyEmulator -no-audio

# Software rendering fallback
emulator @MyEmulator -gpu swiftshader_indirect

# OpenGL ES version override
emulator @MyEmulator -gpu-mode host -opengl-es-api-version 3.0
```

### Debugging Commands
```bash
# Enable verbose logging
emulator @MyEmulator -verbose -show-kernel

# Debug GPU issues
emulator @MyEmulator -debug gpu

# Log network activity
emulator @MyEmulator -tcpdump network.pcap

# Show emulator console
emulator @MyEmulator -shell
```

## 11. Advanced Automation Scripts

### Multi-Emulator Management Script
```bash
#!/bin/bash
# start_emulators.sh - Launch multiple emulators for parallel testing

EMULATOR_COUNT=4
API_LEVEL=35

for i in $(seq 1 $EMULATOR_COUNT); do
    AVD_NAME="test_emulator_$i"
    PORT=$((5554 + 2*($i-1)))
    
    # Create AVD if it doesn't exist
    if ! avdmanager list avd | grep -q "$AVD_NAME"; then
        echo "Creating AVD: $AVD_NAME"
        echo "no" | avdmanager create avd \
            -n "$AVD_NAME" \
            -k "system-images;android-$API_LEVEL;google_apis;x86_64" \
            --force
    fi
    
    # Start emulator
    echo "Starting emulator: $AVD_NAME on port $PORT"
    emulator "@$AVD_NAME" \
        -port $PORT \
        -no-window \
        -no-audio \
        -cores 2 \
        -memory 2048 \
        -read-only \
        -no-snapshot-save &
done

# Wait for all emulators to boot
echo "Waiting for emulators to boot..."
adb wait-for-device
sleep 30

echo "All emulators started successfully"
```

### Emulator Health Check Script
```bash
#!/bin/bash
# check_emulator_health.sh

check_emulator() {
    local device=$1
    echo "Checking emulator: $device"
    
    # Check if device is online
    if adb -s "$device" get-state | grep -q "device"; then
        echo "✓ Device online"
    else
        echo "✗ Device offline"
        return 1
    fi
    
    # Check system boot completion
    if adb -s "$device" shell getprop sys.boot_completed | grep -q "1"; then
        echo "✓ Boot completed"
    else
        echo "✗ Boot not completed"
        return 1
    fi
    
    # Check available storage
    storage=$(adb -s "$device" shell df /data | tail -1 | awk '{print $4}')
    echo "Available storage: $storage KB"
    
    return 0
}

# Check all connected devices
devices=$(adb devices | grep emulator | awk '{print $1}')
for device in $devices; do
    check_emulator "$device"
    echo "---"
done
```

## 12. Modern Best Practices (2024-2025)

### Recommended System Images
- Use `google_atd` (Android Test Device) images when available - 40% more efficient than `google_apis`
- Prefer x86_64 architecture for better performance
- Use latest API levels for new features and security updates

### Performance Optimization
```bash
# Optimal CI/CD configuration
emulator @MyEmulator \
  -no-window \
  -no-audio \
  -no-boot-anim \
  -cores 2 \
  -memory 3072 \
  -read-only \
  -gpu swiftshader_indirect \
  -netdelay none \
  -netspeed full \
  -camera-back none \
  -camera-front none
```

### Security Considerations
- Use read-only mode for CI/CD to prevent state persistence
- Regularly update system images and SDK tools
- Implement proper cleanup scripts to remove temporary emulators

## 13. Quick Reference Commands

### Essential Daily Commands
```bash
# List available system images
sdkmanager --list | grep system-images

# Create basic emulator
avdmanager create avd -n "dev" -k "system-images;android-35;google_apis;x86_64"

# Start emulator headless
emulator @dev -no-window -no-audio

# Check emulator status
adb devices

# Kill all emulators
adb devices | grep emulator | cut -f1 | while read line; do adb -s $line emu kill; done

# Wipe emulator data
emulator @dev -wipe-data
```

### Performance Monitoring
```bash
# Check hardware acceleration support
emulator -accel-check

# Monitor emulator performance
emulator @dev -show-kernel -verbose

# Check system resources
adb shell top
adb shell dumpsys meminfo
adb shell dumpsys cpuinfo
```

This comprehensive guide covers all aspects of Android emulator management via CLI, incorporating the latest 2024-2025 practices and addressing common issues developers face in both development and CI/CD environments.