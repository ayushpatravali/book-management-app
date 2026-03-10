# Book Management API

A Node.js and Express REST API with custom request logging middleware that records every incoming request to a file.

Live Demo: [add Railway URL here after deployment]

## What This Is

This is a REST API built with Node.js and Express that manages a collection of books with full CRUD operations. The real point of the project is the custom request logging middleware that sits at the front door of the server and records every single incoming request to a log file, capturing the method, URL, status code, and how long the server took to respond. The book API is just a stage to test the logger against real HTTP traffic and make sure it handles everything correctly.

## Project Structure

```
book-management-app/
  config/
    loggerConfig.js
  middleware/
    requestLogger.js
  utils/
    fileWriter.js
  routes/
    books.js
  logs/
    .gitkeep
  app.js
  server.js
  package.json
  README.md
```

The config folder holds `loggerConfig.js`, which is the single source of truth for how the logger behaves. The middleware folder contains `requestLogger.js`, the core middleware that intercepts every request and records it. The utils folder has `fileWriter.js`, a small utility that handles the actual file I/O so the middleware does not have to deal with it directly. Routes live in the routes folder, with `books.js` handling all CRUD operations for books. The entry point is `server.js`, which starts the HTTP server, while `app.js` wires together the middleware and routes. The logs folder is where `requests.log` gets created at runtime.

## Getting Started

### Prerequisites

Node.js version 14 or above.

### Installation

```bash
git clone <your-repo-url>
cd book-management-app
npm install
npm run dev
```

The server starts on port 3000 by default. You should see two lines in the console confirming the server is running and where logs will be written.

## API Endpoints

| Method | Endpoint        | Description             | Request Body                                      |
|--------|-----------------|-------------------------|---------------------------------------------------|
| GET    | /               | API health check        | None                                              |
| GET    | /api/books      | Get all books           | None                                              |
| GET    | /api/books/:id  | Get a single book by id | None                                              |
| POST   | /api/books      | Add a new book          | `{ "title": "...", "author": "...", "genre": "...", "year": 2024 }` |
| PUT    | /api/books/:id  | Update a book           | Any subset of `{ "title", "author", "genre", "year" }` |
| DELETE | /api/books/:id  | Delete a book           | None                                              |

## How the Logger Works

When a request comes in, it first passes through the `requestLogger` middleware. The middleware records the current time and attaches a listener to the response's `finish` event. It then calls `next()` to let the request continue to the appropriate route handler. Once the route handler sends a response and Express finishes writing it, the `finish` event fires. At that point, the middleware calculates how long the response took, builds a log entry object, converts it to JSON, and passes it to the `fileWriter` utility. The file writer appends the entry to the log file asynchronously.

```
Incoming Request
      |
      v
requestLogger middleware
      |
      +-- captures method, url, start time
      |
      v
request continues to route handler
      |
      v
response is sent
      |
      v
res.finish event fires
      |
      +-- calculates response time
      +-- builds log entry
      +-- appends to requests.log
      |
      v
Log entry written
```

## Log Format

Each line in `logs/requests.log` is a standalone JSON object. Here is what a typical entry looks like:

```json
{
  "timestamp": "2026-03-08T06:15:42.318Z",
  "method": "GET",
  "url": "/api/books",
  "statusCode": 200,
  "responseTime": "4ms"
}
```

Every request generates one line. The file grows over time and can be cleared manually or through a future log rotation feature.

## Configuration

All logger behavior is controlled by a single config file at `config/loggerConfig.js`. Here is the default configuration:

```javascript
{
  logFilePath: './logs/requests.log',
  format: 'json',
  enabled: true,
  includeMethod: true,
  includeUrl: true,
  includeTimestamp: true,
  includeStatusCode: true,
  includeResponseTime: true,
}
```

`logFilePath` sets where the log file lives. `format` is reserved for future use if you want to switch to plain text. `enabled` is a kill switch for the entire logger. The `include` fields let you choose which pieces of information appear in each log entry. Setting any of them to `false` removes that field from the output.

## Error Handling

The most common thing that can go wrong during logging is a file system error. The log directory might not exist, the disk might be full, or the process might not have write permissions. Any of these would normally throw an error that could crash the server.

The file writer is built to catch all of these errors silently. If the write fails, it prints a warning to the server console with the message `[RequestLogger] Could not write to log file -- server continues normally` and the error detail. The request itself is never affected. The client gets their response normally regardless of whether the log write succeeded or not.

## Testing

Testing was done manually using Postman against the local development server running on port 3000. Ten requests were made across all endpoints to verify that the middleware correctly captured every request including successful ones, validation errors, and unknown routes.

