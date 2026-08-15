FLUENT VALIDATION INTEGRATION GUIDE
===================================

## How FluentValidation Works in This Project

### Automatic Validation Flow

1. **Client sends HTTP request** with JSON body
   ```
   POST /api/gym-owner-applications
   {
	 "fullName": "Ahmed",
	 "userName": "ahmed123",
	 "email": "ahmed@example.com",
	 "phoneNumber": "01012345678",
	 "password": "Password@123",
	 "gymName": "My Gym",
	 "gymAddress": "123 Street",
	 "gymPhoneNumber": "01012345678"
   }
   ```

2. **ASP.NET Core Model Binding** deserializes JSON into DTO
   ```csharp
   CreateGymOwnerApplicationRequestDto request
   ```

3. **FluentValidation Auto-Validation** (configured in Program.cs)
   - Discovers all validators via `AddValidatorsFromAssembly`
   - Automatically matches DTO type to validator class
   - Validates the DTO instance

4. **Validation Result**
   - If validation FAILS → returns 400 BadRequest with error details
   - If validation PASSES → controller action executes

### Example: CreateGymOwnerApplicationRequestDto

**Request with invalid data:**
```json
{
  "fullName": "AB",
  "userName": "a",
  "email": "invalid-email",
  "phoneNumber": "123",
  "password": "weak",
  "gymName": "",
  "gymAddress": "123 Street",
  "gymPhoneNumber": "01012345678"
}
```

**FluentValidation Response (400 Bad Request):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "...",
  "errors": {
	"FullName": ["Full name must be between 3 and 100 characters"],
	"UserName": ["Username must be between 3 and 50 characters"],
	"Email": ["Invalid email format"],
	"PhoneNumber": ["Invalid Egyptian phone number"],
	"Password": ["Password must contain uppercase, lowercase, number, and special character"],
	"GymName": ["Gym name is required"]
  }
}
```

## Validator Discovery and Registration

### Program.cs Configuration
```csharp
// Automatically discovers all IValidator<T> implementations
builder.Services.AddValidatorsFromAssembly(
	typeof(Program).Assembly, 
	includeInternalTypes: true
);
```

### Validator Naming Convention
- DTO: `CreateGymOwnerApplicationRequestDto`
- Validator: `CreateGymOwnerApplicationRequestDtoValidator`
- Pattern: `{DtoName}Validator`

### Validator Accessibility
- All validators are `internal sealed`
- FluentValidation still discovers them due to `includeInternalTypes: true`
- Prevents accidental direct instantiation from controllers

## Validation Rules by DTO

### Login Validators
**AdminLoginRequestDtoValidator**
- UserName: 3-50 characters
- Password: 6-255 characters

**TrainerLoginRequestDtoValidator**
- Same as Admin

**GymOwnerLoginRequestDtoValidator**
- Same as Admin

### Application Validators
**CreateGymOwnerApplicationRequestDtoValidator**
- FullName: 3-100 letters only (Arabic/English)
- UserName: 3-50 alphanumeric + underscore
- Email: Valid email format, max 150 chars
- PhoneNumber: Egyptian format (01[0125]XXXXXXXX)
- Password: 8-100 chars with uppercase, lowercase, digit, special char
- GymName: 2-100 characters
- GymAddress: Max 250 characters
- GymPhoneNumber: Egyptian format

**RejectApplicationRequestDtoValidator**
- RejectionReason: 5-500 characters

### Owner Validators
**CreateGymOwnerRequestDtoValidator**
- FullName: 3-100 letters only
- UserName: 3-50 alphanumeric + underscore
- Email: Valid email, max 150 chars
- PhoneNumber: Egyptian format
- Password: Complex requirements

### Member Validators
**CreateMemberRequestDtoValidator**
- FullName: Max 100 characters
- PhoneNumber: Egyptian format

### Trainer Validators
**CreateTrainerRequestDtoValidator**
- FullName: Max 100 characters
- UserName: 3-50 characters
- Password: 6-255 characters
- PhoneNumber: Egyptian format
- Salary: >= 0
- Address: Max 250 characters
- HireDate: Not in future
- GymId: Must be > 0

## Business Validation (Still in Services)

These are NOT validated in DTOs - they're validated in Services:

### Database Existence Checks
```csharp
// In TrainerService.CreateTrainerAsync
var gym = await _dbContext.Gyms
	.FirstOrDefaultAsync(g => 
		g.Id == request.GymId && 
		g.GymOwnerID == ownerId);

