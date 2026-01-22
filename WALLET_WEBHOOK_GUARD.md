# Wallet Webhook Guard Documentation

## Overview

The Wallet Webhook Guard provides secure authentication for the wallet balance update webhook endpoint (`/api/v1/wallet/update-balance`). This guard ensures that only authorized payment gateways can trigger wallet balance updates.

## Purpose

This guard protects the sensitive wallet top-up endpoint from unauthorized access by:

- Validating webhook authentication keys
- Preventing unauthorized balance modifications
- Ensuring only trusted payment gateways can update wallet balances

## Implementation

### Files Created

1. **Guard:** `/src/common/guard/rest/wallet-webhook.guard.ts`
   - Implements the authentication logic
   - Validates webhook keys from request headers
   - Uses ConfigService to retrieve the secret key

2. **Decorator:** `/src/common/decorator/authenticate/rest/wallet-webhook.decorator.ts`
   - Provides a clean `@WalletWebhookAuth()` decorator
   - Simplifies guard application to endpoints

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
WALLET_WEBHOOK_KEY=your-secure-webhook-key-here
```

**Security Best Practices:**

- Use a strong, randomly generated key (minimum 32 characters)
- Never commit the actual key to version control
- Rotate the key periodically
- Use different keys for different environments (dev, staging, prod)

### Generate a Secure Key

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Usage

### Applying the Guard

```typescript
import { WalletWebhookAuth } from '@/src/common/decorator/authenticate/rest/wallet-webhook.decorator';

@Controller('wallet')
export class WalletController {
  @Post('/update-balance')
  @WalletWebhookAuth() // 👈 Apply the guard
  async updateBalanceWebhook(@Body() body: WalletTopUpReqDTO) {
    // Your webhook logic here
  }
}
```

## Authentication Methods

The guard accepts the webhook key in two ways:

### 1. Authorization Header (Recommended)

```bash
curl -X POST http://localhost:3000/api/v1/wallet/update-balance \
  -H "Authorization: Bearer your-webhook-key" \
  -H "x-country-code: US" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "webhook-txn-12345",
    "userId": "user-uuid-here",
    "amount": 10000
  }'
```

### 2. Custom Header

```bash
curl -X POST http://localhost:3000/api/v1/wallet/update-balance \
  -H "x-webhook-key: your-webhook-key" \
  -H "x-country-code: US" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "webhook-txn-12345",
    "userId": "user-uuid-here",
    "amount": 10000
  }'
```

## How It Works

```typescript
@Injectable()
export class WalletWebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Extract webhook key from request headers
    const webhookKey = this.extractWebhookKeyFromHeader(request);

    // 2. Validate key exists
    if (!webhookKey) {
      throw AppException.unauthorized('MISSING_WEBHOOK_KEY');
    }

    // 3. Get valid key from environment
    const validWebhookKey =
      this.configService.get<string>('WALLET_WEBHOOK_KEY');

    // 4. Validate configuration
    if (!validWebhookKey) {
      throw AppException.internalServerError('WEBHOOK_KEY_NOT_CONFIGURED');
    }

    // 5. Compare keys
    if (webhookKey !== validWebhookKey) {
      throw AppException.unauthorized('INVALID_WEBHOOK_KEY');
    }

    return true; // ✅ Authentication successful
  }
}
```

## Error Responses

### Missing Webhook Key (401)

```json
{
  "success": false,
  "message": "MISSING_WEBHOOK_KEY",
  "statusCode": 401
}
```

### Invalid Webhook Key (401)

```json
{
  "success": false,
  "message": "INVALID_WEBHOOK_KEY",
  "statusCode": 401
}
```

### Webhook Key Not Configured (500)

```json
{
  "success": false,
  "message": "WEBHOOK_KEY_NOT_CONFIGURED",
  "statusCode": 500
}
```

## Testing

### Unit Testing

```typescript
describe('WalletWebhookGuard', () => {
  let guard: WalletWebhookGuard;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-webhook-key'),
    } as any;
    guard = new WalletWebhookGuard(configService);
  });

  it('should allow access with valid webhook key', () => {
    const context = createMockExecutionContext({
      headers: {
        authorization: 'Bearer test-webhook-key',
      },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access with invalid webhook key', () => {
    const context = createMockExecutionContext({
      headers: {
        authorization: 'Bearer wrong-key',
      },
    });

    expect(() => guard.canActivate(context)).toThrow('INVALID_WEBHOOK_KEY');
  });
});
```

### Integration Testing with Postman/Insomnia

1. **Create a new request:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/v1/wallet/update-balance`

