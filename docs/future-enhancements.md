# Future Enhancements & Ideas

## Performance Improvements

We should look into caching soon - probably Redis for the municipality and package lookups since those don't change often. The pricing rules could also benefit from caching, especially for the active ones.

For the history endpoints, we'll definitely need pagination once we start getting real data. The current approach of loading everything will become a problem. Cursor-based pagination would work well here, and we should add some basic filtering (date ranges, specific municipalities, etc.).

## Database Optimizations

Long term, we might want to think about partitioning the history table by date for really large datasets.

## API Features

The filtering is okay for now but could be better:
- Date range filtering (not just by year)
- Bulk price updates for admin operations
- Maybe some sort of rate limiting, especially if we expose this externally

## Monitoring & Ops

The logging is decent but we could make it better with correlation IDs to track requests across services. We should also start collecting some basic metrics - response times, DB query performance, that sort of thing.

The error handling covers the basics, but for production we'd want:
- Adding alerting

## Security & Auth
- Audit logging for price changes

## Scaling Considerations

Current setup should handle moderate load, but eventually we'll need:
- Read replicas for the database
- Maybe move to PostgreSQL for better performance and features

Could also add webhook notifications for price changes and batch import/export for bulk operations.
