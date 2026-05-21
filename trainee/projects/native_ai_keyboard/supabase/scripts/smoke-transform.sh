#!/usr/bin/env bash
set -euo pipefail
BASE="${SUPABASE_FUNCTIONS_BASE:-http://127.0.0.1:54321/functions/v1}"
echo "Using BASE=$BASE"
reg=$(curl -sS -X POST "$BASE/register-device" -H "Content-Type: application/json" \
  -d "{\"deviceId\":\"smoke-$(date +%s)\",\"platform\":\"ios\",\"locale\":\"tr\"}")
echo "$reg" | python3 -m json.tool
TOKEN=$(echo "$reg" | python3 -c "import sys,json; print(json.load(sys.stdin)['deviceToken'])")
curl -sS -X POST "$BASE/transform" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"text":"merhaba yarın toplantı var mısın müsait","mode":"work","action":"rewrite","locale":"tr","theme":"system","style":"formal","deviceLocales":"tr-TR"}' \
  | python3 -m json.tool