if (gym == null)
	throw new InvalidOperationException("Gym not found");
```

### Uniqueness Checks
```csharp
// In GymOwnerApplicationService.SubmitApplicationAsync
var duplicateInOwners = await _dbContext.GymOwners
	.AnyAsync(o => 
		o.UserName == request.UserName || 
		o.Email == request.Email);

if (duplicateInOwners)
	throw new InvalidOperationException("Username already taken");
```

### Status Checks
```csharp
// In TrainerService.CreateTrainerAsync
if (!owner.IsActive)
	throw new InvalidOperationException("GymOwner account is inactive");
```

## Testing Validation

### Manual Testing with Swagger
1. Start the application
2. Navigate to Swagger UI (if enabled)
3. Expand the endpoint you want to test
4. Click "Try it out"
5. Enter invalid data and submit
6. Observe 400 Bad Request with validation errors

### Example: Invalid Registration
**Request:**
```
POST /api/gym-owner-applications
Content-Type: application/json

{
  "fullName": "a",
  "userName": "",
  "email": "not-an-email",
  "phoneNumber": "123",
  "password": "123456",
  "gymName": "G",
  "gymAddress": "",
  "gymPhoneNumber": "123"
}
```

**Response:**
```
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "errors": {
	"FullName": ["Full name must be between 3 and 100 characters"],
	"UserName": ["Username is required"],
	"Email": ["Invalid email format"],
	"PhoneNumber": ["Invalid Egyptian phone number"],
	"Password": ["Password must contain uppercase, lowercase, number, and special character"],
	"GymName": ["Gym name must be between 2 and 100 characters"],
	"GymAddress": ["Gym address is required"],
	"GymPhoneNumber": ["Invalid Egyptian phone number"]
  }
}
```

## Important Notes

### 1. No Duplicate Validation
- DTO validators check: Format, Length, Pattern
- Service validators check: Uniqueness, Existence, Business Rules
- This is correct and intentional - they serve different purposes

example:
```csharp
// DTO Validator
RuleFor(x => x.UserName)
	.Length(3, 50)  // Format check

// Service
var exists = await _dbContext.GymOwners
	.AnyAsync(o => o.UserName == request.UserName);
// Uniqueness check
```

### 2. Response DTOs Are Not Validated
- CreateMemberResponseDto, MemberResponseDto, etc.
- These are sent TO the client, not received FROM the client
- Server generates them, so they don't need input validation

### 3. Validation Order
1. **Model Binding** - JSON → DTO
2. **FluentValidation** - DTO shape validation
3. **Controller** - Authorization check
4. **Service** - Business logic validation
5. **Database** - Constraint violations

### 4. Error Response Format
When FluentValidation fails, ASP.NET Core automatically returns:
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
	"PropertyName": ["Error message"]
  }
}
```

## Migration from DataAnnotations

### Old Way (DataAnnotations)
```csharp
public class CreateGymOwnerRequestDto
{
	[Required]
	[StringLength(100)]
	public string FullName { get; set; }
}
```

### New Way (FluentValidation)
```csharp
public class CreateGymOwnerRequestDtoValidator : AbstractValidator<CreateGymOwnerRequestDto>
{
	public CreateGymOwnerRequestDtoValidator()
	{
		RuleFor(x => x.FullName)
			.NotEmpty()
			.MaximumLength(100);
	}
}
```

## Benefits of FluentValidation

1. **Separation of Concerns** - Validation logic isolated from DTO
2. **Reusability** - Validators can be used in multiple contexts
3. **Testability** - Easier to unit test validators independently
4. **Flexibility** - Complex rules easier to express
5. **Maintainability** - Business rules centralized
6. **Performance** - Validators only instantiated when needed

## Troubleshooting

### Validators Not Being Applied
- Check that `AddValidatorsFromAssembly()` is called in Program.cs
- Verify validator class name follows naming convention
- Ensure validator class implements `AbstractValidator<T>`
- Check that `includeInternalTypes: true` is set

### Validation Not Triggered
- Ensure parameter is marked with `[FromBody]` attribute
- Verify DTO class name matches validator type
- Check that ModelState.IsValid is not bypassed in controller

### Custom Validation Not Working
- Use `RuleFor()` method for property-level rules
- Use `RuleSet()` for different validation scenarios
- Use `When()` for conditional validation
- Use `Custom()` for complex cross-property validation

## Contact & Support

For questions about FluentValidation implementation contact the development team.

Refer to official FluentValidation documentation:
https://docs.fluentvalidation.net/