### Test Results

| Test | Method | Endpoint | Expected Status | Result |
|------|--------|----------|-----------------|--------|
| Get all books | GET | /api/books | 200 | Pass |
| Get single book | GET | /api/books/1 | 200 | Pass |
| Get another book | GET | /api/books/3 | 200 | Pass |
| Add new book | POST | /api/books | 201 | Pass |
| Add another book | POST | /api/books | 201 | Pass |
| Missing required fields | POST | /api/books | 400 | Pass |
| Update book | PUT | /api/books/1 | 200 | Pass |
| Delete book | DELETE | /api/books/2 | 200 | Pass |
| Book not found | GET | /api/books/99 | 404 | Pass |
| Unknown route | GET | /api/somethingrandom | 404 | Pass |

All 10 tests passed. The middleware logged every single request including the 400 validation error and both 404 responses. The logger never blocked or delayed any request.

### Error Handling Test

To verify graceful error handling, the logFilePath in loggerConfig.js was temporarily changed to a non-existent directory. The server continued running normally and printed this message to the console:

```
[RequestLogger] Could not write to log file -- server continues normally
```

No request was blocked. No server crash occurred. The error handling works as intended.

### Verified Log Output

After all 10 test requests, the requests.log file contained exactly 10 entries. Each entry correctly captured the method, URL, status code, and response time for its corresponding request. The file grew by appending new lines and never overwrote existing entries.

## Deployment

### Platform

This application is deployed on Railway. Railway was chosen over Vercel because Vercel runs code as serverless functions which spin up and tear down on every request. There is no persistent process and no stable filesystem between requests which means fs.appendFile would either fail or write to a file that disappears immediately. Railway keeps the Node process running continuously just like a real server which is what this application needs.

### Live URL

The deployed API is accessible at the Railway URL added at the top of this file. You can hit any endpoint directly in a browser or Postman to verify it is running.

### Steps to Deploy

1. Push the project to a GitHub repository
2. Go to railway.app and create a new project
3. Select Deploy from GitHub repo and connect the repository
4. Railway automatically detects Node.js and runs npm install
5. Set the start command to node server.js
6. Add environment variable PORT with value 3000
7. Deploy and wait for the build to complete
8. Copy the generated Railway URL and add it to this README

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | The port the server listens on |
| NODE_ENV | development | Set to production on Railway |

### Production Consideration

The current implementation writes log entries to ./logs/requests.log on the local filesystem. This works correctly in development and on servers with persistent storage. Railway's free tier uses an ephemeral filesystem which means the log file resets when the service restarts or redeploys.

This is a known limitation of free hosting platforms and not a flaw in the middleware itself. The middleware code is production ready. For a real production deployment the storage layer would be swapped out by updating fileWriter.js to use one of these approaches instead:

- Persistent disk storage on a paid Railway or Render plan
- A database like MongoDB Atlas to store log entries as documents
- A dedicated logging service like Papertrail or Logtail which are purpose built for exactly this use case and have free tiers

The logFilePath value in loggerConfig.js is the only thing that needs changing between environments. The middleware itself stays completely untouched.

## Monitoring and Post-Deployment Checks

After deploying, the first check is to hit the root endpoint at the live URL and verify the API responds with the expected JSON. Then make a GET request to /api/books and open the log file to confirm a new entry was written with the correct method, URL, status code, and response time.

The responseTime field in each log entry is useful for spotting performance issues. Under normal conditions response times should be in single digit or low double digit milliseconds for simple read operations. If response times start climbing consistently above a few hundred milliseconds that indicates the middleware or the route handlers are slowing down and need investigation.

If logging ever causes problems in production, the enabled flag in loggerConfig.js acts as a kill switch. Setting it to false disables the entire logger without removing the middleware from the application or requiring a code change to the core logic.

When filtering server logs for logger specific issues, search for the prefix [RequestLogger] in the console output. Every error the logger produces uses this prefix which makes it easy to isolate from other application errors.

## Notes

I kept the file writing logic in its own utility file from the start because I knew the middleware would get messy if I mixed I/O code into it. If the storage approach ever changes, only that one file needs to be touched and the middleware stays the same.

Using res.on finish instead of trying to grab the status code at the top of the middleware was a deliberate choice. The status code simply does not exist yet when the request first arrives. It only gets set after a route handler actually sends a response, so the finish event is the right place to read it.

All 10 test cases passed cleanly, including the error handling test where I pointed the log path at a non-existent directory and the server kept running without missing a beat.

In a real production setup I would swap out the file based logging for something like Papertrail or a database. But for learning how middleware works and proving the concept, this approach does exactly what it needs to do.
