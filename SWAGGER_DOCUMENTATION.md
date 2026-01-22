# Swagger API Documentation

## Overview

# This swagger documentation tags and decorator are purely vibe coded. Apologies for any mistakes.

# The goal is to provide clear and comprehensive API documentation for developers consuming the REST API.

This project now includes comprehensive Swagger/OpenAPI documentation for all REST API endpoints.

## Accessing Swagger UI

Once the application is running, you can access the Swagger UI at:

```
http://localhost:3000/api/docs
```

Or if using a different port:

```
http://localhost:<PORT>/api/docs
```

## Features

### ✅ Implemented Features

1. **Complete API Documentation**
   - All endpoints documented with descriptions
   - Request/Response schemas
   - Example values for all fields
   - HTTP status codes and their meanings

2. **Authentication Support**
   - JWT Bearer token authentication
   - Cookie-based authentication (accessToken, refreshToken)
   - Custom header authentication (x-country-code)
   - Webhook authentication (for payment gateway webhooks)

3. **Interactive Testing**
   - Try out all endpoints directly from Swagger UI
   - Persist authorization across browser sessions
   - Easy authentication token management

4. **Organized by Tags**
   - `auth` - Authentication endpoints
   - `registration` - User and admin registration
   - `money-order` - Money order management
   - `wallet` - Wallet operations
   - `receiver` - Receiver management
   - `system-config` - System configuration

## API Endpoints Summary

### Authentication (`/api/v1/auth`)

- `POST /login` - User authentication
- `POST /refresh-token` - Refresh access token

### Registration (`/api/v1`)

- `POST /register` - Register new user
- `POST /register-admin` - Register new admin (Admin only)
- `PATCH /verify-user-kyc/:id` - Verify user KYC
- `PATCH /reject-user-kyc/:id` - Reject user KYC

### Money Order (`/api/v1/money-order`)

- `POST /` - Create money order (User only)

### Wallet (`/api/v1/wallet`)

- `POST /update-balance` - Update wallet balance (Webhook)

### Receiver (`/api/v1/receiver`)

- `POST /` - Create new receiver (User only)
- `GET /` - Get receivers list with pagination (User only)

### System Config (`/api/v1/system-config`)

- `POST /` - Create/Update system configuration (Admin only)
- `GET /` - Get system configuration

## Authentication in Swagger

### Using JWT Bearer Token

1. Click the "Authorize" button in Swagger UI
2. Enter your JWT token in the "JWT-auth" section
3. Click "Authorize"
4. All subsequent requests will include the token

### Using Cookie Authentication

The application uses HTTP-only cookies for authentication. After logging in via the `/api/v1/auth/login` endpoint, the cookies will be automatically set and used for subsequent requests.

### Using Custom Headers

Some endpoints require the `x-country-code` header:

1. Click the "Authorize" button
2. Enter country code (e.g., US, GB, IN) in the "x-country-code" section
3. Click "Authorize"

### Using Webhook Authentication

The `/api/v1/wallet/update-balance` endpoint is protected by webhook authentication. This endpoint should only be called by trusted payment gateways.

**Authentication Methods:**

1. **Bearer Token in Authorization Header:**

   ```
   Authorization: Bearer <WALLET_WEBHOOK_KEY>
   ```

2. **Custom Header:**
   ```
   x-webhook-key: <WALLET_WEBHOOK_KEY>
   ```

**Setup:**

- The webhook key is configured in your `.env` file as `WALLET_WEBHOOK_KEY`
- Share this key securely with your payment gateway provider
- The key is validated on every webhook request

**In Swagger UI:**

1. Click the "Authorize" button
2. Enter the webhook key in the "JWT-auth" section (it accepts Bearer tokens)
3. Click "Authorize"
4. The webhook endpoint will now accept your requests

## DTO Schemas

All Data Transfer Objects (DTOs) are fully documented with:

- Field descriptions
- Data types
- Validation rules
- Example values
- Optional/Required indicators

### Examples:

**LoginReqDTO**

```typescript
{
  username: string; // Email or username
  password: string; // Minimum 8 characters
}
```

**RegisterUserReqDTO**

```typescript
{
  email: string;
  password: string;      // Min 8 chars
  phone?: string;        // Optional
  firstName: string;
  middleName?: string;   // Optional
  lastName: string;
}
```

**CreateMoneyOrderReqDTO**

```typescript
{
  sendingAmount: number; // In sender currency
  receiverAmount: number; // In receiver currency
  exchangeRate: number; // Applied rate
  receiver: string; // Receiver UUID
}
```

## Configuration

The Swagger configuration is located in `/src/config/app.config.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('International Money Order API')
  .setDescription('API documentation for the International Money Order system')
  .setVersion('1.0')
  .addBearerAuth()
  .addCookieAuth()
  .addApiKey()
  .build();
```

## Customization

### Adding New Endpoints

When adding new endpoints, include these decorators:

```typescript
@ApiTags('tag-name')
@ApiOperation({
  summary: 'Brief description',
  description: 'Detailed description'
})
@ApiResponse({
  status: 200,
  description: 'Success message',
  schema: { example: {...} }
})
@ApiResponse({
  status: 400,
  description: 'Error message'
})
```

### Adding New DTOs

For DTOs, use these decorators:

```typescript
export class MyDTO {
  @ApiProperty({
    description: 'Field description',
    example: 'example value',
    required: true,
  })
  myField: string;

  @ApiPropertyOptional({
    description: 'Optional field description',
    example: 'example value',
  })
  optionalField?: string;
}
```

## Security Considerations

1. **JWT Tokens**: Use secure, strong JWT secrets in production
2. **HTTPS**: Always use HTTPS in production
3. **Cookie Settings**: HTTP-only, Secure, SameSite=Strict
4. **Rate Limiting**: Consider adding rate limiting for production
5. **Swagger in Production**: Consider restricting access to Swagger UI in production

## Troubleshooting

### Swagger UI Not Loading

- Ensure the application is running
- Check that `@nestjs/swagger` is installed
- Verify the port number matches your configuration

### Authentication Not Working

- Check that cookies are enabled in your browser
- For JWT: Ensure the token is valid and not expired
- For custom headers: Verify header name matches exactly

### Endpoints Not Showing

- Ensure controllers are properly imported in modules
- Check that decorators are correctly applied
- Restart the application

## Development

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

### Building the Application

```bash
npm run build
```

## Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

## Support

For issues or questions about the API documentation, please refer to the project's main README or contact the development team.
