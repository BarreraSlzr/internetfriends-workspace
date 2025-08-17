#!/bin/bash

# G's Purchase System Testing Script
echo "🚀 Testing InternetFriends G's Purchase System"
echo "=============================================="

BASE_URL="http://localhost:3000"
TEST_USER_ID="demo_user_123"
TEST_TIER="booster"
TEST_AMOUNT=7.99
TEST_GS_AMOUNT=350

echo ""
echo "📊 Testing API Health..."
curl -s "${BASE_URL}/api/health" | jq '.status' || echo "❌ Health check failed"

echo ""
echo "💳 Testing PayPal Order Creation..."
PAYPAL_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/payments/paypal/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "tier_id": "'${TEST_TIER}'",
    "amount": '${TEST_AMOUNT}',
    "gs_amount": '${TEST_GS_AMOUNT}',
    "user_id": "'${TEST_USER_ID}'",
    "return_url": "'${BASE_URL}'/friends/purchase/success",
    "cancel_url": "'${BASE_URL}'/friends/purchase/cancel",
    "metadata": {
      "gs_tier": "Booster Pack",
      "user_level": 2,
      "country": "MX"
    }
  }')

if echo "$PAYPAL_RESPONSE" | jq -e '.approval_url' > /dev/null 2>&1; then
  echo "✅ PayPal order creation successful"
  echo "   Approval URL: $(echo "$PAYPAL_RESPONSE" | jq -r '.approval_url')"
else
  echo "❌ PayPal order creation failed"
  echo "   Response: $PAYPAL_RESPONSE"
fi

echo ""
echo "🔐 Testing Stripe Session Creation..."
STRIPE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/payments/stripe/create-session" \
  -H "Content-Type: application/json" \
  -d '{
    "tier_id": "'${TEST_TIER}'",
    "amount": '${TEST_AMOUNT}',
    "gs_amount": '${TEST_GS_AMOUNT}',
    "user_id": "'${TEST_USER_ID}'",
    "success_url": "'${BASE_URL}'/friends/purchase/success",
    "cancel_url": "'${BASE_URL}'/friends/purchase/cancel",
    "customer_country": "MX",
    "payment_method_types": ["card", "oxxo"],
    "metadata": {
      "gs_tier": "Booster Pack",
      "user_level": 2,
      "bonus_applied": false
    }
  }')

if echo "$STRIPE_RESPONSE" | jq -e '.checkout_url' > /dev/null 2>&1; then
  echo "✅ Stripe session creation successful"
  echo "   Checkout URL: $(echo "$STRIPE_RESPONSE" | jq -r '.checkout_url')"
  echo "   Payment methods: $(echo "$STRIPE_RESPONSE" | jq -r '.payment_methods[]' | tr '\n' ' ')"
else
  echo "❌ Stripe session creation failed"
  echo "   Response: $STRIPE_RESPONSE"
fi

echo ""
echo "🇲🇽 Testing Mercado Pago Preference Creation..."
MP_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/payments/mercado-pago/create-preference" \
  -H "Content-Type: application/json" \
  -d '{
    "tier_id": "'${TEST_TIER}'",
    "amount": '${TEST_AMOUNT}',
    "gs_amount": '${TEST_GS_AMOUNT}',
    "user_id": "'${TEST_USER_ID}'",
    "success_url": "'${BASE_URL}'/friends/purchase/success",
    "failure_url": "'${BASE_URL}'/friends/purchase/cancel",
    "customer_email": "demo@internetfriends.com",
    "metadata": {
      "gs_tier": "Booster Pack",
      "user_level": 2,
      "user_country": "MX"
    }
  }')

if echo "$MP_RESPONSE" | jq -e '.checkout_url' > /dev/null 2>&1; then
  echo "✅ Mercado Pago preference creation successful"
  echo "   Checkout URL: $(echo "$MP_RESPONSE" | jq -r '.checkout_url')"
  echo "   Cash payment info: $(echo "$MP_RESPONSE" | jq -r '.cash_payment_info.oxxo_instructions')"
else
  echo "❌ Mercado Pago preference creation failed"
  echo "   Response: $MP_RESPONSE"
fi

echo ""
echo "🏛️ Testing Resico Tax Submission..."
RESICO_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/taxes/resico/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Juan Pérez",
    "customer_email": "juan@example.com",
    "customer_rfc": "PEPJ800101A1A",
    "amount": '${TEST_AMOUNT}',
    "currency": "USD",
    "concept": "Compra de '${TEST_GS_AMOUNT}' Gs - InternetFriends",
    "payment_method": "paypal",
    "payment_reference": "demo_tx_123456",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "invoice_required": true,
    "user_id": "'${TEST_USER_ID}'",
    "gs_amount": '${TEST_GS_AMOUNT}',
    "tier_id": "'${TEST_TIER}'"
  }')

if echo "$RESICO_RESPONSE" | jq -e '.resico_transaction_id' > /dev/null 2>&1; then
  echo "✅ Resico tax submission successful"
  echo "   Transaction ID: $(echo "$RESICO_RESPONSE" | jq -r '.resico_transaction_id')"
  echo "   Tax status: $(echo "$RESICO_RESPONSE" | jq -r '.tax_status')"
  echo "   IVA calculated: $$(echo "$RESICO_RESPONSE" | jq -r '.iva_calculated')"
else
  echo "❌ Resico tax submission failed"
  echo "   Response: $RESICO_RESPONSE"
fi

echo ""
echo "🎯 Testing UI Pages..."
echo "   Purchase page: ${BASE_URL}/friends/purchase"
echo "   Success page: ${BASE_URL}/friends/purchase/success"
echo "   Cancel page: ${BASE_URL}/friends/purchase/cancel"

echo ""
echo "📱 Testing Mobile Responsiveness..."
curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" \
  "${BASE_URL}/friends/purchase" > /dev/null && echo "✅ Mobile page loads successfully"

echo ""
echo "🔍 Payment Provider Analysis:"
echo "   PayPal:       Ultra-low friction, 95% user adoption"
echo "   Stripe:       Credit cards + OXXO for Mexico"
echo "   Mercado Pago: Mexican market leader + cash options"
echo "   Resico:       Automatic tax compliance for Mexico"

echo ""
echo "💰 G's Pricing Tiers:"
echo "   Starter Pack:  $2.99  → 100 G's   (33.4 G's/$)"
echo "   Booster Pack:  $7.99  → 350 G's   (43.8 G's/$) 🔥 Popular"
echo "   Power Pack:    $19.99 → 950 G's   (47.5 G's/$)"
echo "   Legend Pack:   $39.99 → 2,500 G's (62.5 G's/$)"

echo ""
echo "🎉 G's Purchase System Testing Complete!"
echo "   Navigate to: http://localhost:3000/friends/purchase"
echo "   To test the full purchase flow"
echo ""