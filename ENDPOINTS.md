# VitaTrack API Documentation

## Base URL
```
http://localhost:5001
```

## Authentication
All API routes (except `/auth/*`) require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## John's Test Token
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImZpcnN0TmFtZSI6IkpvaG4iLCJsYXN0TmFtZSI6IkRvZSIsImlhdCI6MTc1OTM2NTQ1NiwiZXhwIjoxNzU5NDUxODU2fQ.fvcII3x0lJ6h1TlgPN7GE9iVq2_1tJImJrfn2B6LJbg"
}
```

---

## Food Logs API

### Get Daily Food Logs
```http
GET /api/food-logs/daily/:date
```
**Example:** `GET /api/food-logs/daily/2025-10-01`

**Response:**
```json
[
  {
    "id": 7,
    "userId": 1,
    "foodName": "Oatmeal with Berries",
    "servingSize": 1,
    "servingUnit": "bowl",
    "calories": 300,
    "protein": 10,
    "carbs": 45,
    "fat": 8,
    "fiber": 6,
    "sugar": 12,
    "mealType": "breakfast",
    "loggedDate": "2025-10-01T00:00:00.000Z",
    "foodApiId": null,
    "createdAt": "2025-10-02T01:02:14.942Z",
    "updatedAt": "2025-10-02T01:02:14.942Z"
  }
]
```

### Create Food Log Entry
```http
POST /api/food-logs
Content-Type: application/json
```

**Request Body:**
```json
{
  "loggedDate": "2025-10-01",
  "mealType": "breakfast",
  "foodName": "Oatmeal with Berries",
  "calories": 300,
  "protein": 10,
  "carbs": 45,
  "fat": 8,
  "fiber": 6,
  "sugar": 12,
  "servingSize": 1,
  "servingUnit": "bowl"
}
```

**Required Fields:**
- `loggedDate` (string, YYYY-MM-DD)
- `mealType` (string: "breakfast", "lunch", "dinner", "snack")
- `foodName` (string)
- `calories` (number)
- `servingSize` (number)
- `servingUnit` (string: "bowl", "cup", "gram", "oz", etc.)

**Optional Fields:**
- `protein` (number, defaults to 0)
- `carbs` (number, defaults to 0)
- `fat` (number, defaults to 0)
- `fiber` (number)
- `sugar` (number)

### Update Food Log
```http
PUT /api/food-logs/:id
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "calories": 320,
  "protein": 12,
  "servingSize": 1.5
}
```

### Delete Food Log
```http
DELETE /api/food-logs/:id
```

**Response:**
```json
{
  "message": "Food log deleted successfully"
}
```

### Get Daily Nutrition Stats
```http
GET /api/food-logs/stats/daily/:date
```
**Example:** `GET /api/food-logs/stats/daily/2025-10-01`

**Response:**
```json
{
  "totalCalories": 300,
  "totalProtein": 10,
  "totalCarbs": 45,
  "totalFat": 8,
  "totalFiber": 6,
  "totalSugar": 12,
  "mealCount": 1,
  "date": "2025-10-01T00:00:00.000Z"
}
```

### Get Meal Breakdown
```http
GET /api/food-logs/stats/meals/:date
```

**Response:**
```json
{
  "breakfast": {
    "calories": 300,
    "protein": 10,
    "carbs": 45,
    "fat": 8
  },
  "lunch": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  },
  "dinner": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  },
  "snack": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  }
}
```

### Get Nutrition Trends
```http
GET /api/food-logs/trends?startDate=2025-09-24&endDate=2025-10-01
```

**Response:**
```json
[
  {
    "date": "2025-10-01T00:00:00.000Z",
    "totalCalories": 300,
    "totalProtein": 10,
    "totalCarbs": 45,
    "totalFat": 8,
    "mealCount": 1
  }
]
```

---

## Workouts API

### Get Workouts
```http
GET /api/workouts?startDate=2025-09-24&endDate=2025-10-01
```

**Response:**
```json
[
  {
    "id": 5,
    "userId": 1,
    "workoutName": "Morning run",
    "workoutType": "cardio",
    "duration": 45,
    "distance": 5.2,
    "intensity": null,
    "sets": null,
    "reps": null,
    "weight": null,
    "notes": null,
    "caloriesBurned": 400,
    "workoutDate": "2025-10-01T00:00:00.000Z",
    "isGenerated": false,
    "createdAt": "2025-10-02T01:06:37.977Z",
    "updatedAt": "2025-10-02T01:06:37.977Z"
  }
]
```

### Create Workout
```http
POST /api/workouts
Content-Type: application/json
```

**Request Body:**
```json
{
  "workoutName": "Morning Run",
  "workoutDate": "2025-10-01",
  "workoutType": "cardio",
  "duration": 45,
  "distance": 5.2,
  "caloriesBurned": 400,
  "notes": "Felt great today!"
}
```

**Required Fields:**
- `workoutName` (string)
- `workoutDate` (string, YYYY-MM-DD)
- `workoutType` (string: "cardio", "strength", "flexibility", "sports")
- `duration` (number, in minutes)

**Optional Fields:**
- `distance` (number, miles/km)
- `intensity` (string: "low", "moderate", "high")
- `sets` (number)
- `reps` (number)
- `weight` (number, lbs/kg)
- `notes` (string)
- `caloriesBurned` (number)

### Update Workout
```http
PUT /api/workouts/:id
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "duration": 50,
  "distance": 6.0,
  "caloriesBurned": 450
}
```

### Delete Workout
```http
DELETE /api/workouts/:id
```

**Response:**
```json
{
  "message": "Workout deleted successfully"
}
```

### Get Weekly Workout Stats
```http
GET /api/workouts/stats/weekly?startDate=2025-09-24&endDate=2025-10-01
```

**Response:**
```json
{
  "totalWorkouts": 1,
  "totalDuration": 45,
  "totalDistance": 5.2,
  "totalCaloriesBurned": 400,
  "averageDuration": 45,
  "workoutTypeBreakdown": [
    {
      "type": "cardio",
      "count": 1,
      "totalDuration": 45
    }
  ],
  "weekStart": "2025-09-24T00:00:00.000Z",
  "weekEnd": "2025-10-01T00:00:00.000Z"
}
```

### Get Workout Trends
```http
GET /api/workouts/trends?startDate=2025-09-01&endDate=2025-10-01
```

**Response:**
```json
[
  {
    "weekStart": "2025-09-29T00:00:00.000Z",
    "workoutCount": 1,
    "totalDuration": 45,
    "totalCalories": 400,
    "avgDuration": 45
  }
]
```

---

## Goals API

### Get Active Goals
```http
GET /api/goals
```

**Response:**
```json
[
  {
    "id": 5,
    "userId": 1,
    "goalName": "Daily Calorie Target",
    "goalType": "daily_calories",
    "targetValue": 2000,
    "targetUnit": "calories",
    "period": "daily",
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": null,
    "currentValue": 1500,
    "lastUpdated": "2025-10-02T01:23:13.343Z",
    "currentStreak": 0,
    "bestStreak": 0,
    "isActive": true,
    "isCompleted": false,
    "createdAt": "2025-10-02T01:13:45.175Z",
    "updatedAt": "2025-10-02T01:23:13.497Z"
  }
]
```

### Get All Goals with Progress
```http
GET /api/goals/progress
```

**Response:**
```json
[
  {
    "id": 5,
    "userId": 1,
    "goalName": "Daily Calorie Target",
    "goalType": "daily_calories",
    "targetValue": 2000,
    "targetUnit": "calories",
    "period": "daily",
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": null,
    "currentValue": 1500,
    "lastUpdated": "2025-10-02T01:23:13.343Z",
    "currentStreak": 0,
    "bestStreak": 0,
    "isActive": true,
    "isCompleted": false,
    "createdAt": "2025-10-02T01:13:45.175Z",
    "updatedAt": "2025-10-02T01:23:13.497Z",
    "progressPercent": 75,
    "remaining": 500
  }
]
```

### Get Single Goal Progress
```http
GET /api/goals/:id/progress
```

**Response:**
```json
{
  "id": 5,
  "userId": 1,
  "goalName": "Daily Calorie Target",
  "goalType": "daily_calories",
  "targetValue": 2000,
  "currentValue": 1500,
  "isActive": true,
  "progressPercent": 75,
  "isCompleted": false,
  "remaining": 500
}
```

### Create Goal
```http
POST /api/goals
Content-Type: application/json
```

**Request Body:**
```json
{
  "goalName": "Daily Calorie Target",
  "goalType": "daily_calories",
  "targetValue": 2000,
  "targetUnit": "calories",
  "period": "daily",
  "startDate": "2025-10-01",
  "currentValue": 0,
  "isActive": true
}
```

**Required Fields:**
- `goalName` (string)
- `goalType` (string: "calories", "workout_frequency", "weight", "habit")
- `targetValue` (number)
- `targetUnit` (string: "calories", "workouts", "lbs", "days", etc.)
- `period` (string: "daily", "weekly", "monthly")
- `startDate` (string, YYYY-MM-DD)

**Optional Fields:**
- `currentValue` (number, defaults to 0)
- `deadline` (string, YYYY-MM-DD) - maps to endDate in database
- `isActive` (boolean, defaults to true)

### Update Goal Progress
```http
PATCH /api/goals/:id/progress
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentValue": 1500,
  "currentStreak": 5
}
```

**Required Fields:**
- `currentValue` (number)

**Optional Fields:**
- `currentStreak` (number)

---

## Frontend Usage Examples

### React/JavaScript Example
```javascript
// Fetch dashboard data
const fetchDashboard = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:5001/api/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};

// Create a food log entry
const logFood = async (foodData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:5001/api/food-logs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      loggedDate: "2025-10-01",
      mealType: "breakfast",
      foodName: "Oatmeal",
      calories: 300,
      protein: 10,
      carbs: 45,
      fat: 8,
      servingSize: 1,
      servingUnit: "bowl"
    })
  });
  
  const newLog = await response.json();
  return newLog;
};

// Update goal progress
const updateGoal = async (goalId, currentValue) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`http://localhost:5001/api/goals/${goalId}/progress`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ currentValue })
  });
  
  const updatedGoal = await response.json();
  return updatedGoal;
};
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (missing/invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (invalid token)
- `404` - Not found
- `500` - Server error

---

## Important Notes

1. **All IDs are integers**, not strings
2. **servingSize must be a number**, servingUnit is a separate string field
3. **workoutName is required** when creating workouts
4. **Goals require multiple fields**: goalName, targetUnit, period, and startDate in addition to goalType and targetValue
5. **Dates should be in ISO format** (YYYY-MM-DD) for inputs
6. **All routes except /auth/* require authentication**