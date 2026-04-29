# Admin Service

The `Admin Service` is an internal infrastructure service responsible for auditing, action logging, and generating system-wide reports. It operates primarily as an event-driven worker, consuming events from Kafka to maintain a persistent record of administrative actions and system states.

## Role & Responsibilities
- **Internal Auditing**: Captures and stores logs of administrative actions for compliance and security.
- **Action Logging**: Maintains a history of changes made to entities across the system (Orders, Products, Users, etc.).
- **Reporting**: Aggregates data to generate reports on various metrics (e.g., product performance, sales reports).

---

## Internal Infrastructure

### Kafka Consumers
The service listens to the following Kafka topics:

| Topic | Event Type | Description |
| :--- | :--- | :--- |
| `create.admin.action.logs` | `AddActionLogEvent` | Logs a specific action performed by an administrator. |

---

## Data Models

### AdminActionLog
Used to track administrative actions.
- `adminActionLogId` (UUID): Unique identifier for the log entry.
- `adminId` (UUID): Reference to the administrator who performed the action.
- `action` (String): Description of the action performed.
- `note` (String): Additional context or details.
- `createdAt` (LocalDateTime): Timestamp of the action.
- `entityType` (EntityType): The type of entity affected (e.g., `ORDER`, `PRODUCT`).

### Report
Represents a generated system report.
- `reportId` (String): Unique identifier for the report.
- `adminId` (String): The administrator who requested/generated the report.
- `reportType` (ReportType): Type of report (e.g., `SALES`, `INVENTORY`).
- `name` (String): Human-readable name of the report.
- `link` (String): Storage link to the generated report file.

---

## Report Management (Admin Only)

### Create Monthly Revenue Report
#### 1. Overview
- Purpose: Generate and save a report for the last 12 months' revenue.
- Service: admin-service

#### 2. Endpoint
- `POST /api/admins/reports/monthly-revenue`

#### 3. Request
- Headers: `Authorization: Bearer <token>`
- Body: `CreateMonthlyRevenueReportRequest`
```json
{
  "reportItems": [
    {
      "month": "JANUARY",
      "revenue": 50000.00
    },
    ...
  ]
}
```

#### 4. Response
- Success: `BaseResponse<ReportResponse>`
```json
{
  "status": 200,
  "message": "Report created successfully",
  "data": {
    "reportId": "uuid...",
    "adminId": "uuid...",
    "reportType": "MONTHLY_REVENUE",
    "name": "revenue-report-...",
    "link": "https://cloudinary.com/...",
    "createdAt": "..."
  }
}
```

#### 5. Business Logic Notes
- The report is generated as an `.xlsx` file and uploaded to Cloudinary.
- Returns a link to the stored file.

#### 6. Dependencies / Data Flow
- Cloudinary Storage Service.
- VertX EventBus (`create.monthly.revenue.report`).

---

### Create Top Selling Products Report
#### 1. Overview
- Purpose: Generate and save a report for top selling products.
- Service: admin-service

#### 2. Endpoint
- `POST /api/admins/reports/top-selling-products`

#### 3. Request
- Headers: `Authorization: Bearer <token>`
- Body: `CreateTopSellingReportRequest`
```json
{
  "reportItems": [
    {
      "productId": "uuid...",
      "productName": "iPhone 15 Pro",
      "totalSold": 150
    },
    ...
  ]
}
```

#### 4. Response
- Success: `BaseResponse<ReportResponse>`

---

### Get Report by ID
#### 1. Overview
- Purpose: Retrieve details of a specific report.
- Service: admin-service

#### 2. Endpoint
- `GET /api/admins/reports/{reportId}`

#### 3. Request
- Path Params: `reportId` (UUID)

#### 4. Response
- Success: `BaseResponse<ReportResponse>`

---

### Query Reports (List)
#### 1. Overview
- Purpose: Retrieve a paginated list of reports with filters.
- Service: admin-service

#### 2. Endpoint
- `GET /api/admins/reports`

#### 3. Request
- Query Params:
    - `page` (int)
    - `size` (int)
    - `sortBy` (String)
    - `sortDirection` (String)
    - `fromDate` (String)
    - `toDate` (String)
    - `reportType` (String)

#### 4. Response
- Success: `PaginationBaseResponse<List<ReportResponse>>`

#### 5. Business Logic Notes
- Supports filtering by date range and report type.
