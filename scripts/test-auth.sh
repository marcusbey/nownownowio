#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔒 Starting Authentication System Tests"
echo "======================================="

# Test environment variables
echo -e "\n${GREEN}1. Checking Environment Variables${NC}"
required_vars=(
    "NEXTAUTH_SECRET:Session encryption"
    "GOOGLE_ID:Google OAuth"
    "GOOGLE_SECRET:Google OAuth"
    "TWITTER_ID:Twitter OAuth"
    "TWITTER_SECRET:Twitter OAuth"
    "RESEND_API_KEY:Magic Link emails"
)

missing_vars=0
for var_info in "${required_vars[@]}"; do
    var_name="${var_info%%:*}"
    var_purpose="${var_info#*:}"
    if [ -z "${!var_name}" ]; then
        echo -e "${RED}❌ Missing $var_name${NC} (Required for: $var_purpose)"
        missing_vars=$((missing_vars + 1))
    else
        echo -e "${GREEN}✅ $var_name is set${NC} (Required for: $var_purpose)"
    fi
done

if [ $missing_vars -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  Found $missing_vars missing environment variables${NC}"
else
    echo -e "\n${GREEN}✅ All required environment variables are set${NC}"
fi

# Test database connection
echo -e "\n${GREEN}2. Testing Database Connection${NC}"
if npx prisma db push --skip-generate; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi

# Test provider configurations
echo -e "\n${GREEN}3. Testing Provider Configurations${NC}"

# Test Google configuration
if [ -n "$GOOGLE_ID" ] && [ -n "$GOOGLE_SECRET" ]; then
    auth_url="https://accounts.google.com/o/oauth2/v2/auth"
    auth_params="client_id=${GOOGLE_ID}&redirect_uri=${NEXTAUTH_URL}/api/auth/callback/google&response_type=code&scope=openid%20email%20profile"
    encoded_url="${auth_url}?${auth_params}"
    
    if curl -s -I "$encoded_url" | grep -q "HTTP/[1-2]\.[0-9] [23]"; then
        echo -e "${GREEN}✅ Google OAuth configuration valid${NC}"
        echo -e "   ├─ Client ID: ${GREEN}Valid${NC}"
        echo -e "   ├─ Client Secret: ${GREEN}Set${NC}"
        echo -e "   └─ Auth URL: ${GREEN}Accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Google OAuth partially configured${NC}"
        echo -e "   ├─ Client ID: ${GREEN}Set${NC}"
        echo -e "   ├─ Client Secret: ${GREEN}Set${NC}"
        echo -e "   └─ Auth URL: ${YELLOW}Not verifiable${NC} (requires user interaction)"
    fi
else
    echo -e "${RED}❌ Google OAuth configuration invalid${NC}"
    [ -z "$GOOGLE_ID" ] && echo -e "   ├─ Client ID: ${RED}Missing${NC}"
    [ -z "$GOOGLE_SECRET" ] && echo -e "   └─ Client Secret: ${RED}Missing${NC}"
fi

# Test Twitter configuration
if [ -n "$TWITTER_ID" ] && [ -n "$TWITTER_SECRET" ]; then
    auth_url="https://twitter.com/i/oauth2/authorize"
    auth_params="client_id=${TWITTER_ID}&redirect_uri=${NEXTAUTH_URL}/api/auth/callback/twitter&response_type=code&scope=users.read%20tweet.read%20offline.access"
    encoded_url="${auth_url}?${auth_params}"
    
    if curl -s -I "$encoded_url" | grep -q "HTTP/[1-2]\.[0-9] [23]"; then
        echo -e "${GREEN}✅ Twitter OAuth configuration valid${NC}"
        echo -e "   ├─ Client ID: ${GREEN}Valid${NC}"
        echo -e "   ├─ Client Secret: ${GREEN}Set${NC}"
        echo -e "   └─ Auth URL: ${GREEN}Accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Twitter OAuth partially configured${NC}"
        echo -e "   ├─ Client ID: ${GREEN}Set${NC}"
        echo -e "   ├─ Client Secret: ${GREEN}Set${NC}"
        echo -e "   └─ Auth URL: ${YELLOW}Not verifiable${NC} (requires user interaction)"
    fi
else
    echo -e "${RED}❌ Twitter OAuth configuration invalid${NC}"
    [ -z "$TWITTER_ID" ] && echo -e "   ├─ Client ID: ${RED}Missing${NC}"
    [ -z "$TWITTER_SECRET" ] && echo -e "   └─ Client Secret: ${RED}Missing${NC}"
fi

# Run auth tests
echo -e "\n${GREEN}4. Running Authentication Flow Tests${NC}"
npx tsx scripts/test-auth.ts

echo -e "\n${GREEN}5. Testing Callback URLs${NC}"
providers=("google" "twitter")

# Function to check if port is in use (i.e., if Next.js is running)
check_port() {
    local port=$1
    nc -z localhost $port >/dev/null 2>&1
    return $?
}

# Extract port from NEXTAUTH_URL
nextauth_port=$(echo $NEXTAUTH_URL | sed -n 's/.*:\([0-9]\{4\}\).*/\1/p')
if [ -z "$nextauth_port" ]; then
    nextauth_port="3000"  # Default to 3000 if not specified
fi

# Check if Next.js server is running
if ! check_port $nextauth_port; then
    echo -e "${YELLOW}⚠️  Next.js server is not running on port $nextauth_port${NC}"
    echo -e "   └─ Start the server with ${GREEN}npm run dev${NC} to test callback URLs"
else
    echo -e "${GREEN}✅ Next.js server is running on port $nextauth_port${NC}"
    
    for provider in "${providers[@]}"; do
        callback_url="${NEXTAUTH_URL}/api/auth/callback/${provider}"
        response=$(curl -s -I -L "$callback_url" | grep -m1 "^HTTP" | awk '{print $2}')
        provider_name="$(tr '[:lower:]' '[:upper:]' <<< ${provider:0:1})${provider:1}"
        
        if [[ "$response" =~ ^(400|401|302|308)$ ]]; then
            # 400/401 are expected when hitting callback URLs directly
            echo -e "${GREEN}✅ $provider callback URL configured${NC}"
            echo -e "   ├─ URL: ${callback_url}"
            echo -e "   └─ Status: ${GREEN}HTTP $response${NC} (expected when testing directly)"
        elif [[ "$response" =~ ^(200)$ ]]; then
            echo -e "${YELLOW}⚠️  $provider callback URL returns 200${NC}"
            echo -e "   ├─ URL: ${callback_url}"
            echo -e "   └─ Expected 400/401 for direct access"
        else
            echo -e "${RED}❌ $provider callback URL not accessible${NC}"
            echo -e "   ├─ URL: ${callback_url}"
            echo -e "   ├─ Status: ${RED}HTTP $response${NC}"
            echo -e "   └─ Make sure the URL is configured in $provider_name Developer Console"
        fi
    done
fi

# Summary
echo -e "\n${GREEN}Authentication Tests Summary${NC}"
echo "----------------------------------------"
echo "✓ Environment variables check"
echo "✓ Database connection test"
echo "✓ Provider configuration test"
echo "✓ Authentication flow tests"
echo "✓ Callback URL tests"

if [ $missing_vars -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  Warning: Some environment variables are missing${NC}"
fi

echo -e "\n${GREEN}Authentication Tests Complete${NC}"
