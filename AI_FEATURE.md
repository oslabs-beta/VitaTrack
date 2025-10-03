# AI Nutrition Summary Feature

## Overview

This feature uses OpenAI's GPT-4.1-mini to generate natural language nutrition summaries from meal descriptions. Users can input text like "two scrambled eggs with toast and butter" and receive estimated calorie counts and macronutrient breakdowns.

## Files Added

### `controllers/nutritionController.ts`
- Handles POST requests to generate AI nutrition summaries
- Sends user's meal description to OpenAI API
- Returns a concise paragraph (max 50 words) with estimated calories, carbs, protein, and fat
- Includes reasonable assumptions when quantities are unclear

### `routes/nutritionRoutes.ts`
- Defines the route `/api/ai/nutrition/summary`
- Requires authentication via JWT token
- Maps POST requests to the nutrition controller

## Implementation Steps Completed

### 1. Database Schema Update
Added `aiSummary` column to the `FoodLog` model in `prisma/schema.prisma`:

```prisma
model FoodLog {
  // ... existing fields
  aiSummary   String?  @map("ai_summary")
  // ... rest of model
}
```

**Apply schema changes to Supabase:**
```bash
npx prisma db push
npx prisma generate
```

The `db push` command syncs your schema directly to the database without creating migration files. You should see:
```
🚀  Your database is now in sync with your Prisma schema.
```

### 2. Updated Interfaces
Modified `CreateFoodLogInput` in `queries.ts`:

```typescript
interface CreateFoodLogInput {
  // ... existing fields
  aiSummary?: string  // Added
}
```

### 3. Installed Dependencies
```bash
npm install openai
```

### 4. Environment Variables
Added to `.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

### 5. Mounted Route
Updated `server.ts`:

```typescript
import nutritionRoutes from "./routes/nutritionRoutes.js";
app.use("/api/ai", nutritionRoutes);
```

### 6. Authentication
Modified `nutritionRoutes.ts` to require authentication:

```typescript
router.use(authMiddleware);
```

### 7. Rebuild and Restart
```bash
npm run build
npm start
```

## API Endpoint

### Generate Nutrition Summary

**Endpoint:** `POST /api/ai/nutrition/summary`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "two scrambled eggs with toast and butter"
}
```

**Response:**
```json
{
  "summary": "Your meal of two scrambled eggs with toast and butter is roughly 300-350 kcal, with about 20g protein, 20-25g carbs, and 15-20g fat. This estimate assumes one slice of toast with a pat of butter and standard-sized eggs. A balanced, satisfying start!"
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "error": "text is required"
}
```

502 Bad Gateway:
```json
{
  "error": "no_content"
}
```

500 Server Error:
```json
{
  "error": "server_error",
  "detail": "error message"
}
```

## Testing

### 1. Start the Server
```bash
npm run build
npm start
```

### 2. Get Authentication Token
```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

Save the token from the response.

### 3. Test AI Nutrition Summary

**Using curl:**
```bash
TOKEN="your_token_here"

curl -X POST http://localhost:5001/api/ai/nutrition/summary \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "chicken breast with rice and broccoli"}'
```

**Using Thunder Client (VS Code):**
1. Method: POST
2. URL: `http://localhost:5001/api/ai/nutrition/summary`
3. Headers:
   - `Authorization`: `Bearer YOUR_TOKEN`
   - `Content-Type`: `application/json`
4. Body (JSON):
   ```json
   {
     "text": "grilled salmon with quinoa and asparagus"
   }
   ```

### 4. Create Food Log with AI Summary

After getting the AI summary, include it when creating a food log:

**Using curl:**
```bash
curl -X POST http://localhost:5001/api/food-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loggedDate": "2025-10-02",
    "mealType": "lunch",
    "foodName": "Chicken with rice and broccoli",
    "calories": 450,
    "protein": 40,
    "carbs": 50,
    "fat": 10,
    "servingSize": 1,
    "servingUnit": "plate",
    "aiSummary": "Your meal of chicken breast with rice and broccoli is approximately 450 kcal with 40g protein, 50g carbs, and 10g fat. A well-balanced, nutritious meal!"
  }'
```

**Using Thunder Client:**
1. Method: POST
2. URL: `http://localhost:5001/api/food-logs`
3. Headers:
   - `Authorization`: `Bearer YOUR_TOKEN`
   - `Content-Type`: `application/json`
4. Body (JSON):
   ```json
   {
     "loggedDate": "2025-10-02",
     "mealType": "dinner",
     "foodName": "Grilled Chicken",
     "calories": 400,
     "protein": 50,
     "carbs": 10,
     "fat": 15,
     "servingSize": 1,
     "servingUnit": "plate",
     "aiSummary": "Your grilled chicken dinner has about 400 kcal with 50g protein, 10g carbs, and 15g fat. A lean, high-protein meal!"
   }
   ```

### 5. Verify Storage

**Check via API:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/food-logs/daily/2025-10-02
```

The response should include the `aiSummary` field.

**Check via Tableviewer:**
1. Open `http://localhost:5001` in browser
2. Navigate to food_logs table
3. Hard refresh the page (Ctrl+Shift+R)
4. You should see the `ai_summary` column with your saved data

## Usage Workflow

### Recommended Implementation (Frontend)

1. User enters meal description in a text field
2. Frontend calls `/api/ai/nutrition/summary` to get AI estimation
3. Frontend displays the summary to the user
4. User can edit/confirm the values
5. Frontend includes `aiSummary` in the POST request to `/api/food-logs`
6. AI summary is saved with the food log entry
7. When viewing past meals, the stored AI summary is displayed

### Token Efficiency

To minimize OpenAI API costs:
- Only generate summaries when explicitly requested by the user
- Store the summary in the database on first generation
- Return stored summaries on subsequent fetches (don't regenerate)
- Consider adding a "Regenerate Summary" button for updates only

**Important:** The `/api/ai/nutrition/summary` endpoint only generates text - it does NOT save anything to the database. The frontend must explicitly include the `aiSummary` field when calling `/api/food-logs` to persist it.

## Important Notes

1. **Authentication Required:** All requests must include a valid JWT token
2. **OpenAI API Key:** Ensure `OPENAI_API_KEY` is set in `.env`
3. **Model:** Uses `gpt-4.1-mini` for cost efficiency
4. **Temperature:** Set to 0.2 for consistent, less creative responses
5. **Accuracy:** AI estimates are approximations and may not be precise
6. **Storage:** The `aiSummary` field is optional in the database
7. **Two Separate Endpoints:**
   - `/api/ai/nutrition/summary` - generates AI text (does NOT save)
   - `/api/food-logs` - saves food log (include `aiSummary` in body to persist)

## Error Handling

The controller handles:
- Missing or invalid text input (400)
- OpenAI API failures (500)
- Empty responses from OpenAI (502)

All errors are logged to the console for debugging.

## Troubleshooting

### Column not appearing in tableviewer
If the `ai_summary` column doesn't appear in the tableviewer after running `npx prisma db push`:
1. Hard refresh the browser (Ctrl+Shift+R)
2. Check Supabase dashboard → Table Editor → food_logs to verify column exists
3. Restart the server after schema changes

### Token expired errors
JWT tokens expire after 7 days, or may expire for other reasons. Get a new token by calling the login endpoint again.

### OpenAI API errors
Check that `OPENAI_API_KEY` is correctly set in `.env` and that you have API credits in your OpenAI account.