2. **Add Headers:**

   ```
   Authorization: Bearer <YOUR_WEBHOOK_KEY>
   x-country-code: US
   Content-Type: application/json
   ```

3. **Add Body:**

   ```json
   {
     "id": "test-webhook-123",
     "userId": "user-uuid-here",
     "amount": 10000
   }
   ```

4. **Send Request** - Should return 200 with success response

## Payment Gateway Integration

### Configuring Your Payment Gateway

When setting up webhooks with your payment gateway (Stripe, PayPal, etc.):

1. **Webhook URL:**

   ```
   https://your-domain.com/api/v1/wallet/update-balance
   ```

2. **Custom Headers:**
   - Add your webhook key in the Authorization header
   - Include the country code header if applicable

3. **Events to Subscribe:**
   - Payment successful
   - Payment completed
   - Charge succeeded

### Example: Stripe Integration

```javascript
// In your Stripe webhook configuration
const stripe = require('stripe')('sk_test_...');

stripe.webhookEndpoints.create({
  url: 'https://your-domain.com/api/v1/wallet/update-balance',
  enabled_events: ['payment_intent.succeeded'],
  api_version: '2023-10-16',
  metadata: {
    custom_headers: JSON.stringify({
      Authorization: 'Bearer your-webhook-key',
      'x-country-code': 'US',
    }),
  },
});
```

## Security Considerations

### ✅ Best Practices

1. **Strong Keys:**
   - Minimum 32 characters
   - Use cryptographically secure random generation
   - Mix of alphanumeric and special characters

2. **Key Rotation:**
   - Rotate keys every 90 days
   - Implement grace period for old keys during rotation
   - Update all payment gateway configurations

3. **Secure Storage:**
   - Store keys in environment variables
   - Never hardcode keys
   - Use secret management services (AWS Secrets Manager, Azure Key Vault)

4. **Monitoring:**
   - Log all webhook authentication attempts
   - Alert on failed authentication attempts
   - Track webhook request patterns

5. **Rate Limiting:**
   - Consider adding rate limiting for webhook endpoints
   - Implement IP whitelisting if possible
   - Use exponential backoff for retries

### ⚠️ Security Warnings

- **Never** expose webhook keys in client-side code
- **Never** commit webhook keys to version control
- **Always** use HTTPS in production
- **Always** validate webhook signatures (if supported by gateway)
- **Consider** implementing webhook signature verification for additional security

## Advanced Features

### Adding IP Whitelist (Optional)

```typescript
@Injectable()
export class WalletWebhookGuard implements CanActivate {
  private readonly allowedIPs = ['52.89.214.238', '34.212.75.30']; // Stripe IPs example

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Validate IP
    const clientIP = request.ip;
    if (!this.allowedIPs.includes(clientIP)) {
      throw AppException.forbidden('IP_NOT_WHITELISTED');
    }

    // Existing webhook key validation...
    return true;
  }
}
```

### Adding Request Signature Verification (Recommended)

```typescript
private verifySignature(request: Request): boolean {
  const signature = request.headers['x-webhook-signature'];
  const payload = JSON.stringify(request.body);
  const secret = this.configService.get<string>('WALLET_WEBHOOK_SECRET');

  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === computedSignature;
}
```

## Troubleshooting

### Common Issues

**Problem:** "WEBHOOK_KEY_NOT_CONFIGURED" error

- **Solution:** Ensure `WALLET_WEBHOOK_KEY` is set in your `.env` file
- **Solution:** Restart the application after adding the key

**Problem:** "INVALID_WEBHOOK_KEY" error

- **Solution:** Verify the key matches exactly (no extra spaces)
- **Solution:** Check if key includes special characters that need encoding
- **Solution:** Ensure payment gateway is sending the correct key

**Problem:** Webhook works locally but not in production

- **Solution:** Verify environment variables are set in production
- **Solution:** Check if HTTPS is properly configured
- **Solution:** Verify CORS settings allow webhook origin

## Related Documentation

- [Swagger Documentation](./SWAGGER_DOCUMENTATION.md)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [ConfigService](https://docs.nestjs.com/techniques/configuration)

## Support

For issues or questions about webhook authentication:

1. Check the troubleshooting section
2. Review application logs for detailed error messages
3. Contact the development team
