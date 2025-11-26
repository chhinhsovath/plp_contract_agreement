#!/bin/bash
# Wrapper script to run nginx setup with automatic "yes" response
echo "testing-123" | sudo -S ~/setup-nginx-proxy.sh << 'EOF'
yes
EOF
