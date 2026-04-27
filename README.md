This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Dashboard Analytics

The insights dashboard provides a data-driven overview of your career progression. Below is the logic behind the key metrics:

### 1. Active Pipeline
Represents the count of applications that are currently "live" within the selected date range.
- **Filter Logic**: It excludes any application containing terminal keywords such as `Rejected`, `Denied`, `Closed`, or `Withdrawn`.
- **Included Statuses**: All other states (e.g., `Applied`, `Interview`, `Negotiating`) are counted as part of the active funnel.

### 2. Application Momentum
A bar chart visualization of your submission volume over time.
- **Grouping**: Data is aggregated by month and year based on the `applicationDate`.
- **Range**: Dynamically updates to reflect the period selected in the dashboard filters.

### 3. Avg. Market Range
The average salary potential across your current opportunities.
- **Normalization**: Uses a `toYearly` utility to convert all salary periods (Hourly, Daily, Monthly) into a standardized **Gross Yearly** amount.
- **Calculation**: Computes the mean of the `grossSalTo` values for all applications in the active filtered set.

### 4. Status Analysis
A breakdown of your applications by their current stage, providing a snapshot of your funnel health and identifying where most opportunities are concentrated.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
