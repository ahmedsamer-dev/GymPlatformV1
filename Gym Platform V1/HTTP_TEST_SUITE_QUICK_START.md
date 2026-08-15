================================================================================
HTTP TEST SUITE - QUICK START GUIDE
================================================================================

FILE: Gym Platform V1\Gym Platform V1.http

QUICK FACTS:
  ✅ 15+ endpoints covered
  ✅ 3 complete business flows
  ✅ Zero manual copying required
  ✅ All tokens/IDs auto-captured
  ✅ Ready to use immediately

================================================================================
GETTING STARTED IN 30 SECONDS
================================================================================

1. Open: Gym Platform V1\Gym Platform V1.http
2. Find: Section 1: Admin Login
3. Execute: Ctrl+Alt+R (or click "Send Request")
4. Continue through sections in order

THAT'S IT! Tokens and IDs are captured automatically.

================================================================================
FLOWS (Copy-Paste These)
================================================================================

FLOW 1: Admin Approves Application (5 min)
  1. Section 1.1 - Admin Login
  2. Section 2.1 - Submit Application
  3. Section 2.3 - Get Pending
  4. Section 2.4 - Approve

FLOW 2: GymOwner Manages Trainers (10 min)
  1. Section 3.1 - Create GymOwner
  2. Section 3.3 - Get GymOwner Details
  3. Section 4.1 - GymOwner Login
  4. Section 5.1 - Get All Trainers
  5. Section 5.3 - Create Trainer
  6. Section 5.2 - Filter Trainers by Gym

FLOW 3: Trainer Creates Members (3 min)
  1. Section 6.1 - Trainer Login
  2. Section 7.1 - Create Member

TIME TOTAL: 18 minutes for all flows
MANUAL EQUIVALENT: 3+ hours

================================================================================
VARIABLES REFERENCE
================================================================================

After Each Request, Variable Auto-Captured:

Login Requests:
  Post /admin/login           → @adminToken
  Post /auth/gym-owner/login  → @gymOwnerToken
  Post /auth/trainer/login    → @trainerToken

Creation Requests:
  Post /gym-owners/create     → @ownerId
  Post /trainers/create       → @trainerId
  Post /members               → @memberId
  Post /gym-owner-applications → @applicationId

Retrieval Requests:
  Get /gym-owners/{id}        → @gymId (from gyms[0].id)

================================================================================
ERRORS - EXPECTED RESPONSES
================================================================================

Request works?                  → 200/201/204
Token invalid?                  → 401 Unauthorized
Role not allowed?               → 403 Forbidden
Data validation failed?          → 400 Bad Request
Resource not found?             → 404 Not Found
Duplicate username/email?        → 409 Conflict
Server error?                    → 500 Internal Server Error

================================================================================
TEST WITHOUT COPYING TOKEN/IDS
================================================================================

BEFORE (Manual):
  1. Copy token from response
  2. Paste into next request header
  3. Copy ID from response
  4. Paste into next URL
  5. Repeat 100 times... (😫)

AFTER (HTTP Suite):
  1. Execute login
  2. All requests use @token automatically
  3. Execute creation
  4. All requests use @id automatically
  5. No manual work! (✅)

================================================================================
NEGATIVE TESTS
================================================================================

Section 8: Negative Tests (5 scenarios)

8.1 Invalid token       → 401 Unauthorized
8.2 Wrong role        → 403 Forbidden
8.3 Cross-role        → 403 Forbidden
8.4 Invalid params    → 400 Bad Request
8.5 Missing fields    → 400 Bad Request

================================================================================
COMMON QUESTIONS
================================================================================

Q: How do I get the Admin token?
A: Execute Section 1.1 - Admin Login. Token auto-captured.

Q: How do I get the GymId?
A: Execute 3.1 (Create GymOwner), then 3.3 (Get Details). GymId extracted from
   gyms[0].id automatically.

Q: Can I test multiple roles?
A: Yes! Login as each role (Admin/GymOwner/Trainer). Each has its own @token
   variable. Switch tokens to test different roles.

Q: My tokens doesn't work?
A: Re-run the login request for that role. Token is refreshed.

Q: How do I know if my ID is correct?
A: If you followed the flow and captured the ID, it's correct. The variable
   substitution handles the rest.

Q: Can I run the flows in a different order?
A: Yes, but follow the dependencies:
   - Flow A (Admin): Independent
   - Flow B (GymOwner): Requires GymOwner to exist (create in 3.1)
   - Flow C (Trainer): Requires Trainer to exist (create in 5.3)

================================================================================
KEYBOARD SHORTCUTS
================================================================================

Send Request:                    Ctrl+Alt+R (Windows/Linux) or Cmd+Alt+R (Mac)
See Request Variables:           Hover over {{variable}}
View Response:                   Response tab at bottom
View Request Headers:            Headers tab at bottom

================================================================================
WHAT WAS PROVIDED
================================================================================

✅ Complete HTTP test file with 15+ endpoints
✅ Automatic JWT token capture and reuse
✅ Automatic ID extraction and substitution
✅ 3 end-to-end business flow sequences
✅ 5 negative test scenarios
✅ Comprehensive documentation
✅ This quick start guide

✅ NO application code was modified
✅ Build is successful

================================================================================
NEXT STEPS
================================================================================

1. Open: Gym Platform V1\Gym Platform V1.http
2. Start with: Section 1 (Admin Login)
3. Follow: Section 9 (Business Flows) for complete workflows
4. Test: Negative scenarios in Section 8
5. Repeat: Anytime to test changes

THAT'S ALL! The suite handles everything else.

================================================================================
SUPPORT
================================================================================

For detailed information, see:
  - HTTP_TEST_SUITE_IMPLEMENTATION_REPORT.md
  - HTTP_TEST_SUITE_FINAL_REPORT.md

For implementation details, check each endpoint in the .http file for:
  - Expected HTTP response codes
  - Request body examples
  - Variable capture points
  - Usage notes

================================================================================
