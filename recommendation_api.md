# Music Recommendation API Documentation

This document describes the music recommendation APIs available in the Smart Driving Assistant application.

## Base URL

All API endpoints are relative to the base URL of your Django server (e.g., `http://localhost:8000`).

## Available Endpoints

### 1. Collaborative Filtering Recommendations

Get music recommendations based on user preferences and location using collaborative filtering.

```
GET /recommendations/collaborative
```

#### Query Parameters

| Parameter | Type    | Required | Default | Description                                          |
| --------- | ------- | -------- | ------- | ---------------------------------------------------- |
| location  | string  | No       | ""      | Location to filter artists by (e.g., "utah")         |
| country   | string  | No       | ""      | Country to filter artists by (e.g., "United States") |
| user_id   | integer | No       | 2       | User ID to get recommendations for                   |
| n         | integer | No       | 100     | Number of recommendations to return                  |

#### Example Request

```http
GET /recommendations/collaborative?location=utah&country=United States&n=10&user_id=2
```

#### Success Response

```json
{
  "success": true,
  "recommendations": [
    {
      "artist": "Imagine Dragons",
      "score": 0.95
    },
    {
      "artist": "The Killers",
      "score": 0.85
    }
  ]
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message details"
}
```

### 2. Content-Based Recommendations

Get music recommendations based on song lyrics and content similarity.

```
GET /recommendations/content
```

#### Query Parameters

| Parameter | Type    | Required | Default | Description                                 |
| --------- | ------- | -------- | ------- | ------------------------------------------- |
| song      | string  | Yes      | -       | Name of the song to get recommendations for |
| n         | integer | No       | 4       | Number of recommendations to return         |

#### Example Request

```http
GET /recommendations/content?song=Yellow&n=5
```

#### Success Response

```json
{
  "success": true,
  "recommendations": [
    {
      "song": "Fix You",
      "artist": "Coldplay",
      "similarity_score": 0.89
    },
    {
      "song": "The Scientist",
      "artist": "Coldplay",
      "similarity_score": 0.82
    }
  ]
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Song parameter is required"
}
```

## Response Codes

| Status Code | Description                                 |
| ----------- | ------------------------------------------- |
| 200         | Success - Request completed successfully    |
| 400         | Bad Request - Invalid parameters or request |
| 404         | Not Found - Resource not found              |
| 500         | Server Error - Internal server error        |

## Common Error Messages

1. "Song parameter is required" - The song parameter is missing in content-based recommendations
2. "Invalid user_id" - The provided user_id is not valid
3. "Invalid number of recommendations" - The 'n' parameter is not a valid number

## Usage Tips

1. **Collaborative Filtering**

   - Best for discovering new artists based on user preferences
   - More accurate with location and country filters
   - Returns artists sorted by relevance score

2. **Content-Based**
   - Best for finding similar songs based on lyrics and content
   - More accurate for finding songs with similar themes/style
   - Returns both song and artist information

## Rate Limiting

Currently, there are no rate limits implemented on these endpoints. However, it's recommended to:

- Limit requests to a reasonable number (e.g., 100 per minute)
- Cache responses when possible
- Use appropriate values for 'n' parameter (recommended: 5-20)

## Examples Using cURL

### Collaborative Filtering Request

```bash
curl -X GET 'http://localhost:8000/recommendations/collaborative?location=utah&country=United%20States&n=10'
```

### Content-Based Request

```bash
curl -X GET 'http://localhost:8000/recommendations/content?song=Yellow&n=5'
```

## Integration with Frontend

Example of how to integrate with React Native frontend:

```javascript
// Collaborative filtering example
const getCollaborativeRecommendations = async (location, country, n = 10) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recommendations/collaborative?location=${location}&country=${country}&n=${n}`
    );
    const data = await response.json();
    if (data.success) {
      return data.recommendations;
    }
    throw new Error(data.error);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};

// Content-based example
const getContentBasedRecommendations = async (song, n = 5) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recommendations/content?song=${encodeURIComponent(
        song
      )}&n=${n}`
    );
    const data = await response.json();
    if (data.success) {
      return data.recommendations;
    }
    throw new Error(data.error);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};
```

## Data Models

### Artist Model

```python
{
    "artist": str,        # Artist name
    "score": float,       # Recommendation score (0-1)
}
```

### Song Model

```python
{
    "song": str,              # Song name
    "artist": str,            # Artist name
    "similarity_score": float # Similarity score (0-1)
}
```
